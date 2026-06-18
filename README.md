# OP Reply Enforcer (reply-timer)

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/chi-os/reply-timer)

A highly flexible Reddit moderation bot built on the Devvit platform. This app ensures active thread engagement by monitoring two critical phases of a post's lifecycle using an intelligent, cascading dual-timer system.

## 💻 Source Code & Contributions
The source code for this project is fully open-source. You can view the code, report issues, or contribute directly on GitHub: 
**[chi-os/reply-timer](https://github.com/chi-os/reply-timer)**

---

## How It Works

The app operates through two sequential, automated watchdogs:

1. **Timer 1 (Initial Community Response Watchdog):** Starts the moment a post is submitted. If the customized timeframe expires and *no one* from the community has commented, the app executes the configured **Scenario A** action (e.g., leaving it up, removing it, or filtering it due to lack of community traction).
   
2. **Timer 2 (OP Discussion Participation Watchdog):**
   The exact millisecond the *first community comment* (not made by the OP) lands, **Timer 1 is instantly terminated**, and **Timer 2 is initiated**. If the OP fails to reply to any comment within this new timeframe, the app executes the configured **Scenario B** action.

**Instant Safety Valve:** The moment the OP comments *anywhere* in their thread at *any time*, all active timers are immediately destroyed, and the post is marked as safe.

## Key Features

* **Cascading Dual-Timer System:** Separate, independent timeframes and actions for empty threads vs. threads abandoned by the OP.
* **Smart Context Switching:** Real-time transitioning from the initial post timer to the OP reply timer upon the first user interaction.
* **🌐 Native Multilingual Support (i18n):** Out-of-the-box support for multiple languages (currently **English** and **German**). The bot automatically translates its core notification templates, action descriptions, and mod log notes based on the chosen language.
* **Smart Override Principle:** Subreddit moderators can leave the notification text fields completely blank to use the professionally translated localized defaults, or type a custom message to entirely override them.
* **Custom Notification Engine:** Independently configure stickied comments or private Modmails for each scenario with full markdown support.
* **Dynamic Placeholders:** Personalize notification templates automatically using:
  * `{{author}}` — The username of the post creator.
  * `{{action}}` — Renders as the localized equivalent of *removed*, *filtered to the modqueue*, or *flagged (no action taken)* based on your setup.
  * `{{x}}` — The precise number of minutes configured for that specific timer.
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

*Missing your community's language? Feel free to request additional languages by opening an issue on our GitHub repository, or contanct the developer (u/achchi) directly!*

### How to use Localized Defaults
1. In your Subreddit Mod Tools, navigate to the App Settings for `reply-timer`.
2. Under **1. General Setup & Exceptions**, locate the **App Language** dropdown and select your language (e.g., `Deutsch`).
3. Scroll down to the notification text fields. Clear all text and leave them completely **BLANK**.
4. Save settings. The bot will now automatically dispatch perfectly tailored messages and format all moderation reasons in the selected language.

---

## Configuration

Settings are fully integrated into Reddit's native Mod Tools (`Mod Tools -> Apps -> reply-timer`). The interface is grouped into clean, intuitive sections: Exceptions & Rules, General Timer Settings, Scenario A (Empty Posts), and Scenario B (No OP Reply).


---

# Changelog

## 0.0.7
* Added Language support de, es, fr, pt, it, nl
* Interface updates for Language support

## 0.0.6
* Reddit API Migration 0.13.3 -> 0.13.4

## 0.0.4 
* Initial MVP