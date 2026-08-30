import { Devvit } from '@devvit/public-api';
import { appSettings } from './settings.js';
import { translations, TranslationStrings } from './i18n.js';

Devvit.configure({
  redditAPI: true,
  redis: true
});

Devvit.addSettings(appSettings);

// Typsicherer Fallback für Übersetzungen (verhindert TS18048)
function getTranslation(lang: string): TranslationStrings {
  return translations[lang] ?? translations['en']!;
}

// ==========================================
// FORM & MENU: TARGETED OP COMMENT WATCH
// ==========================================
const commentWatchForm = Devvit.createForm(
  {
    title: 'Enforce OP Reply to Comment',
    description: 'Notifies OP with a public reply and enforces that OP replies within the set timeframe.',
    fields: [
      {
        name: 'minutes',
        label: 'Wait time for OP reply (in minutes)',
        type: 'number',
        defaultValue: 60,
        required: true,
      },
      {
        name: 'action',
        label: 'Action if OP fails to reply',
        type: 'select',
        options: [
          { label: 'Remove entire post', value: 'remove_post' },
          { label: 'Filter entire post to modqueue', value: 'filter_post' },
          { label: 'Remove this comment', value: 'remove_comment' },
          { label: 'Filter this comment to modqueue', value: 'filter_comment' }
        ],
        defaultValue: ['remove_post'],
        multiSelect: false,
      },
      {
        name: 'custom_reply_text',
        label: 'Overwrite notification text (optional)',
        type: 'paragraph',
        helpText: 'Placeholders: {{op}}, {{minutes}}, {{commenter}}. Leave empty to use default text from App Settings.',
        defaultValue: '',
      }
    ],
    acceptLabel: 'Start Watching',
  },
  async (event, context) => {
    const commentId = await context.redis.get(`pending_watch_comment:${context.userId}`);
    if (!commentId) {
      context.ui.showToast({ text: 'Error: Session expired. Please try again.' });
      return;
    }
    await context.redis.del(`pending_watch_comment:${context.userId}`);

    const minutes = (event.values.minutes as number) ?? 60;
    const action = ((event.values.action as string[]) ?? ['remove_post'])[0] ?? 'remove_post';
    const customText = (event.values.custom_reply_text as string)?.trim();

    try {
      const comment = await context.reddit.getCommentById(commentId);
      const post = await context.reddit.getPostById(comment.postId);
      const targetAuthor = post.authorName;

      if (!targetAuthor || targetAuthor === '[deleted]') {
        context.ui.showToast({ text: 'Cannot watch a deleted post or author.' });
        return;
      }

      const settings = await context.settings.getAll();
      const settingsDefaultText = (settings.manual_watch_default_text as string)?.trim();

      const langArray = (settings.language as string[]) ?? ['en'];
      const lang = langArray[0] ?? 'en';
      const t = getTranslation(lang);

      // Textauflösung: Formulardaten -> Subreddit-Settings -> i18n
      let text = customText || settingsDefaultText || t.manual_watch_comment;

      text = text
        .replace(/{{op}}/g, `u/${post.authorName}`)
        .replace(/{{target}}/g, `u/${post.authorName}`)
        .replace(/{{minutes}}/g, minutes.toString())
        .replace(/{{commenter}}/g, `u/${comment.authorName}`)
        .replace(/{{user}}/g, `u/${comment.authorName}`);

      if (!text.includes(`u/${post.authorName}`)) {
        text += `\n\ncc: u/${post.authorName}`;
      }

      const botComment = await context.reddit.submitComment({
        id: comment.id,
        text,
      });
      await botComment.distinguish(true);
      const botCommentId = botComment.id;

      const runAt = new Date(Date.now() + minutes * 60 * 1000);

      const jobId = await context.scheduler.runJob({
        name: 'comment-watch-timeout',
        data: {
          commentId,
          postId: post.id,
          targetAuthor,
          action,
          minutes,
        },
        runAt,
      });

      const watchData = JSON.stringify({
        jobId,
        postId: post.id,
        commentId,
        botCommentId,
        targetAuthor,
        action,
        minutes
      });

      const expireAt = new Date(runAt.getTime() + 24 * 60 * 60 * 1000);
      await context.redis.set(`watch:comment:${commentId}`, watchData, { expiration: expireAt });
      await context.redis.set(`watch:comment:${botCommentId}`, commentId, { expiration: expireAt });

      console.log(`👁️ [Manual Watch] Mod ${context.userId} started OP reply watchdog on comment ${commentId} (Post: ${post.id}). OP u/${targetAuthor} has ${minutes}m. Action: '${action}'.`);
      context.ui.showToast({ text: `⏱️ Watchdog active: OP u/${targetAuthor} has ${minutes} min to reply.` });

    } catch (err) {
      console.error(`[ERROR] Failed to start comment watch:`, err);
      context.ui.showToast({ text: 'Failed to start watchdog on comment.' });
    }
  }
);

