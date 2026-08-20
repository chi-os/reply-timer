import { Devvit } from '@devvit/public-api';
import { appSettings } from './settings.js';
import { translations } from './i18n.js';

Devvit.configure({
  redditAPI: true,
  redis: true
});

Devvit.addSettings(appSettings);

// ==========================================
// SCHEDULER (The Alarm Handler)
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

      const settings = await context.settings.getAll();
      const post = await context.reddit.getPostById(postId);
      const currentSubreddit = post.subredditName; 

      const langArray = (settings.language as string[]) ?? ['en'];
      const lang = langArray[0] ?? 'en';
      const t = translations[lang] || translations['en'];
      const autoArchiveModmails = (settings.auto_archive_modmails as boolean) ?? false;

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

      // ... vorheriger Code ...

      if (notificationType === 'comment') {
        const comment = await post.addComment({ text: formattedNotificationText });
        await comment.distinguish(true); 
      } else if (notificationType === 'modmail') {
        
        // Prüfen, ob der User existiert
        if (post.authorName && post.authorName !== '[deleted]') {
          
          // 1. Modmail senden und Antwort speichern
          const modmailResponse = await context.reddit.modMail.createConversation({
            subredditName: currentSubreddit, 
            to: post.authorName,
            subject: rawSubject,
            body: formattedNotificationText,
            isAuthorHidden: true
          });
          
          // 2. Prüfen ob archiviert werden soll
          if (autoArchiveModmails && modmailResponse.conversation?.id) {
            try {
              await context.reddit.modMail.archiveConversation(modmailResponse.conversation.id);
              console.log(`[Info] Modmail ${modmailResponse.conversation.id} instantly archived.`);
            } catch (archiveError) {
              console.log(`[Info] Could not archive Modmail (likely an internal conversation with a moderator). ID: ${modmailResponse.conversation.id}`);
            }
          }
          
        } else {
          // Fallback, falls der Account gelöscht wurde
          console.log(`[Info] Account deleted. Skipping modmail for post ${postId}`);
        }
      }

    } catch (error) {
      console.error(`[ERROR] Failed to execute action:`, error);
    }
  }
});

// ==========================================
// TRIGGER 1: POST SUBMIT
// ==========================================

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
    // Robuster Check: Wir brauchen nur den Kommentar und seine Post-ID
    if (!event.comment || !event.comment.postId) return;
    
    const postId = event.comment.postId;
    const currentState = await context.redis.get(`state:${postId}`);
    
    // Wenn der Post nicht überwacht wird, direkt stumm abbrechen
    if (!currentState) return;

    try {
      const post = await context.reddit.getPostById(postId);
      
      // Fallback, falls event.author durch die API nicht definiert ist:
      const commentAuthorName = event.author?.name || (await context.reddit.getCommentById(event.comment.id)).authorName;
      const isOP = commentAuthorName === post.authorName;

      // OP HAT GEANTWORTET -> Alles beenden
      if (isOP) {
        console.log(`🛑 OP replied on ${postId}. Canceling ALL timers.`);
        
        const emptyJobId = await context.redis.get(`timer:empty:${postId}`);
        if (emptyJobId) { await context.scheduler.cancelJob(emptyJobId); await context.redis.del(`timer:empty:${postId}`); }

        const finalJobId = await context.redis.get(`timer:reply_final:${postId}`);
        if (finalJobId) { await context.scheduler.cancelJob(finalJobId); await context.redis.del(`timer:reply_final:${postId}`); }

        const warningJobId = await context.redis.get(`timer:reply_warning:${postId}`);
        if (warningJobId) { await context.scheduler.cancelJob(warningJobId); await context.redis.del(`timer:reply_warning:${postId}`); }

        await context.redis.del(`state:${postId}`);
        return;
      }

      // COMMUNITY HAT GEANTWORTET -> Timer umschalten
      if (currentState === 'waiting') {
        console.log(`💬 Community replied on ${postId}. Switching to OP Reply watchdog.`);
        await context.redis.set(`state:${postId}`, 'community_replied', { expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        
        // Timer 1 sauber abbrechen
        const emptyJobId = await context.redis.get(`timer:empty:${postId}`);
        if (emptyJobId) { 
          await context.scheduler.cancelJob(emptyJobId); 
          await context.redis.del(`timer:empty:${postId}`); 
        }

        const settings = await context.settings.getAll();
        const isTimer2Enabled = (settings.enable_timer_2 as boolean) ?? true;
        const warningEnabled = (settings.enable_warning_timer as boolean) ?? false;

        // Abbrechen, wenn BEIDE Reply-Timer aus sind
        if (!isTimer2Enabled && !warningEnabled) {
          console.log(`⏭️ [Timer 2 & 3] Both disabled. No further action for ${postId}.`);
          return;
        }

        const finalTime = (settings.reply_wait_time_minutes as number) ?? 60;
        const warningTime = (settings.warning_wait_time_minutes as number) ?? 45;

        // Final Timer starten (falls aktiviert)
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

        // Warning Timer starten (falls aktiviert)
        if (warningEnabled) {
          let remainingMinutes = 0;
          
          // Wir können nur eine Restzeit berechnen, wenn der Final-Timer auch wirklich läuft
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