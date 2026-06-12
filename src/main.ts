import { Devvit } from '@devvit/public-api';
import { appSettings } from './settings.js';

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
    if (!postId || !timerType) return;

    try {
      // 1. Datenbank aufräumen
      await context.redis.del(`timer:${timerType}:${postId}`);
      await context.redis.del(`state:${postId}`); 

      const settings = await context.settings.getAll();
      const post = await context.reddit.getPostById(postId);
      const currentSubreddit = post.subredditName; // Kugelsicherer String

      let selectedAction = 'none';
      let notificationType = 'none';
      let rawNotificationText = '';
      let waitTime = 60;
      let modNoteText = '';

      // 2. Werte sauber laden
      if (timerType === 'empty') {
        const actionArray = (settings.empty_action as string[]) ?? [];
        selectedAction = actionArray[0] ?? 'none';
        
        const notifArray = (settings.empty_notification_type as string[]) ?? [];
        notificationType = notifArray[0] ?? 'none';
        
        rawNotificationText = (settings.empty_notification_text as string) ?? "";
        waitTime = (settings.empty_wait_time_minutes as number) ?? 60;
        modNoteText = "Automatically actioned: Wait time expired and post remained empty.";
        
        console.log(`⏰ [Timer 1] ringing for empty post ${postId}. Action: ${selectedAction}`);
      } else if (timerType === 'reply') {
        const actionArray = (settings.reply_action as string[]) ?? [];
        selectedAction = actionArray[0] ?? 'remove';
        
        const notifArray = (settings.reply_notification_type as string[]) ?? [];
        notificationType = notifArray[0] ?? 'none';
        
        rawNotificationText = (settings.reply_notification_text as string) ?? "";
        waitTime = (settings.reply_wait_time_minutes as number) ?? 60;
        modNoteText = "Automatically actioned: Wait time expired and OP did not reply.";

        console.log(`⏰ [Timer 2] ringing for unanswered post ${postId}. Action: ${selectedAction}`);
      }

      // Wenn beides "none" ist, beenden wir direkt.
      if (selectedAction === 'none' && notificationType === 'none') {
        console.log(`⏭️ Post ${postId} requires no action for this scenario.`);
        return;
      }

      // 3. Platzhalter formatieren (Angepasste Grammatik für "Do nothing")
      let actionText = 'flagged (but no action was taken)';
      if (selectedAction === 'remove') actionText = 'removed';
      if (selectedAction === 'filter') actionText = 'filtered to the modqueue';

      const modmailMarkdownLink = `[Modmail](https://www.reddit.com/message/compose?to=/r/${currentSubreddit})`;
      const formattedNotificationText = rawNotificationText
        .replace(/{{author}}/g, post.authorName)
        .replace(/{{action}}/g, actionText)
        .replace(/{{x}}/g, waitTime.toString())
        .replace(/Modmail/g, modmailMarkdownLink);

      // 4. Moderationsaktion ausführen
      if (selectedAction === 'remove') {
        await post.remove(false);
        await post.addRemovalNote({ reasonId: '', modNote: modNoteText });
        console.log(`🗑️ Post ${postId} successfully removed.`);
      } else if (selectedAction === 'filter') {
        await context.reddit.report(post, { reason: modNoteText });
        console.log(`🛡️ Post ${postId} filtered to modqueue.`);
      }

      // 5. Benachrichtigung absenden
      if (notificationType === 'comment') {
        const comment = await post.addComment({ text: formattedNotificationText });
        await comment.distinguish(true); 
        console.log(`💬 Stickied comment added to post ${postId}.`);
      } else if (notificationType === 'modmail') {
        await context.reddit.modMail.createConversation({
          subredditName: currentSubreddit, 
          to: post.authorName,
          subject: "Automated Subreddit Notification",
          body: formattedNotificationText,
          isAuthorHidden: true
        });
        console.log(`✉️ Modmail notification sent to author ${post.authorName}.`);
      }

    } catch (error) {
      console.error(`[ERROR] Failed to execute action:`, error);
    }
  }
});

