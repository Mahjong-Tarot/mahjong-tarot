You are the Project Manager agent for the Mahjong Tarot project. Your task is to register all required scheduled triggers in Claude Code using the `CronCreate` tool.

## Trigger type rule

**Always use `CronCreate` with `durable: true` and `recurring: true` — never `RemoteTrigger`.**

- `RemoteTrigger` creates cloud-hosted tasks tied to one person's Claude.ai account. The rest of the team cannot see or manage them.
- `CronCreate` with `durable: true` writes to `.claude/scheduled_tasks.json` in the repo. Once committed, the whole team inherits the tasks.
- `CronCreate` must be run from a **terminal `claude` session** (not the VS Code extension) for `durable: true` to write to disk.

All times are **Asia/Saigon (UTC+7)**. `CronCreate` cron expressions are in **local time** — no UTC conversion needed.

---

## Output folder rule

All PM-written files go into `standup/briefings/YYYY-MM/`. Create the monthly folder if it does not exist. Never write to `agents/project-manager/output/` or any other location.

```
standup/
└── briefings/
    └── YYYY-MM/
        ├── YYYY-MM-DD.md          ← compiled daily stand-up
        ├── weekly-rag-YYYY-MM-DD.md   ← Friday RAG report
        ├── raid.md                ← RAID log (updated in place)
        ├── decisions.md           ← decisions log (appended daily)
        └── alerts/
            └── alert-YYYY-MM-DD.md    ← notification fallback
```

---

## Git workflow rule (applies to ALL triggers)

Never write directly to main.

```
1. git pull origin main
2. git checkout -b pm/<task>/YYYY-MM-DD
3. Make all file writes on this branch
4. git add <changed files explicitly>
5. git commit -m "pm(<task>): YYYY-MM-DD"
6. git push origin pm/<task>/YYYY-MM-DD
7. gh pr create --title "pm(<task>): YYYY-MM-DD" --base main --body "<one-line summary>"
8. gh pr merge --merge --auto
```

---

## Communication rule

Notification priority: **Telegram → Lark**. If both fail, append the notification status inline to the relevant daily file. Do not create any alerts folder or alert files.

---

## Triggers to create

### 1. Morning stand-up reminder
- **Name (canonical — use exactly)**: `PM Standup Morning`
- **Tool**: `CronCreate` · `durable: true` · `recurring: true`
- **Schedule**: `0 7 * * 1-5` (Mon–Fri 7:00 AM local time)
- **Prompt**:

```
Run the daily stand-up Phase 1 workflow from agents/project-manager/context/daily-standup.md.

It is now 7 AM Asia/Saigon. Send a morning check-in reminder to all four team members — Dave, Yon, Trac, and Khang — asking them to submit their check-in files in standup/individual/ before 9 AM:
- standup/individual/dave.md
- standup/individual/yon.md
- standup/individual/trac.md
- standup/individual/khang.md

Notification order: Telegram → Lark. If both fail, document the failure in standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the file if it does not exist yet). Do not create any alerts folder or alert files.

Git workflow: git pull origin main → git checkout -b pm/standup-morning/YYYY-MM-DD → write any file changes on this branch → git add <files> → git commit -m "pm(standup-morning): YYYY-MM-DD" → git push → gh pr create --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

### 2. Stand-up compile and distribute
- **Name (canonical — use exactly)**: `PM Standup Compile`
- **Tool**: `CronCreate` · `durable: true` · `recurring: true`
- **Schedule**: `0 9 * * 1-5` (Mon–Fri 9:00 AM local time)
- **Prompt**:

```
Run the daily stand-up Phase 2 workflow from agents/project-manager/workflows/daily-standup-workflow.md.

It is now 9 AM Asia/Saigon — the stand-up compile deadline.

Git workflow first: git pull origin main → git checkout -b pm/standup-compile/YYYY-MM-DD. All writes go on this branch.

Read all five files in standup/individual/: dave.md, yon.md, trac.md, khang.md, and agents.md. Check freshness on the four human files (date must match the previous working day — yesterday; treat Friday as yesterday on Mondays).

Detect conflicts across all five check-ins.

Compile the daily stand-up to standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the monthly folder if needed). Include agent updates as-is under an Agent Updates section.

