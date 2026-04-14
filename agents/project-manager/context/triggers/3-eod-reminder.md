# PM EOD Reminder

**Name**: `PM EOD Reminder`

**Description**: Sends an end-of-day reminder to Dave, Yon, and Trac at 5 PM to write their check-in tonight, ready for tomorrow's 9 AM compile. Also appends any key decisions made today to `decisions.md` and reviews the RAID log for currency. Notification via Lark CLI and Resend (both always); if both fail, appends a status note inline to `decisions.md`. Commits changes on a branch and opens a PR.

---

## Prompt

```
It is 5 PM Asia/Saigon end of day.

## Step 0 — Load credentials and team roster

Run this Python snippet to load secrets and team emails before doing anything else. Stop and report if any key is missing.

```python
import os, re

def parse_env(path):
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
env.update(parse_env(".env"))
env.update(parse_env(".env.local"))  # .env.local takes precedence

missing = [k for k in ("LARK_CHAT_ID", "RESEND_API_KEY", "RESEND_FROM") if not env.get(k)]
if missing:
    raise SystemExit(f"ERROR: missing from .env / .env.local: {missing}")

with open("agents/project-manager/context/persona.md") as f:
    text = f.read()
emails = list(dict.fromkeys(
    e for e in re.findall(r'[\w.+-]+@[\w.-]+\.[a-z]{2,}', text)
    if "example" not in e
))

LARK_CHAT_ID   = env["LARK_CHAT_ID"]
RESEND_API_KEY = env["RESEND_API_KEY"]
RESEND_FROM    = env["RESEND_FROM"]
RESEND_TO      = ",".join(emails)
```

Use these four values throughout the rest of this prompt wherever $LARK_CHAT_ID, $RESEND_API_KEY, $RESEND_FROM, or $RESEND_TO appear.

## Step 1 — Git workflow

git pull origin main
git checkout -b pm/eod/YYYY-MM-DD

All writes go on this branch.

## Step 2 — Send end-of-day reminder

Read agents/project-manager/context/pm-notification-guide.md for the full notification pattern, Lark message text, and HTML email template (Template 3 — End-of-Day Reminder).

Send a reminder to Dave, Yon, and Trac to write their check-in to standup/individual/<name>.md tonight, ready for tomorrow's 9 AM stand-up.

Notification (send both — not fallback):
1. Lark CLI (always — bot identity, "Labs" group chat):
   lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
     --text $'🌙 End-of-Day Reminder — YYYY-MM-DD\n\nPlease write your check-in to standup/individual/<name>.md tonight.\nThe PM agent compiles the stand-up tomorrow at 9 AM.\n\nFiles:\n• standup/individual/dave.md\n• standup/individual/yon.md\n• standup/individual/trac.md'
   LARK_EXIT=$?
2. Resend CLI (always — install if missing: `npm install -g resend`). Substitute `{{DATE}}` and `{{TOMORROW}}` in a copy of `agents/project-manager/context/template/emails/3-eod-reminder.html`, write to `/tmp/eod-reminder-email.html`, then send:
   RESEND_API_KEY=$RESEND_API_KEY resend emails send \
     --from "$RESEND_FROM" \
     --to "$RESEND_TO" \
     --subject "Check-In Reminder — Tonight for YYYY-MM-DD" \
     --html-file /tmp/eod-reminder-email.html \
     --quiet
   Full pattern in pm-notification-guide.md.
3. If BOTH fail: append failure status inline to standup/briefings/YYYY-MM/decisions.md. Do not create any alerts folder or alert files.

## Step 3 — Update decision and RAID logs

Append any key decisions made today to standup/briefings/YYYY-MM/decisions.md (create if missing).

Review standup/briefings/YYYY-MM/raid.md and confirm the blocker list is current (create if missing).

## Step 4 — Commit and branch cleanup

AGENT_BRANCH="pm/eod/YYYY-MM-DD"

git add standup/briefings/YYYY-MM/decisions.md standup/briefings/YYYY-MM/raid.md
git commit -m "pm(eod): YYYY-MM-DD"
git push origin "$AGENT_BRANCH"
gh pr create --title "pm(eod): YYYY-MM-DD" --base main --body "EOD decisions and RAID update YYYY-MM-DD"
gh pr merge --merge --auto --delete-branch

# Clean up local agent branch — only if it matches pm/* (never touch user branches)
git checkout main
git pull origin main
git branch -d "$AGENT_BRANCH" 2>/dev/null || true
```

---

**Schedule**: Weekdays at 5:00 PM Asia/Saigon (`0 10 * * 1-5` UTC)
