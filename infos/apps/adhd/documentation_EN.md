# ADHD Plan A — Documentation

Version: `1.0.0-alpha01`

---

## Summary

ADHD Plan A is an Android app that equips appointments and tasks with a **four-stage, escalating reminder system**. Instead of a single notification, there are four stages that grow progressively more urgent — from a subtle heads-up to an alarm-style full-screen overlay that appears above all other apps and on the lock screen.

The app **learns as you use it**: if a stage goes without a response, it will fire earlier next time for that type of item. This learning curve runs independently per combination of category, item type, and time of day.

Designed for people with ADHD, autism, time blindness, and other forms of neurodivergence. Fully local — no cloud sync, no account, no tracking.

---

## Table of Contents

1. [Who this is for](#who-this-is-for)
2. [Core concepts](#core-concepts)
3. [The four stages in detail](#the-four-stages-in-detail)
4. [How the app learns](#how-the-app-learns)
5. [Task vs. Appointment — the key difference](#task-vs-appointment--the-key-difference)
6. [Usage](#usage)
7. [Permissions](#permissions)
8. [Privacy and local storage](#privacy-and-local-storage)
9. [FAQ](#faq)
10. [What the app cannot (yet) do](#what-the-app-cannot-yet-do)
11. [Roadmap](#roadmap)

---

## Who this is for

The app is deliberately built for people where classic reminder apps fail. In particular:

- **Adults with ADHD** and time blindness — seconds, minutes, and hours feel the same; a single reminder 30 minutes ahead rarely cuts it
- **Autism spectrum** with difficulties transitioning between activities
- **Generally neurodivergent people** who need an external structure provider
- **Parents and caregivers** of people from the above groups, wanting to give their child, partner, or family member a reliable external nudge
- **Anyone else** who struggles with "I just forget times" or "I chronically overestimate how much time I have left"

The app does not assume you are disciplined. It assumes you want to be, but your brain gets in the way — and that you need someone to keep nudging you until you actually start.

---

## Core concepts

### Items: Tasks and Appointments

Everything the app reminds you of is either a **task** or an **appointment**. The distinction is conceptually and technically important — see further below.

### Categories

Items are assigned to categories. Six are prepared on first launch:

- Children
- Animals
- Household
- Work
- Farm
- Selfcare

You can create as many custom ones as you like, with custom colour, custom default buffer, and custom icon.

### Stages

Each item has **four reminder stages** that fire at staggered intervals before the item's trigger time:

| Stage | Meaning | Display duration | Re-fire interval |
|-------|---------|-----------------|-----------------|
| 1 (SOON) | "Hey, it's coming up soon" | 30 sec | — |
| 2 (GET_READY) | "Start getting ready" | 2 min | 5 min |
| 3 (REALLY_NOW) | "Are you ready?" / "You need to leave soon!" | 3 min | 3 min |
| 4 (MUST_GO) | "Start now!" / "You need to go right now!" | 5 min | 2 min |

Display duration is how long the full-screen reminder stays visible before the system counts it as "no response."

The re-fire interval kicks in when you don't respond to a stage: after the display duration runs out, the same stage fires again after this interval with a more urgent text. Stage 1 has no re-fire because Stage 2 will follow shortly anyway.

### Trigger time

Stage 4 fires exactly at the **trigger time** of the item. For a task this is the due time (`dueAt`); for an appointment it is the departure time (`startAt − travelTime`).

---

## The four stages in detail

If you add a task for 13:30 in a category with a default buffer (task profile 60/30/10/0):

| Time  | Stage | What happens |
|-------|-------|-------------|
| 12:30 | Stage 1 | Full-screen reminder, alarm tone, light vibration. Text: _"Hey, it's coming up soon."_ Duration: 30 sec. |
| 13:00 | Stage 2 | Full-screen, alarm tone, medium vibration. Text: _"Hey, start getting ready."_ Duration: 2 min. |
| 13:20 | Stage 3 | Full-screen, alarm tone, strong vibration. Text: _"Are you ready?"_ Duration: 3 min. |
| 13:30 | Stage 4 | Full-screen, alarm tone, very strong vibration. Text: _"Start the task now — you have X minutes."_ Duration: 5 min. |

At each stage you must tap the button ("Got it!" / "On it!" / "Getting ready!" / "Starting now!"), otherwise it counts as no response. The back button is disabled. The reminder cannot be swiped away — you must actively respond or let the timer run out.

### What happens during a full-screen reminder

- Display turns on if it was off
- Activity overlays everything, including other apps
- Also overlays the lock screen — you don't need to unlock to respond
- Alarm tone loops, vibration runs
- Large button in the centre
- Smaller progress bar shows remaining time until timeout

---

## How the app learns

In the background the app maintains a separate buffer-time profile (with the four stage offsets) per **combination of category, item type, and time-of-day bucket**.

### When does the app learn?

- **After a response (button tap):** the buffer for this stage in this combination stays **stable**. You apparently had enough lead time.
- **After a timeout (no button tap):** the buffer is **increased by a stage-specific amount** — for the next similar reminder, this stage fires **earlier**.

### How much is added per timeout?

| Stage | Bump per timeout |
|-------|-----------------|
| 1 (SOON) | +2 min |
| 2 (GET_READY) | +3 min |
| 3 (REALLY_NOW) | +4 min |
| 4 (MUST_GO) | +5 min |

The last stage has the highest bump value because it has the greatest effect on leaving on time.

### Time-of-day buckets

The app divides the day into six buckets:

- Early morning (4–7 am)
- Morning (8–10 am)
- Midday (11 am–1 pm)
- Afternoon (2–5 pm)
- Evening (6–9 pm)
- Night (10 pm–3 am)

This is intentional. If you have a hard time getting out of bed in the morning, the profile for "Work + Task + Morning" learns larger Stage 3 and Stage 4 buffers than "Work + Task + Afternoon", where you presumably get into the zone faster.

### Separate learning for tasks vs. appointments

Tasks and appointments have **separate profiles**, even within the same category and time of day. So a late-recognised "hang laundry" task doesn't affect the buffer for your 2 pm doctor's appointment.

### Where can you see what was learned?

Currently: only in the database directly. An Insights view ("what has the app learned") is on the roadmap.

---

## Task vs. Appointment — the key difference

The conceptual difference between the two item types determines when the reminder fires and what texts are used.

### Task

- You do it **where you already are**
- Has a **time limit** (`durationMinutes`) — how long it is allowed to take
- Stage 4 fires **exactly at the due time** (e.g. done by 13:30, so the app says at 13:30: _"Start now — you have 15 minutes."_)
- Examples: hang laundry, answer emails, take medication, walk the dog

### Appointment

- You need to **go somewhere**
- Has a **travel time** (`travelTimeMinutes`) — how long it takes to get there
- Stage 4 fires at the **departure time** = `startAt − travelTime` (e.g. appointment at 14:00, travel 30 min → Stage 4 at 13:30 with _"You need to go right now — or you'll be late."_)
- Examples: doctor's appointment, school, meeting, sports

### When to use which?

- Do I need to go somewhere? → **Appointment**
- Am I already there? → **Task**

When you tap the plus button in the task tab, the app asks you what you want to create.

---

## Usage

### Main view: Tasks

The Tasks tab is the central view. It shows **all upcoming items** (tasks + appointments) sorted chronologically. Use the large plus button at the bottom right to add new items.

### Today

The Today tab shows only items due today or within the next day. Quick overview.

### Categories

Manage categories here. Per category you can:

- Set name, colour, and default buffer time
- Create custom ones or edit system defaults

### Settings

- **Permissions**: walks you through all four required system settings
- **Export / Import**: JSON backup of your complete data
- **Sound / Vibration**: global toggles

### Creating an item

For a new task, enter:

- Title
- (optional) Description
- Due date and time
- Time limit in minutes
- Category
- Recurrence (once, daily, weekly + weekdays, monthly)

For a new appointment:

- Title
- (optional) Description
- Start date and time
- Travel time in minutes (0 = already there)
- Category
- Recurrence

### Recurrence

Four options:

- **Once** — the default
- **Daily** — every day at the same time
- **Weekly** — you choose the weekdays (Mon, Tue, Wed…)
- **Monthly** — on the same day of the month

Recurrences are scheduled two months in advance.

---

## Permissions

The app needs four permissions, which you step through on first launch (`Settings → Permissions`):

| Permission | Purpose | What breaks without it |
|-----------|---------|------------------------|
| Notifications | So the reminder appears as a notification | Reminder never shows |
| Exact alarms | So reminders trigger on time, even in Doze mode | Reminders can be delayed by minutes |
| Full-screen notifications | So the full-screen reminder pops directly on the lock screen | Reminder degrades to heads-up notification |
| Display over other apps | So the full-screen reminder pops even while you're in another app | Full-screen only appears after tapping the notification |

**Recommendation:** grant all four. Then the staged reminder system works as intended.

On some devices (Xiaomi, Huawei, Samsung with aggressive battery optimisation) you also need to exclude the app from battery optimisation, otherwise background alarms get killed. The path varies by manufacturer, typically: `Settings → Apps → ADHD Plan A → Battery → Unrestricted`.

---

## Privacy and local storage

- **All data stays on your device**, in a Room/SQLite database
- **No account, no login**
- **No server backend** — the app talks to nobody
- **No tracking, no analytics, no ads**

### When you switch devices

Go to `Settings → Export / Import` and export a JSON file with all categories, tasks, appointments, and learned buffer times. On the new device, import this file and your data is back.

### When you uninstall the app

All data is gone with it. There is no cloud restore. Plan a JSON export before uninstalling if you want to keep your data.

---

## FAQ

### Why does the full-screen reminder only appear as a notification when I'm in another app?

By default Android doesn't allow any app to open an Activity over another app — a security measure against aggressive ads. ADHD Plan A uses the "Display over other apps" permission (`SYSTEM_ALERT_WINDOW`) to lift this protection for its own reminders. If you haven't granted this permission, the app falls back to a regular notification.

### Why does the reminder pop directly on the lock screen but not inside an app?

On the lock screen, Android automatically enables the `setFullScreenIntent` mechanism — that's standard for alarm clock and incoming call apps. Inside an active app you need explicit permission to draw over other apps, which requires the additional permission.

### Does the app learn even if I don't respond?

Yes, that's actually the primary learning signal. If you don't respond to Stage 3 (timer runs out), the app knows: for exactly this combination of category and time of day, your lead time in this stage was too tight. Next time Stage 3 fires earlier.

### How do I show the app that my lead time was fine?

By pressing the button on the stage. That's the positive learning signal — the value for this stage stays stable and won't be increased further.

### Can I manually adjust buffer times?

Not directly yet. You can change the default buffer time per category, but that only affects items whose profile hasn't diverged through learning yet.

### Are my appointments synced with Google Calendar?

No, the app is completely standalone and doesn't read any external calendar.

### Will my phone vibrate for hours if I ignore the app?

No. Each stage has a display window (30 sec to 5 min), after which the reminder stops on its own. For tasks there are at most three re-fires per stage, after which the item is considered missed. For appointments the last stage fires until the appointment start time, then it stops.

### What if I put my phone on silent during a stage?

The full-screen reminder stays visible (vibration continues depending on system settings), but the alarm tone is not played. The response mechanism still works — the button counts, the timeout counts.

### Does the app drain a lot of battery?

No. It uses the system AlarmManager (low consumption) and otherwise doesn't run in the background. Only when a reminder fires does brief activity become visible.

---

## What the app cannot (yet) do

Intentionally not included in this alpha version:

- **Cloud sync / multi-device** — an appointment you create on your tablet won't appear on your phone
- **Shared lists / family mode** — no way to share reminders with other people
- **Maps / GPS integration** — travel time is always entered manually
- **Geofencing** — the app doesn't automatically detect when you've arrived at the appointment location
- **Wearable / smartwatch** — no Wear OS companion app
- **Widgets** — no Today widget for the home screen
- **iCalendar / Google Calendar** — no import or export in calendar standard formats
- **Advanced recurrence rules** — no "every second Wednesday of the month" or "every 3 days"
- **Automatic detection of missed tasks** — if you don't mark a task as done, the app doesn't know whether you actually did it
- **Insights / statistics view** — you currently can't see how much the app has learned per profile
- **Custom sounds per category** — all reminders use the system alarm tone

Some of these are on the roadmap; others are deliberately left out.

---

## Roadmap

Current planning, without time commitments:

### Likely next iteration

- **Insights view** with "what has the app learned" — visible buffer times per category, item type, time of day
- **Mark task as done** — explicit action so the app can also learn from positive completion signals
- **Snooze function** — respond to Stage X with "remind me again in 5 minutes"

### Medium term

- **Today widget** for the home screen
- **Wear OS companion** for wrist reminders
- **Advanced recurrence rules** (RRULE format)
- **Custom reminder sounds** per category

### Long term / uncertain

- **Cloud sync** between devices — would require account creation, which dilutes the privacy-by-default approach
- **Shared family lists**
- **Maps integration for automatic travel time estimation**

### Deliberately not planned

- **Ads, in-app purchases, subscriptions** — the app should be functionally complete
- **Tracking, analytics, telemetry** — no data channel back to the developer
- **Social features** — no likes, no sharing, no profile

---

## Feedback

This alpha lives on your input. If something doesn't work the way you expected, or if you're missing a core feature: please let us know. Detailed bug reports with steps to reproduce are especially helpful.

For reminder issues, Logcat output is invaluable:

```
adb logcat -s AdhdAlarm AndroidRuntime
```

These lines show what was scheduled and what fired, plus all app crashes.
