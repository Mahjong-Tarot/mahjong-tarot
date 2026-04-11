You are the Project Manager agent for the Mahjong Tarot project. Your task is to register all required scheduled triggers in Claude Code using the schedule system (CronCreate tool or `/schedule` skill).

Create the following scheduled triggers. For each one, use the exact cron expression, prompt, and description specified below.

---

## Triggers to create

### 1. Morning stand-up reminder
- **Name (canonical — use exactly)**: `PM Standup Morning`
- **Schedule**: `0 7 * * 1-5` (Mon–Fri at 7:00 AM)
- **Prompt**: `Run the daily stand-up workflow from agents/project manager/context/workflows/daily-standup.md. It is now 7 AM — send the morning check-in reminder to Dave and Yon. Use Gmail if available; otherwise write agents/project manager/output/alerts/alert-YYYY-MM-DD.md as the fallback.`
- **Description**: `PM Standup Morning`

### 2. Stand-up deadline check
- **Name (canonical — use exactly)**: `PM Standup Deadline`
- **Schedule**: `0 10 * * 1-5` (Mon–Fri at 10:00 AM)
- **Prompt**: `Run the daily stand-up workflow from agents/project manager/context/workflows/daily-standup.md. It is now 10 AM — the stand-up deadline. Check standup/dave.md and standup/yon.md for the previous working day's date (yesterday; treat Friday as yesterday on Mondays). For any missing check-in, start the ping loop (email via Gmail every 5 minutes, or append to agents/project manager/output/alerts/alert-YYYY-MM-DD.md as fallback). Once both check-ins are confirmed fresh, summarise and append the block to agents/project manager/output/reports/YYYY-MM.md.`
- **Description**: `PM Standup Deadline`

### 3. End-of-day reminder
- **Schedule**: `0 17 * * 1-5` (Mon–Fri at 5:00 PM)
- **Prompt**: `It is 5 PM end of day. Send a reminder to Dave and Yon to update their Git status before tomorrow's stand-up. Use Gmail if available; otherwise write/update agents/project manager/output/alerts/alert-YYYY-MM-DD.md. Then update agents/project manager/output/decisions/decisions.md with any key decisions made today, and confirm the blocker list in agents/project manager/output/raid/RAID.md is current.`
- **Description**: EOD reminder and decision log update — Mon to Fri 5 PM

### 4. Weekly RAG status report
- **Schedule**: `0 16 * * 5` (Friday at 4:00 PM)
- **Prompt**: `Run the weekly status report workflow from agents/project manager/context/workflows/weekly-status-report.md. Also run the release monitor workflow from agents/project manager/context/workflows/release-monitor.md. It is Friday 4 PM — pull latest from main, read agents/project manager/output/reports/YYYY-MM.md for the week's activity, check Vercel for deployment status, and append the RAG block and deployment summary to agents/project manager/output/reports/YYYY-MM.md.`
- **Description**: Weekly RAG status report + release monitor — Friday 4 PM

### 5. Sprint retrospective
- **Schedule**: Set manually at each sprint boundary
- **Prompt**: `Run the retrospective workflow from agents/project manager/context/workflows/retrospective.md. The sprint has ended — email Dave and Yon the Start/Stop/Continue questions with a 48-hour response deadline. Once both responses are received (or 48h has passed), synthesise themes, generate action items, append the retro block to agents/project manager/output/reports/YYYY-MM.md, and create GitHub tasks for each action item.`
- **Description**: Sprint retrospective — run at each sprint boundary

---

## After creating all triggers

Confirm each trigger was registered successfully by listing all active schedules. Report back with:
- Trigger name
- Next scheduled run time
- Status (active / error)

If any trigger fails to register, describe the error and what needs to be fixed.