Devvit.addMenuItem({
  label: 'Enforce OP Reply to Comment',
  location: 'comment',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const commentId = event.targetId;
    console.log(`🕵️ [Manual Watch] Mod ${context.userId} opened OP reply watch form for comment ${commentId}`);

    await context.redis.set(`pending_watch_comment:${context.userId}`, commentId, {
      expiration: new Date(Date.now() + 5 * 60 * 1000),
    });
    context.ui.showForm(commentWatchForm);
  },
});

// ==========================================
// SCHEDULER 1: TARGETED COMMENT TIMEOUT
// ==========================================
Devvit.addSchedulerJob({
  name: 'comment-watch-timeout',
  onRun: async (event, context) => {
    const commentId = event.data?.commentId as string;
    const postId = event.data?.postId as string;
    const targetAuthor = event.data?.targetAuthor as string;
    const action = (event.data?.action as string) ?? 'remove_post';
    const minutes = (event.data?.minutes as number) ?? 60;
    if (!commentId || !postId) return;

    const rawData = await context.redis.get(`watch:comment:${commentId}`);
    if (!rawData) return; 

    try {
      const watchData = JSON.parse(rawData);
      await context.redis.del(`watch:comment:${commentId}`);
      if (watchData.botCommentId) {
        await context.redis.del(`watch:comment:${watchData.botCommentId}`);
      }

      const settings = await context.settings.getAll();
      const langArray = (settings.language as string[]) ?? ['en'];
      const lang = langArray[0] ?? 'en';
      const t = getTranslation(lang);

      const note = t.manual_watch_note.replace(/{{minutes}}/g, minutes.toString());

      if (action === 'remove_post') {
        const post = await context.reddit.getPostById(postId);
        if (!post.isRemoved()) {
          await post.remove(false);
          await post.addRemovalNote({ reasonId: '', modNote: note });
        }
      } else if (action === 'filter_post') {
        const post = await context.reddit.getPostById(postId);
        await context.reddit.report(post, { reason: note });
      } else if (action === 'remove_comment') {
        const comment = await context.reddit.getCommentById(commentId);
        if (!comment.isRemoved()) {
          await comment.remove(false);
        }
      } else if (action === 'filter_comment') {
        const comment = await context.reddit.getCommentById(commentId);
        await context.reddit.report(comment, { reason: note });
      }

      console.log(`⏰ [Manual Watch] Action '${action}' executed on post ${postId} (OP u/${targetAuthor} timed out).`);
    } catch (err) {
      console.error(`[ERROR] Failed to execute comment watch timeout:`, err);
    }
  }
});

