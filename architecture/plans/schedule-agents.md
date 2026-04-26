# Schedule All Agents — Setup Prompt

Run this file from the **main Claude Code session only**. `RemoteTrigger` requires the user's OAuth token — do not invoke via `@project-manager` or any subagent.

All triggers use `RemoteTrigger` (cloud-hosted, always-on). Never use `CronCreate` or `mcp__scheduled-tasks`. All crons are in **UTC**; local time is **Asia/Saigon (UTC+7)**.

---

## All triggers

| Agent | Name | Cron (UTC) | Local time |
|-------|------|-----------|------------|
| PM | `PM Standup Morning` | `0 0 * * 1-5` | Mon–Fri 7:00 AM |
| PM | `PM Standup Compile` | `0 2 * * 1-5` | Mon–Fri 9:00 AM |
| PM | `PM EOD Reminder` | `0 10 * * 1-5` | Mon–Fri 5:00 PM |
| PM | `PM Weekly RAG Report` | `0 9 * * 5` | Friday 4:00 PM |
| Writer | `mahjong-writer-tuesday` | `0 1 * * 2` | Tuesday 8:00 AM |
| Designer | `mahjong-designer-thursday` | `0 1 * * 4` | Thursday 8:00 AM |
| Publisher | `mahjong-publisher-weekday` | `0 2 * * 1-5` | Weekdays 9:00 AM |

---

## Step 0 — Load secrets (required for PM triggers)

```bash
python3 - <<'PYEOF'
import os, re, sys

def parse_env_file(path):
    vals = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                vals[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return vals

env = {}
env.update(parse_env_file(".env"))
env.update(parse_env_file(".env.local"))

missing = [k for k in ("LARK_CHAT_ID", "RESEND_API_KEY", "RESEND_FROM") if not env.get(k)]
if missing:
    print(f"ERROR: missing from .env / .env.local: {missing}")
    sys.exit(1)

with open("agents/project-manager/context/persona.md") as f:
    text = f.read()
emails = list(dict.fromkeys(
    e for e in re.findall(r'[\w.+-]+@[\w.-]+\.[a-z]{2,}', text)
    if "example" not in e
))

print("LARK_CHAT_ID=" + env["LARK_CHAT_ID"])
print("RESEND_API_KEY=" + env["RESEND_API_KEY"])
print("RESEND_FROM=" + env["RESEND_FROM"])
print("RESEND_TO=" + ",".join(emails))
PYEOF
```

Before creating PM triggers, replace every `$LARK_CHAT_ID`, `$RESEND_API_KEY`, `$RESEND_FROM`, `$RESEND_TO` in the prompt text with the values above. Source files in git keep the `$PLACEHOLDER` syntax — only substitute at creation time.

---

## RemoteTrigger body shape

```json
{
  "name": "TRIGGER_NAME",
  "cron_expression": "CRON_UTC",
  "enabled": true,
  "job_config": {
    "ccr": {
      "environment_id": "env_01Ly7cgFD1z5N2xN9VtNZ42S",
      "session_context": {
        "model": "claude-sonnet-4-6",
        "sources": [
          {"git_repository": {"url": "https://github.com/Mahjong-Tarot/mahjong-tarot"}}
        ],
        "allowed_tools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
      },
      "events": [
        {"data": {
          "uuid": "<fresh lowercase v4 uuid>",
          "session_id": "",
          "type": "user",
          "parent_tool_use_id": null,
          "message": {"role": "user", "content": "PROMPT_FROM_BELOW"}
        }}
      ]
    }
  }
}
```

---

## PM triggers

### 1. Morning stand-up reminder
- **Name**: `PM Standup Morning`
- **Cron**: `0 0 * * 1-5`

```
Run the daily stand-up Phase 1 workflow from agents/project-manager/context/daily-standup.md.

It is now 7 AM Asia/Saigon. Send a morning check-in reminder to all three team members — Dave, Yon, and Trac — asking them to submit their check-in files in standup/individual/ before 9 AM:
- standup/individual/dave.md
- standup/individual/yon.md
- standup/individual/trac.md

Send both Lark and Resend: Lark CLI (lark-cli im +messages-send --as bot --chat-id $LARK_CHAT_ID --text "...") and Resend CLI (Template 1 from agents/project-manager/context/pm-notification-guide.md). Fall back to inline log in standup/briefings/YYYY-MM/YYYY-MM-DD.md only if both fail.

Git workflow: git pull origin main → git checkout -b pm/standup-morning/YYYY-MM-DD → git add <files> → git commit -m "pm(standup-morning): YYYY-MM-DD" → git push → gh pr create --base main → gh pr merge --merge --auto. Never commit to main directly.
```

### 2. Stand-up compile and distribute
- **Name**: `PM Standup Compile`
- **Cron**: `0 2 * * 1-5`

