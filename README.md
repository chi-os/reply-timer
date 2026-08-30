A highly flexible Reddit moderation bot built on the Devvit platform. This app ensures active thread engagement by monitoring critical phases of a post's lifecycle using an intelligent, fully independent 3-stage timer system, paired with manual mod controls.

💻 Source Code & Contributions
The source code for this project is fully open-source. You can view the code, report issues, or contribute directly on GitHub:
[chi-os/reply-timer](https://github.com/chi-os/reply-timer)

# How It Works
The app operates through highly customizable, automated watchdogs as well as on-demand moderation tools. You can enable all of them to work sequentially, or toggle them individually to fit your subreddit's needs:

* Timer 1 (Initial Community Response Watchdog): Starts the moment a post is submitted. If the customized timeframe expires and no one from the community has commented, the app executes the configured Scenario A action (leaving it up, removing it, or filtering it to the modqueue).

* Timer 2 & 3 (OP Discussion Watchdogs):
The exact millisecond the first visible community comment lands, the initial Timer 1 is instantly terminated, and the OP Reply watchdogs are initiated.

* Optional Warning Timer (Timer 2): Dispatches a polite reminder to the OP that their thread is active, including the calculated remaining time ({{xy}}) they have left to reply.

* Final Action Timer (Timer 3): If the OP fails to reply to any comment within the final timeframe, the app executes the configured Scenario B action.

* Manual Comment Watchdog (Context Menu Action):
Moderators can enforce OP participation on specific comments directly from the comment context menu (... -> "Enforce OP Reply to Comment"). The bot automatically posts a distinguished reply pinging OP, grants a custom countdown in minutes, and enforces compliance independent of the thread's general timers.

## Safety Valve & Ghost Protection:

The moment the OP comments anywhere in their thread at any time (and meets the optional character threshold), all active thread timers are immediately destroyed, and the post is marked as safe.

If a community comment is filtered, caught in the spam queue, or deleted before OP can answer, the app detects this and does not force OP to reply to an invisible comment.

## Actions vs. Notifications
For each scenario (Empty Post, Final OP Timeout, or Manual Watchdog), the bot strictly separates the Moderation Action from the User Notification:

### Moderation Actions (What happens to the post/comment?):

* remove — Removes the post or comment and attaches a mod log note.

* filter — Reports the post or comment directly into the modqueue for manual review.

* none / do nothing — Takes no moderation action and keeps the item live.

### Notification Types (How is the user informed?):

* comment — Submits a distinguished, stickied comment directly under the thread or target comment.

* modmail — Sends a private Modmail to the user on behalf of the subreddit.

* none — Operates completely silently without sending any message.

# Key Features

* 3-Stage Cascading System: Separate, independent timeframes for empty threads, warnings, and final actions.

* Manual Comment Watchdog: Pinpoint moderation tool directly in the comment menu to require OP answers on specific questions, complete with an automatic OP ping.

* Low-Effort OP Reply Filter: Set an optional minimum character count for OP responses. Short phrases (e.g. "thanks", "ok") will not reset the watchdog timers.

* Ghost & Filter Protection: Asynchronous verification ensures OP is never penalized if community comments were removed or filtered by AutoModerator.

* *Native Multilingual Support (i18n): Out-of-the-box support for 7 languages (English, German, Spanish, French, Portuguese, Italian, Dutch). The bot automatically translates its core notification templates, action descriptions, and mod log notes.

* 3-Tier Smart Override Principle:

  * Leave text fields blank to use native, localized defaults.

  * Define global subreddit templates in App Settings.

  * Override individual texts on-the-fly when triggering the manual watchdog form.

* Custom Notification Engine: Independently configure stickied comments or private Modmails for each scenario with full markdown support and custom subjects.

* Dynamic Placeholders: Personalize notification templates automatically using:

  * `{{author}}` — The username of the post creator.

  * `{{op}}` — OP username formatted as u/username.

  * `{{commenter}}` — Author of the target comment.

  * `{{action}}` — Renders as the localized equivalent of removed, filtered to the modqueue, or flagged.

  * `{{x}}` — The precise number of minutes configured for that specific timer.

  * `{{xy}}` — The calculated remaining minutes before the final action is taken (Warning Timer only).

  * `Modmail` — Automatically converts into a direct markdown link to compose a message to your subreddit's mod team.

* Granular Exceptions: Protect your community assets by ignoring moderators, approved users, verified emails, minimum karma thresholds, or specific post flairs (e.g., Announcements, Megathreads).

# Localization & Internationalization
To make the app accessible for international communities, the bot features a central translation registry.

**Supported Languages**
* `en` — English (Default)

* `de` — Deutsch (German)

* `es` — Español (Spanish)

* `fr` — Français (French)

* `pt` — Português (Portuguese)

* `it` — Italiano (Italian)

* `nl` — Nederlands (Dutch)

*Missing your community's language? Feel free to request additional languages by opening an issue on our GitHub repository, or contact the developer (u/achchi) directly!*

**How to use Localized Defaults**

* In your Subreddit Mod Tools, navigate to the App Settings for reply-timer.

* Under 1. General Setup & Exceptions, locate the App Language dropdown and select your language (e.g., Deutsch).

* Scroll down to the notification and subject text fields. Clear all text and leave them completely BLANK.

* Save settings. The bot will now automatically dispatch perfectly tailored messages, correct subjects, and format all moderation reasons in the selected language.

# Configuration
Settings are fully integrated into Reddit's native Mod Tools (Mod Tools -> Apps -> reply-timer). The interface is grouped into clean, intuitive sections:

1. General Setup & Exceptions: App language, flair bypasses, karma rules, moderator/approved user exclusions.

2. Scenario A: Empty Post: Wait times, actions (remove/filter/none), and notification types (comment/modmail/none).

3. Scenario B: OP Does Not Reply: Minimum OP character threshold, final timer, warning timer, and associated actions/notifications.

4. Manual Comment Watchdog: Subreddit-wide default notification text for moderator-initiated comment watches.

# Changelog
**3.0.0**

* Added Manual Comment Watchdog: Enforce OP replies to specific comments directly via the mod context menu (...).

* Added mandatory OP ping comment for manual watchdog actions.

* Added Low-Effort Reply Filter: Optional minimum character length requirement for OP comments.

* Added Ghost Comment & AutoMod Filter Protection: Automatically verifies comment visibility before executing timers.

* Added full i18n localization support for Manual Watchdog notices and mod log reasons.

* 3-tier text resolution: Form prompt override > Subreddit settings default > Native i18n fallback.

**2.1.1**

* Listing in app directory

**2.1.0**

* Reddit API Migration 0.13.4 -> 0.14.1

* Autoarchive for Modmail

**2.0.0**

* Implemented 3-Stage Cascading Timer System.

* Added optional Warning Timer to notify users before their post is actioned.

* Added {{xy}} placeholder for remaining time calculations.

* Added support for customizable Modmail subjects for all scenarios.

* Major architectural overhaul for robust state tracking and timer independence.

**1.0.0**

* Added Language support de, es, fr, pt, it, nl

* Interface updates for Language support

**0.0.6**

* Reddit API Migration 0.13.3 -> 0.13.4

**0.0.4**

* Initial MVP