// ==========================================
// SCHEDULER 2: STANDARD THREAD TIMERS
// ==========================================
Devvit.addSchedulerJob({
  name: 'delayed-action',
  onRun: async (event, context) => {
    const postId = event.data?.postId as string;
    const timerType = event.data?.timerType as string; 
    const xy = event.data?.xy as number | undefined;
    if (!postId || !timerType) return;

    try {
      const currentState = await context.redis.get(`state:${postId}`);
      if (!currentState) return;

      await context.redis.del(`timer:${timerType}:${postId}`);
      
      if (timerType !== 'reply_warning') {
        await context.redis.del(`state:${postId}`); 
      }

      let post;
      try {
        post = await context.reddit.getPostById(postId);
      } catch (e) {
        console.log(`🛑 Post ${postId} is no longer accessible. Canceling action.`);
        await context.redis.del(`state:${postId}`); 
        await context.redis.del(`timer:empty:${postId}`);
        await context.redis.del(`timer:reply_final:${postId}`);
        await context.redis.del(`timer:reply_warning:${postId}`);
        return;
      }

      const isPostDeleted = post.authorName === '[deleted]' || post.body === '[deleted]';
      if (post.isRemoved() || isPostDeleted) {
        console.log(`🛑 Post ${postId} is already removed or deleted. Canceling action.`);
        await context.redis.del(`state:${postId}`); 
        await context.redis.del(`timer:empty:${postId}`);
        await context.redis.del(`timer:reply_final:${postId}`);
        await context.redis.del(`timer:reply_warning:${postId}`);
        return;
      }

      if (timerType === 'reply_warning' || timerType === 'reply_final') {
        const t3PostId = (postId.startsWith('t3_') ? postId : `t3_${postId}`) as `t3_${string}`;
        const recentComments = await context.reddit.getComments({ postId: t3PostId, limit: 100, sort: 'new' }).all();
        const hasVisibleCommunityComments = recentComments.some(c => 
          c.authorName !== post.authorName && 
          c.authorName !== '[deleted]' && 
          c.body !== '[deleted]' &&
          !c.isRemoved()
        );

        if (!hasVisibleCommunityComments) {
          console.log(`🛑 All community comments on ${postId} were filtered or removed. OP cannot reply. Resetting state.`);
          await context.redis.set(`state:${postId}`, 'waiting', { expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
          return;
        }
      }

      const settings = await context.settings.getAll();
      const currentSubreddit = post.subredditName; 

      const langArray = (settings.language as string[]) ?? ['en'];
      const lang = langArray[0] ?? 'en';
      const t = getTranslation(lang);

      let selectedAction = 'none';
      let notificationType = 'none';
      let rawNotificationText = '';
      let rawSubject = '';
      let waitTime = 60;
      let modNoteText = '';

      if (timerType === 'empty') {
        selectedAction = ((settings.empty_action as string[]) ?? [])[0] ?? 'none';
        notificationType = ((settings.empty_notification_type as string[]) ?? [])[0] ?? 'none';
        rawNotificationText = (settings.empty_notification_text as string)?.trim() || t.empty_post;
        rawSubject = (settings.empty_subject as string)?.trim() || t.subject_empty;
        waitTime = (settings.empty_wait_time_minutes as number) ?? 60;
        modNoteText = t.mod_note_empty;
        console.log(`⏰ [Timer 1] Empty post ${postId}. Action: ${selectedAction}`);

      } else if (timerType === 'reply_final') {
        selectedAction = ((settings.reply_action as string[]) ?? [])[0] ?? 'remove';
        notificationType = ((settings.reply_notification_type as string[]) ?? [])[0] ?? 'none';
        rawNotificationText = (settings.reply_notification_text as string)?.trim() || t.reply_post;
        rawSubject = (settings.reply_subject as string)?.trim() || t.subject_reply;
        waitTime = (settings.reply_wait_time_minutes as number) ?? 60;
        modNoteText = t.mod_note_reply;
        console.log(`⏰ [Timer 3] Unanswered post ${postId}. Action: ${selectedAction}`);

      } else if (timerType === 'reply_warning') {
        selectedAction = ((settings.reply_action as string[]) ?? [])[0] ?? 'remove'; 
        notificationType = ((settings.warning_notification_type as string[]) ?? [])[0] ?? 'none';
        rawNotificationText = (settings.warning_notification_text as string)?.trim() || t.warning_post;
        rawSubject = (settings.warning_subject as string)?.trim() || t.subject_warning;
        console.log(`⏰ [Timer 2] WARNING for post ${postId}.`);
      }

      if (selectedAction === 'none' && notificationType === 'none') {
        return;
      }

      let actionText = t.action_flagged;
      if (selectedAction === 'remove') actionText = t.action_removed;
      if (selectedAction === 'filter') actionText = t.action_filtered;

      const modmailMarkdownLink = `[Modmail](https://www.reddit.com/message/compose?to=/r/${currentSubreddit})`;
      const formattedNotificationText = rawNotificationText
        .replace(/{{author}}/g, post.authorName)
        .replace(/{{action}}/g, actionText)
        .replace(/{{x}}/g, waitTime.toString())
        .replace(/{{xy}}/g, (xy ?? 0).toString())
        .replace(/Modmail/g, modmailMarkdownLink);

      if (timerType !== 'reply_warning') {
        if (selectedAction === 'remove') {
          await post.remove(false);
          await post.addRemovalNote({ reasonId: '', modNote: modNoteText });
        } else if (selectedAction === 'filter') {
          await context.reddit.report(post, { reason: modNoteText });
        }
      }

      if (notificationType === 'comment') {
        const comment = await post.addComment({ text: formattedNotificationText });
        await comment.distinguish(true); 
      } else if (notificationType === 'modmail') {
        await context.reddit.modMail.createConversation({
          subredditName: currentSubreddit, 
          to: post.authorName,
          subject: rawSubject,
          body: formattedNotificationText,
          isAuthorHidden: true
        });
      }

    } catch (error) {
      console.error(`[ERROR] Failed to execute action:`, error);
    }
  }
});

// ==========================================
// TRIGGER 1: POST SUBMIT
// ==========================================
Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: async (event, context) => {
    if (!event.post || !event.post.id || !context.subredditName) return;

    try {
      const settings = await context.settings.getAll();
      const currentPost = await context.reddit.getPostById(event.post.id);
      
      const postFlair = currentPost.flair?.text;
      const ignoredFlairsStr = (settings.ignored_flairs as string) ?? "";
      if (ignoredFlairsStr !== "" && postFlair) {
        const ignoredFlairs = ignoredFlairsStr.split(',').map(f => f.trim().toLowerCase());
        if (ignoredFlairs.includes(postFlair.toLowerCase())) {
          console.log(`⏭️ Skipping post ${event.post.id}: Flair ignored.`);
          return; 
        }
      }

      const authorName = event.author?.name;
      const subredditName = context.subredditName;

      if (authorName) {
        const ignoreMods = (settings.ignore_moderators as boolean) ?? true;
        if (ignoreMods) {
          const mods = await context.reddit.getModerators({ subredditName }).all();
          if (mods.some(m => m.username === authorName)) return; 
        }

        const ignoreApproved = (settings.ignore_approved_users as boolean) ?? true;
        if (ignoreApproved) {
          const approvedUsers = await context.reddit.getApprovedUsers({ subredditName }).all();
          if (approvedUsers.some(u => u.username === authorName)) return;
        }

        try {
          const user = await context.reddit.getUserByUsername(authorName);
          if (user) {
            const ignoreVerifiedEmail = (settings.ignore_verified_email as boolean) ?? false;
            if (ignoreVerifiedEmail && user.hasVerifiedEmail) return;

            const ignoreTotalKarma = (settings.ignore_total_karma as number) ?? 0;
            if (ignoreTotalKarma > 0) {
              const totalKarma = (user.commentKarma ?? 0) + (user.linkKarma ?? 0);
              if (totalKarma >= ignoreTotalKarma) return;
            }

            const ignoreCommunityKarma = (settings.ignore_community_karma as number) ?? 0;
            if (ignoreCommunityKarma > 0) {
              try {
                const subKarmaData = await user.getUserKarmaFromCurrentSubreddit() as any;
                const subKarma = (subKarmaData?.commentKarma ?? 0) + (subKarmaData?.linkKarma ?? 0);
                if (subKarma >= ignoreCommunityKarma) return;
              } catch (err) {}
            }
          }
        } catch (err) {}
      }

      const stateExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await context.redis.set(`state:${event.post.id}`, 'waiting', { expiration: stateExpireAt });

      const isEnabled = (settings.enable_timer_1 as boolean) ?? true;
      if (isEnabled) {
        const waitTime = (settings.empty_wait_time_minutes as number) ?? 60;
        const runAt = new Date(Date.now() + waitTime * 60 * 1000);
        
        const jobId = await context.scheduler.runJob({
          name: 'delayed-action',
          data: { postId: event.post.id, timerType: 'empty' },
          runAt: runAt
        });
        
        const expireAt = new Date(runAt.getTime() + 24 * 60 * 60 * 1000); 
        await context.redis.set(`timer:empty:${event.post.id}`, jobId, { expiration: expireAt });
        console.log(`⏱️ [Timer 1] Empty post watchdog started for ${event.post.id}`);
      } else {
        console.log(`⏭️ [Timer 1] Disabled. Tracking state only for ${event.post.id}.`);
      }

    } catch (error) {
      console.error(`[ERROR] Failed to process new post:`, error);
    }
  }
});

