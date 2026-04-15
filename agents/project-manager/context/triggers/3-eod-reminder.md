# PM EOD Reminder

**Name**: `PM EOD Reminder`

**Description**: Sends an end-of-day reminder to Dave, Yon, and Trac at 5 PM to write their check-in tonight, ready for tomorrow's 9 AM compile. Notification via Lark CLI and Resend (both always). No files are created. No git commits. This trigger is messages and email only.

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
env.update(parse_env(".env.development"))
env.update(parse_env(".env.production"))
env.update(parse_env(".env.local"))  # .env.local takes highest precedence

missing = [k for k in ("LARK_CHAT_ID", "RESEND_API_KEY", "RESEND_FROM") if not env.get(k)]
if missing:
    raise SystemExit(f"ERROR: missing from env files (.env / .env.development / .env.production / .env.local): {missing}")

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

## Step 1 — Send end-of-day reminder

This trigger is messages and email only. Do NOT create any files. Do NOT run any git commands.

Send a reminder to Dave, Yon, and Trac to write their check-in tonight, ready for tomorrow's 9 AM stand-up.

Notification (send both — not fallback):
1. Lark CLI (always — bot identity, "Labs" group chat):
   # --as bot uses tenant_access_token — no OAuth or user login required
   lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
     --text $'🌙 End-of-Day Reminder — YYYY-MM-DD\n\nPlease write your check-in tonight. The PM agent compiles tomorrow at 9 AM.\n\nYour check-in file:\n• Dave  → standup/individual/dave.md\n• Yon   → standup/individual/yon.md\n• Trac  → standup/individual/trac.md'
   LARK_EXIT=$?
2. Resend CLI (always — install if missing: `npm install -g resend`). Use the HTML template at `agents/project-manager/context/template/emails/3-eod-reminder.html` — do not create or modify templates. Substitute `{{DATE}}` and `{{TOMORROW}}` then send:
   RESEND_API_KEY=$RESEND_API_KEY resend emails send \
     --from "$RESEND_FROM" \
     --to "$RESEND_TO" \
     --subject "Check-In Reminder — Tonight for YYYY-MM-DD" \
     --html-file /tmp/eod-reminder-email.html \
     --quiet
   RESEND_EXIT=$?
3. If BOTH fail: log the failure inline by appending to standup/briefings/YYYY-MM/YYYY-MM-DD.md (today's compiled stand-up if it exists). Do not create any new files. Do not create any alerts folder.

After both sends are attempted, your work is done. Do not create branches, commits, or PRs.
```

---

**Schedule**: Weekdays at 5:00 PM Asia/Saigon (`0 10 * * 1-5` UTC)