// ==========================================
// TRIGGER 1: New Post Check (Starts Timer 1)
// ==========================================
Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: async (event, context) => {
    if (!event.post || !event.post.id || !context.subredditName) return;

    try {
      const settings = await context.settings.getAll();

      // Berechtigungsprüfungen (Flairs)
      const currentPost = await context.reddit.getPostById(event.post.id);
      const postFlair = currentPost.flair?.text;
      const ignoredFlairsStr = (settings.ignored_flairs as string) ?? "";

      if (ignoredFlairsStr !== "" && postFlair) {
        const ignoredFlairs = ignoredFlairsStr.split(',').map(f => f.trim().toLowerCase());
        const postFlairLower = postFlair.toLowerCase();
        if (ignoredFlairs.includes(postFlairLower)) {
          console.log(`⏭️ Skipping post ${event.post.id}: Flair '${postFlair}' is safely ignored.`);
          return; 
        }
      }

      const authorName = event.author?.name;
      const subredditName = context.subredditName;

      // Erweiterte User-Prüfungen (Mods, Approved, Karma, Email)
      if (authorName) {
        const ignoreMods = (settings.ignore_moderators as boolean) ?? true;
        if (ignoreMods) {
          const mods = await context.reddit.getModerators({ subredditName }).all();
          if (mods.some(m => m.username === authorName)) {
            console.log(`⏭️ Skipping post ${event.post.id}: Author is a moderator.`);
            return; 
          }
        }

        const ignoreApproved = (settings.ignore_approved_users as boolean) ?? true;
        if (ignoreApproved) {
          const approvedUsers = await context.reddit.getApprovedUsers({ subredditName }).all();
          if (approvedUsers.some(u => u.username === authorName)) {
            console.log(`⏭️ Skipping post ${event.post.id}: Author is an approved user.`);
            return;
          }
        }

        try {
          const user = await context.reddit.getUserByUsername(authorName);
          
          if (user) {
            const ignoreVerifiedEmail = (settings.ignore_verified_email as boolean) ?? false;
            if (ignoreVerifiedEmail && user.hasVerifiedEmail) {
              console.log(`⏭️ Skipping post ${event.post.id}: Author has a verified email.`);
              return;
            }

            const ignoreTotalKarma = (settings.ignore_total_karma as number) ?? 0;
            if (ignoreTotalKarma > 0) {
              const totalKarma = (user.commentKarma ?? 0) + (user.linkKarma ?? 0);
              if (totalKarma >= ignoreTotalKarma) {
                console.log(`⏭️ Skipping post ${event.post.id}: Author has ${totalKarma} total karma (limit: ${ignoreTotalKarma}).`);
                return;
              }
            }

            const ignoreCommunityKarma = (settings.ignore_community_karma as number) ?? 0;
            if (ignoreCommunityKarma > 0) {
              try {
                const subKarmaData = await user.getUserKarmaFromCurrentSubreddit() as any;
                const subKarma = (subKarmaData?.commentKarma ?? 0) + (subKarmaData?.linkKarma ?? 0);
                
                if (subKarma >= ignoreCommunityKarma) {
                  console.log(`⏭️ Skipping post ${event.post.id}: Author has ${subKarma} community karma (limit: ${ignoreCommunityKarma}).`);
                  return;
                }
              } catch (err) {
                console.warn(`[WARN] Could not fetch community karma for ${authorName}. Continuing with remaining logic.`);
              }
            }
          } else {
            console.warn(`[WARN] User API returned undefined for ${authorName} (possibly shadowbanned/deleted). Skipping karma/email checks.`);
          }
        } catch (err) {
          console.warn(`[WARN] Error fetching user profile for ${authorName}. Continuing.`);
        }
      }

      // STATE TRACKING
      const stateExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await context.redis.set(`state:${event.post.id}`, 'waiting', { expiration: stateExpireAt });

      // Prüfen, ob Timer 1 gewünscht ist
      const enableTimer1 = (settings.enable_timer_1 as boolean) ?? true;

      if (enableTimer1) {
        const waitTime = (settings.empty_wait_time_minutes as number) ?? 60;
        const runAt = new Date(Date.now() + waitTime * 60 * 1000);

        const jobId = await context.scheduler.runJob({
          name: 'delayed-action',
          data: { postId: event.post.id, timerType: 'empty' },
          runAt: runAt,
        });

        const expireAt = new Date(runAt.getTime() + 24 * 60 * 60 * 1000); 
        await context.redis.set(`timer:empty:${event.post.id}`, jobId, { expiration: expireAt });
        console.log(`⏱️ [Timer 1] started for empty post ${event.post.id} (${waitTime} min).`);
      } else {
        console.log(`⏭️ [Timer 1] is DISABLED in settings. Post is tracked, but no timer started.`);
      }

    } catch (error) {
      console.error(`[ERROR] Failed to process new post:`, error);
    }
  }
});

// ==========================================
// TRIGGER 2: Comment Watchdog (Handles Timer switching)
// ==========================================
Devvit.addTrigger({
  event: 'CommentCreate',
  onEvent: async (event, context) => {
    if (!event.comment || !event.comment.postId || !event.author || !context.subredditName) return;

    try {
      const postId = event.comment.postId;
      
      const state = await context.redis.get(`state:${postId}`);
      if (!state) return; 

      const post = await context.reddit.getPostById(postId);
      const isOP = event.author.id === post.authorId;

      if (isOP) {
        const emptyJobId = await context.redis.get(`timer:empty:${postId}`);
        if (emptyJobId) {
          await context.scheduler.cancelJob(emptyJobId);
          await context.redis.del(`timer:empty:${postId}`);
        }

        const replyJobId = await context.redis.get(`timer:reply:${postId}`);
        if (replyJobId) {
          await context.scheduler.cancelJob(replyJobId);
          await context.redis.del(`timer:reply:${postId}`);
        }
        
        await context.redis.del(`state:${postId}`);
        console.log(`🛑 OP replied on post ${postId}! All timers cancelled. Post is safe.`);
        
      } else {
        if (state === 'waiting') {
          await context.redis.set(`state:${postId}`, 'community_replied', { expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
          
          const emptyJobId = await context.redis.get(`timer:empty:${postId}`);
          if (emptyJobId) {
            await context.scheduler.cancelJob(emptyJobId);
            await context.redis.del(`timer:empty:${postId}`);
            console.log(`👤 First community comment detected on ${postId}. Cancelling Timer 1.`);
          }

          const settings = await context.settings.getAll();
          const enableTimer2 = (settings.enable_timer_2 as boolean) ?? true;
          
          if (enableTimer2) {
            const waitTime = (settings.reply_wait_time_minutes as number) ?? 60;
            const runAt = new Date(Date.now() + waitTime * 60 * 1000);

            const newJobId = await context.scheduler.runJob({
              name: 'delayed-action',
              data: { postId: postId, timerType: 'reply' },
              runAt: runAt,
            });

            const expireAt = new Date(runAt.getTime() + 24 * 60 * 60 * 1000); 
            await context.redis.set(`timer:reply:${postId}`, newJobId, { expiration: expireAt });
            console.log(`⏱️ [Timer 2] started for OP reply on post ${postId} (${waitTime} min).`);
          } else {
            console.log(`⏭️ [Timer 2] is DISABLED in settings. No reply timer started.`);
          }
        }
      }

    } catch (error) {
      console.error(`[ERROR] Failed to process comment check:`, error);
    }
  }
});

export default Devvit;