```
Run the daily stand-up Phase 2 workflow from agents/project-manager/workflows/daily-standup-workflow.md.

It is now 9 AM Asia/Saigon — the stand-up compile deadline.

Git workflow first: git pull origin main → git checkout -b pm/standup-compile/YYYY-MM-DD. All writes go on this branch.

Read all four files in standup/individual/: dave.md, yon.md, trac.md, and agents.md. Check freshness on the three human files (date must match the previous working day — yesterday; treat Friday as yesterday on Mondays). Detect conflicts across all check-ins.

Compile the daily stand-up to standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the monthly folder if needed). Include agent updates under an Agent Updates section.

Send both Lark and Resend: Lark CLI (--markdown for the summary) and Resend CLI (Template 2 from agents/project-manager/context/pm-notification-guide.md). Fall back to inline log at the bottom of standup/briefings/YYYY-MM/YYYY-MM-DD.md only if both fail.

Commit: git add standup/briefings/YYYY-MM/YYYY-MM-DD.md → git commit -m "pm(standup-compile): YYYY-MM-DD" → git push origin pm/standup-compile/YYYY-MM-DD → gh pr create --title "pm(standup-compile): YYYY-MM-DD" --base main → gh pr merge --merge --auto.
```

### 3. End-of-day reminder
- **Name**: `PM EOD Reminder`
- **Cron**: `0 10 * * 1-5`

```
It is 5 PM Asia/Saigon end of day.

Git workflow first: git pull origin main → git checkout -b pm/eod/YYYY-MM-DD. All writes go on this branch.

Send a reminder to Dave, Yon, and Trac to write their check-in to standup/individual/<name>.md tonight, ready for tomorrow's 9 AM stand-up. Send both Lark CLI (--text) and Resend CLI (Template 3 from agents/project-manager/context/pm-notification-guide.md). Fall back to inline log in standup/briefings/YYYY-MM/decisions.md only if both fail.

Append any key decisions made today to standup/briefings/YYYY-MM/decisions.md (create if missing). Review standup/briefings/YYYY-MM/raid.md and confirm the blocker list is current (create if missing).

Commit: git add standup/briefings/YYYY-MM/decisions.md standup/briefings/YYYY-MM/raid.md → git commit -m "pm(eod): YYYY-MM-DD" → git push origin pm/eod/YYYY-MM-DD → gh pr create --title "pm(eod): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

### 4. Weekly RAG status report
- **Name**: `PM Weekly RAG Report`
- **Cron**: `0 9 * * 5`

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

Send both Lark and Resend: Lark CLI (--markdown) and Resend CLI (Template 4 from agents/project-manager/context/pm-notification-guide.md). Fall back to inline log at the bottom of standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md only if both fail.

Commit: git add standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md → git commit -m "pm(weekly-rag): YYYY-MM-DD" → git push origin pm/weekly-rag/YYYY-MM-DD → gh pr create --title "pm(weekly-rag): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

## Content agent triggers

For each trigger below, read the full prompt body from the trigger file and use it as `PROMPT_FROM_BELOW`.

### 5. Writer — Tuesday
- **Name**: `mahjong-writer-tuesday`
- **Cron**: `0 1 * * 2`
- **Trigger file**: `agents/writer/context/triggers/tuesday-writer.md`

### 6. Designer — Thursday
- **Name**: `mahjong-designer-thursday`
- **Cron**: `0 1 * * 4`
- **Trigger file**: `agents/designer/context/triggers/thursday-designer.md`

### 7. Publisher — Weekdays
- **Name**: `mahjong-publisher-weekday`
- **Cron**: `0 2 * * 1-5`
- **Trigger file**: `agents/web-developer/context/triggers/weekday-publisher.md`

---

## After registering

Confirm all 7 triggers:

| Name | Cron (UTC) | Local time | Status | Next run | Trigger ID |
|------|-----------|------------|--------|----------|------------|
| PM Standup Morning | `0 0 * * 1-5` | Mon–Fri 7:00 AM | | | |
| PM Standup Compile | `0 2 * * 1-5` | Mon–Fri 9:00 AM | | | |
| PM EOD Reminder | `0 10 * * 1-5` | Mon–Fri 5:00 PM | | | |
| PM Weekly RAG Report | `0 9 * * 5` | Friday 4:00 PM | | | |
| mahjong-writer-tuesday | `0 1 * * 2` | Tuesday 8:00 AM | | | |
| mahjong-designer-thursday | `0 1 * * 4` | Thursday 8:00 AM | | | |
| mahjong-publisher-weekday | `0 2 * * 1-5` | Weekdays 9:00 AM | | | |

---

## Pipeline rhythm

```
Monday–Friday 7 AM   → PM sends morning stand-up reminder
Monday–Friday 9 AM   → PM compiles stand-up + Publisher checks for today's post
Monday–Friday 5 PM   → PM sends EOD reminder
Tuesday 8 AM         → Writer writes next week's posts
Thursday 8 AM        → Designer generates hero images
Friday 4 PM          → PM sends weekly RAG report
```

Bill's only manual step: `git push origin main` after Writer's PR is reviewed and merged.