// ==========================================
// TRIGGER 2: COMMENT CREATE
// ==========================================
Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    if (!event.comment || !event.comment.postId) return;
    
    const postId = event.comment.postId;
    const parentId = event.comment.parentId;

    try {
      const post = await context.reddit.getPostById(postId);
      const fullComment = await context.reddit.getCommentById(event.comment.id);
      const commentAuthorName = fullComment.authorName;
      const isOP = commentAuthorName === post.authorName;

      // 1. ZIELGERICHTETE OP-KOMMENTAR-ÜBERWACHUNG PRÜFEN
      if (parentId) {
        let lookupKey = parentId;
        let storedData = await context.redis.get(`watch:comment:${lookupKey}`);

        if (storedData && !storedData.startsWith('{')) {
          lookupKey = storedData;
          storedData = await context.redis.get(`watch:comment:${lookupKey}`);
        }

        if (storedData && isOP) {
          const watchData = JSON.parse(storedData);
          if (watchData.jobId) {
            await context.scheduler.cancelJob(watchData.jobId);
          }
          await context.redis.del(`watch:comment:${lookupKey}`);
          if (watchData.botCommentId) {
            await context.redis.del(`watch:comment:${watchData.botCommentId}`);
          }
          console.log(`🎯 OP replied to watched comment thread ${lookupKey}! Canceled targeted watchdog.`);
        }
      }

      // 2. ALLGEMEINE POST-ÜBERWACHUNG
      const currentState = await context.redis.get(`state:${postId}`);
      if (!currentState) return;

      if (!isOP) {
        const isCommentDeleted = fullComment.authorName === '[deleted]' || fullComment.body === '[deleted]';
        if (fullComment.isRemoved() || isCommentDeleted) {
          console.log(`⏭️ Community comment on ${postId} was instantly removed/filtered. Ignoring.`);
          return;
        }
      }

      if (isOP) {
        const settings = await context.settings.getAll();
        const minLength = (settings.min_op_comment_length as number) ?? 0;
        
        if (minLength > 0) {
          const commentLength = (fullComment.body || "").trim().length;
          if (commentLength < minLength) {
            console.log(`🛑 [Low Effort] OP replied, but comment is too short (${commentLength} < ${minLength} chars). Ignoring.`);
            return;
          }
        }

        console.log(`🛑 OP replied validly on ${postId}. Canceling ALL thread timers.`);
        
        const emptyJobId = await context.redis.get(`timer:empty:${postId}`);
        if (emptyJobId) { await context.scheduler.cancelJob(emptyJobId); await context.redis.del(`timer:empty:${postId}`); }

        const finalJobId = await context.redis.get(`timer:reply_final:${postId}`);
        if (finalJobId) { await context.scheduler.cancelJob(finalJobId); await context.redis.del(`timer:reply_final:${postId}`); }

        const warningJobId = await context.redis.get(`timer:reply_warning:${postId}`);
        if (warningJobId) { await context.scheduler.cancelJob(warningJobId); await context.redis.del(`timer:reply_warning:${postId}`); }

        await context.redis.del(`state:${postId}`);
        return;
      }

      if (currentState === 'waiting') {
        console.log(`💬 Community replied on ${postId}. Switching to OP Reply watchdog.`);
        await context.redis.set(`state:${postId}`, 'community_replied', { expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        
        const emptyJobId = await context.redis.get(`timer:empty:${postId}`);
        if (emptyJobId) { 
          await context.scheduler.cancelJob(emptyJobId); 
          await context.redis.del(`timer:empty:${postId}`); 
        }

        const settings = await context.settings.getAll();
        const isTimer2Enabled = (settings.enable_timer_2 as boolean) ?? true;
        const warningEnabled = (settings.enable_warning_timer as boolean) ?? false;

        if (!isTimer2Enabled && !warningEnabled) {
          console.log(`⏭️ [Timer 2 & 3] Both disabled. No further action for ${postId}.`);
          return;
        }

        const finalTime = (settings.reply_wait_time_minutes as number) ?? 60;
        const warningTime = (settings.warning_wait_time_minutes as number) ?? 45;

        if (isTimer2Enabled) {
          const runAtFinal = new Date(Date.now() + finalTime * 60 * 1000);
          const finalJobId = await context.scheduler.runJob({
            name: 'delayed-action',
            data: { postId, timerType: 'reply_final' },
            runAt: runAtFinal
          });
          await context.redis.set(`timer:reply_final:${postId}`, finalJobId, { expiration: new Date(runAtFinal.getTime() + 24 * 60 * 60 * 1000) });
          console.log(`⏱️ [Timer 3] Final reply watchdog started for ${postId}`);
        }

        if (warningEnabled) {
          let remainingMinutes = 0;
          
          if (isTimer2Enabled && warningTime < finalTime) {
            remainingMinutes = finalTime - warningTime;
          }

          const runAtWarn = new Date(Date.now() + warningTime * 60 * 1000);
          const warningJobId = await context.scheduler.runJob({
            name: 'delayed-action',
            data: { postId, timerType: 'reply_warning', xy: remainingMinutes },
            runAt: runAtWarn
          });
          await context.redis.set(`timer:reply_warning:${postId}`, warningJobId, { expiration: new Date(runAtWarn.getTime() + 24 * 60 * 60 * 1000) });
          console.log(`⏱️ [Timer 2] Warning watchdog started for ${postId}`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] Failed to process comment check:`, error);
    }
  }
});

export default Devvit;