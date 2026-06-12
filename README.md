# OP Reply Enforcer (reply-timer)

A highly flexible Reddit moderation bot built on the Devvit platform. This app ensures active thread engagement by monitoring two critical phases of a post's lifecycle using an intelligent, cascading dual-timer system.

## How It Works

The app operates through two sequential, automated watchdogs:

1. **Timer 1 (Initial Community Response Watchdog):** Starts the moment a post is submitted. If the customized timeframe expires and *no one* from the community has commented, the app executes the configured **Scenario A** action (e.g., leaving it up, removing it, or filtering it due to lack of community traction).
   
2. **Timer 2 (OP Discussion Participation Watchdog):**
   The exact millisecond the *first community comment* (not made by the OP) lands, **Timer 1 is instantly terminated**, and **Timer 2 is initiated**. If the OP fails to reply to any comment within this new timeframe, the app executes the configured **Scenario B** action.

**Instant Safety Valve:** The moment the OP comments *anywhere* in their thread at *any time*, all active timers are immediately destroyed, and the post is marked as safe.

## Key Features

* **Cascading Dual-Timer System:** Separate, independent timeframes and actions for empty threads vs. threads abandoned by the OP.
* **Smart Context Switching:** Real-time transitioning from the initial post timer to the OP reply timer upon the first user interaction.
* **Custom Notification Engine:** Independently configure stickied comments or private Modmails for each scenario with full markdown support.
* **Dynamic Placeholders:** Personalize notification templates automatically using:
  * `{{author}}` — The username of the post creator.
  * `{{action}}` — Automatically renders as *removed* or *filtered to the modqueue* based on your setup.
  * `{{x}}` — The precise number of minutes configured for that specific timer.
  * `Modmail` — Renders as a direct markdown link to compose a message to your subreddit's mod team.
* **Granular Exceptions:** Protect your community assets by ignoring moderators, approved users, or specific post flairs (e.g., Announcements, Megathreads).

## Use Cases

* **Q&A and Tech Support Hubs:** Eliminates "hit and run" questions where OPs abandon their threads after community members take time to provide diagnostic help.
* **Discussions & Debates:** Encourages genuine community exchange by filtering out users who drop controversial posts without participating in the resulting discourse.
* **Ask Me Anything (AMAs):** Ensures guest speakers respond to early questions within a reasonable window, preventing empty or unmonitored events.

## Configuration

Settings are fully integrated into Reddit's native Mod Tools (`Mod Tools -> Apps -> reply-timer`). The interface is grouped into clean, intuitive sections: Exceptions & Rules, General Timer Settings, Scenario A (Empty Posts), and Scenario B (No OP Reply).