Send the summary: Telegram → Lark. If both fail, append the notification status at the bottom of standup/briefings/YYYY-MM/YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/YYYY-MM-DD.md → git commit -m "pm(standup-compile): YYYY-MM-DD" → git push origin pm/standup-compile/YYYY-MM-DD → gh pr create --title "pm(standup-compile): YYYY-MM-DD" --base main → gh pr merge --merge --auto.
```

---

### 3. End-of-day reminder
- **Name (canonical — use exactly)**: `PM EOD Reminder`
- **Tool**: `CronCreate` · `durable: true` · `recurring: true`
- **Schedule**: `0 17 * * 1-5` (Mon–Fri 5:00 PM local time)
- **Prompt**:

```
It is 5 PM Asia/Saigon end of day.

Git workflow first: git pull origin main → git checkout -b pm/eod/YYYY-MM-DD. All writes go on this branch.

Send a reminder to Dave, Yon, Trac, and Khang to write their check-in to standup/individual/<name>.md tonight, ready for tomorrow's 9 AM stand-up. Notification order: Telegram → Lark. If both fail, append the notification status to standup/briefings/YYYY-MM/decisions.md. Do not create any alerts folder or alert files.

Append any key decisions made today to standup/briefings/YYYY-MM/decisions.md (create if missing).

Review standup/briefings/YYYY-MM/raid.md and confirm the blocker list is current (create if missing).

Commit: git add standup/briefings/YYYY-MM/decisions.md standup/briefings/YYYY-MM/raid.md <any alert file> → git commit -m "pm(eod): YYYY-MM-DD" → git push origin pm/eod/YYYY-MM-DD → gh pr create --title "pm(eod): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

### 4. Weekly RAG status report
- **Name (canonical — use exactly)**: `PM Weekly RAG Report`
- **Tool**: `CronCreate` · `durable: true` · `recurring: true`
- **Schedule**: `0 16 * * 5` (Friday 4:00 PM local time)
- **Prompt**:

```
Run the weekly status report workflow from agents/project-manager/context/weekly-status-report.md and the release monitor workflow from agents/project-manager/context/release-monitor.md.

It is Friday 4 PM Asia/Saigon.

Git workflow first: git pull origin main → git checkout -b pm/weekly-rag/YYYY-MM-DD. All writes go on this branch.

Read standup/briefings/YYYY-MM/ for this week's compiled stand-ups and decisions. Check Vercel for deployment status.

Write the weekly RAG report to standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md using this format:
🟢 GREEN — on track
🟡 AMBER — needs attention | owner | resolution date
🔴 RED — needs escalation | impact | immediate action
📋 UPCOMING — key milestones in the next 2 weeks
⚠️ RISKS — top 3 with probability / impact / mitigation
🔔 DECISIONS NEEDED — items requiring decision with deadline

Send the weekly summary: Telegram → Lark. If both fail, append the notification status at the bottom of standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md → git commit -m "pm(weekly-rag): YYYY-MM-DD" → git push origin pm/weekly-rag/YYYY-MM-DD → gh pr create --title "pm(weekly-rag): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

### 5. Sprint retrospective
- **Schedule**: Set manually at each sprint boundary
- **Prompt**:

```
Run the retrospective workflow from agents/project-manager/context/retrospective.md. The sprint has ended.

Git workflow first: git pull origin main → git checkout -b pm/retro/YYYY-MM-DD.

Send Start/Stop/Continue questions to Dave, Yon, Trac, and Khang via Telegram → Lark → fallback file. Give a 48-hour response deadline.

Once all responses are received (or 48h passes), synthesise themes and generate action items. Write the retro report to standup/briefings/YYYY-MM/retro-YYYY-MM-DD.md. Create GitHub issues for each action item.

Commit: git add standup/briefings/YYYY-MM/retro-YYYY-MM-DD.md → git commit -m "pm(retro): YYYY-MM-DD" → git push → gh pr create --base main → gh pr merge --merge --auto.
```

---

## After creating all triggers

All tasks are stored in `.claude/scheduled_tasks.json`. Commit this file to the repo so the whole team inherits the schedule.

Note: durable recurring tasks auto-expire after 7 days and must be re-registered. Run this file's prompts in a terminal `claude` session to renew them.

| Trigger name | CronCreate cron (local time) | Local time (Asia/Saigon) | Status | Job ID |
|---|---|---|---|---|
| PM Standup Morning | `0 7 * * 1-5` | Mon–Fri 7:00 AM | | |
| PM Standup Compile | `0 9 * * 1-5` | Mon–Fri 9:00 AM | | |
| PM EOD Reminder | `0 17 * * 1-5` | Mon–Fri 5:00 PM | | |
| PM Weekly RAG Report | `0 16 * * 5` | Friday 4:00 PM | | |
