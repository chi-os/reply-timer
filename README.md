# OP Reply Enforcer (reply-timer) v2.0

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/chi-os/reply-timer)

A highly flexible Reddit moderation bot built on the Devvit platform. This app ensures active thread engagement by monitoring critical phases of a post's lifecycle using an intelligent, fully independent 3-stage timer system.

## 💻 Source Code & Contributions
The source code for this project is fully open-source. You can view the code, report issues, or contribute directly on GitHub: 
**[chi-os/reply-timer](https://github.com/chi-os/reply-timer)**

---

## How It Works

The app operates through highly customizable, automated watchdogs. You can enable all of them to work sequentially, or toggle them individually to fit your subreddit's needs:

1. **Timer 1 (Initial Community Response Watchdog):** Starts the moment a post is submitted. If the customized timeframe expires and *no one* from the community has commented, the app executes the configured **Scenario A** action (e.g., leaving it up, removing it, or filtering it due to lack of community traction).
   
2. **Timer 2 & 3 (OP Discussion Watchdogs):**
   The exact millisecond the *first community comment* lands, the initial Timer 1 is instantly terminated, and the OP Reply watchdogs are initiated. 
   * **Optional Warning Timer:** Dispatches a polite reminder to the OP that their thread is active, including the calculated remaining time (`{{xy}}`) they have left to reply.
   * **Final Action Timer:** If the OP fails to reply to any comment within the final timeframe, the app executes the configured **Scenario B** action.

**Instant Safety Valve:** The moment the OP comments *anywhere* in their thread at *any time*, all active timers are immediately destroyed, and the post is marked as safe.

## Key Features

* **3-Stage Cascading System:** Separate, independent timeframes for empty threads, warnings, and final actions.
* **🌐 Native Multilingual Support (i18n):** Out-of-the-box support for **7 languages** (English, German, Spanish, French, Portuguese, Italian, Dutch). The bot automatically translates its core notification templates, action descriptions, and mod log notes.
* **Smart Override Principle:** Subreddit moderators can leave the notification text fields and modmail subjects completely blank to use the professionally translated localized defaults, or type a custom message to entirely override them.
* **Custom Notification Engine:** Independently configure stickied comments or private Modmails for each scenario with full markdown support and custom subjects.
* **Dynamic Placeholders:** Personalize notification templates automatically using:
  * `{{author}}` — The username of the post creator.
  * `{{action}}` — Renders as the localized equivalent of *removed*, *filtered to the modqueue*, or *flagged*.
  * `{{x}}` — The precise number of minutes configured for that specific timer.
  * `{{xy}}` — The calculated *remaining minutes* before the final action is taken (Warning Timer only).
  * `Modmail` — Automatically converts into a direct markdown link to compose a message to your subreddit's mod team.
* **Granular Exceptions:** Protect your community assets by ignoring moderators, approved users, verified emails, minimum karma thresholds, or specific post flairs (e.g., Announcements, Megathreads).

## Localization & Internationalization (i18n)

To make the app accessible for international communities, the bot features a central translation registry.

### Supported Languages
* `en` — English (Default)
* `de` — Deutsch (German)
* `es` — Español (Spanish)
* `fr` — Français (French)
* `pt` — Português (Portuguese)
* `it` — Italiano (Italian)
* `nl` — Nederlands (Dutch)

*Missing your community's language? Feel free to request additional languages by opening an issue on our GitHub repository, or contact the developer (u/achchi) directly!*

### How to use Localized Defaults
1. In your Subreddit Mod Tools, navigate to the App Settings for `reply-timer`.
2. Under **1. General Setup & Exceptions**, locate the **App Language** dropdown and select your language (e.g., `Deutsch`).
3. Scroll down to the notification and subject text fields. Clear all text and leave them completely **BLANK**.
4. Save settings. The bot will now automatically dispatch perfectly tailored messages, correct subjects, and format all moderation reasons in the selected language.

---

## Configuration

Settings are fully integrated into Reddit's native Mod Tools (`Mod Tools -> Apps -> reply-timer`). The interface is grouped into clean, intuitive sections: Exceptions & Rules, Scenario A (Empty Posts), and Scenario B (No OP Reply & Warning).

---

# Changelog

## 2.1.0
* Reddit API Migration 0.13.4 -> 0.14.1
* Autoarchive for Modmail

## 2.0.0
* Implemented 3-Stage Cascading Timer System.
* Added optional Warning Timer to notify users before their post is actioned.
* Added `{{xy}}` placeholder for remaining time calculations.
* Added support for customizable Modmail subjects for all scenarios.
* Major architectural overhaul for robust state tracking and timer independence.

## 1.0.0
* Added Language support de, es, fr, pt, it, nl
* Interface updates for Language support

## 0.0.6
* Reddit API Migration 0.13.3 -> 0.13.4

## 0.0.4 
* Initial MVP