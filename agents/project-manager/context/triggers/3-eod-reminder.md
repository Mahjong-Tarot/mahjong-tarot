# PM EOD Reminder

**Name**: `PM EOD Reminder`

**Description**: At 5 PM, checks each person's check-in file for today's date. Sends a reminder email + 🔴 Lark status to anyone who has not yet submitted. Sends a "you're all set" email + ✅ Lark status to anyone who has already submitted. Notification via Lark CLI and Resend (both always). No files are created. No git commits. This trigger is messages and email only.

---

## Prompt

```
It is 5 PM Asia/Saigon end of day. Today's date is YYYY-MM-DD. Tomorrow's date is YYYY-MM-DD-NEXT.

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

LARK_CHAT_ID   = env["LARK_CHAT_ID"]
RESEND_API_KEY = env["RESEND_API_KEY"]
RESEND_FROM    = env["RESEND_FROM"]
```

The team roster is fixed. Use this exact table — do not derive it from persona.md at runtime:

| Name | Email                  | Check-in file                |
|------|------------------------|------------------------------|
| Dave | dave@edge8.ai          | standup/individual/dave.md   |
| Yon  | yon@edge8.ai           | standup/individual/yon.md    |
| Trac | trac.nguyen@edge8.ai   | standup/individual/trac.md   |

## Step 1 — Check tomorrow's check-in freshness

The EOD reminder is for the NEXT DAY's stand-up. A check-in is considered submitted if it is already written for tomorrow's compile, meaning its `date:` field matches tomorrow's date (YYYY-MM-DD-NEXT).

For each person, follow these exact steps:

1. Try to read line 1 of their check-in file. If the file does not exist → mark as 🔴 Pending.
2. If the file exists, read line 1. It must be in the format `date: YYYY-MM-DD`.
3. Compare the date on line 1 to the value of YYYY-MM-DD-NEXT provided at the top of this prompt.
   - If the dates match exactly → ✅ Submitted
   - If the dates do not match → 🔴 Pending

Do NOT infer or guess. Compare the literal date strings only. Tomorrow's date is YYYY-MM-DD-NEXT.

Build two lists from the results:

**Submitted** (date matches tomorrow YYYY-MM-DD-NEXT):
- Example: [Dave, dave@edge8.ai] or [] if none

**Pending** (file missing or date does not match tomorrow YYYY-MM-DD-NEXT):
- Example: [Yon, yon@edge8.ai] or [] if none

## Step 2 — Send Lark message

This trigger is messages and email only. Do NOT create any files. Do NOT run any git commands.

Build the Lark message using the status from Step 1. Use ✅ for submitted, 🔴 for pending.

Rules:
- ✅ lines: name only (e.g. `✅ Dave`)
- 🔴 lines: name + file path (e.g. `🔴 Yon — standup/individual/yon.md`)
- Always show all three people in the message, in order: Dave, Yon, Trac
- If everyone has submitted, add a line: `Everyone's in — great work today! 🎉`
- If no one has submitted, the message reads as all 🔴

Example of a correctly built message — do not copy literally, use real status from Step 1:

```
🌙 End-of-Day — 2026-04-15

Check-in status:
• ✅ Dave
• 🔴 Yon — standup/individual/yon.md
• ✅ Trac

I'll compile at 9 AM tomorrow — please get your check-in in before then.
```

Send with:
```bash
# --as bot uses tenant_access_token — no OAuth or user login required
# Lark fallback: if lark-cli not installed globally, use npx
LARK_CMD=lark-cli; command -v lark-cli &>/dev/null || LARK_CMD="npx lark-cli"
$LARK_CMD im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
  --text $'<BUILT_MESSAGE>'
LARK_EXIT=$?
```

Replace `<BUILT_MESSAGE>` with the exact message built above, using `$'...'` with `\n` for line breaks.

## Step 3 — Send reminder email to pending people only

Skip this step entirely if the Pending list from Step 1 is empty.

If there are pending people:
- Read `agents/project-manager/context/template/emails/3-eod-reminder.html`
- Substitute `{{DATE}}` with YYYY-MM-DD and `{{TOMORROW}}` with YYYY-MM-DD-NEXT
- Write the substituted HTML to `/tmp/eod-reminder-email.html`
- Build the recipient list from pending emails only (comma-to-space conversion):
  PENDING_TO="<pending email 1> <pending email 2> ..."  # space-separated, from Step 1 Pending list
- Send:
  ```bash
  if ! command -v resend &>/dev/null; then npm install -g resend; fi
  RESEND_API_KEY=$RESEND_API_KEY resend emails send \
    --from "$RESEND_FROM" \
    --to $PENDING_TO \
    --subject "Check-In Reminder — Tonight for YYYY-MM-DD" \
    --html-file /tmp/eod-reminder-email.html \
    --quiet
  RESEND_REMINDER_EXIT=$?
  # Fallback: if CLI fails, send via Resend API directly using cURL
  if [ $RESEND_REMINDER_EXIT -ne 0 ]; then
    python3 -c "
import json,subprocess,sys
html=open('/tmp/eod-reminder-email.html').read()
pending_emails=['<pending email 1>','<pending email 2>']  # list from Step 1 Pending
payload=json.dumps({'from':'$RESEND_FROM','to':pending_emails,'subject':'Check-In Reminder — Tonight for YYYY-MM-DD','html':html})
r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','POST','https://api.resend.com/emails','-H','Authorization: Bearer $RESEND_API_KEY','-H','Content-Type: application/json','--data',payload],capture_output=True,text=True)
sys.exit(0 if r.stdout.strip().startswith('2') else 1)
"
    RESEND_REMINDER_EXIT=$?
  fi
  ```

## Step 4 — Send acknowledgment email to submitted people only

Skip this step entirely if the Submitted list from Step 1 is empty.

If there are submitted people:
- Read `agents/project-manager/context/template/emails/3b-eod-submitted.html`
- Substitute `{{DATE}}` with YYYY-MM-DD and `{{TOMORROW}}` with YYYY-MM-DD-NEXT
- Write the substituted HTML to `/tmp/eod-submitted-email.html`
- Build the recipient list from submitted emails only (comma-to-space conversion):
  SUBMITTED_TO="<submitted email 1> <submitted email 2> ..."  # space-separated, from Step 1 Submitted list
- Send:
  ```bash
  if ! command -v resend &>/dev/null; then npm install -g resend; fi
  RESEND_API_KEY=$RESEND_API_KEY resend emails send \
    --from "$RESEND_FROM" \
    --to $SUBMITTED_TO \
    --subject "You're all set — Check-In Received for YYYY-MM-DD" \
    --html-file /tmp/eod-submitted-email.html \
    --quiet
  RESEND_SUBMITTED_EXIT=$?
  # Fallback: if CLI fails, send via Resend API directly using cURL
  if [ $RESEND_SUBMITTED_EXIT -ne 0 ]; then
    python3 -c "
import json,subprocess,sys
html=open('/tmp/eod-submitted-email.html').read()
submitted_emails=['<submitted email 1>','<submitted email 2>']  # list from Step 1 Submitted
payload=json.dumps({'from':'$RESEND_FROM','to':submitted_emails,'subject':'You\'re all set — Check-In Received for YYYY-MM-DD','html':html})
r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','POST','https://api.resend.com/emails','-H','Authorization: Bearer $RESEND_API_KEY','-H','Content-Type: application/json','--data',payload],capture_output=True,text=True)
sys.exit(0 if r.stdout.strip().startswith('2') else 1)
"
    RESEND_SUBMITTED_EXIT=$?
  fi
  ```

## Step 5 — Failure fallback

Only if ALL of the following are true:
- LARK_EXIT is non-zero (Lark failed)
- RESEND_REMINDER_EXIT is non-zero or Step 3 was skipped
- RESEND_SUBMITTED_EXIT is non-zero or Step 4 was skipped

Then append a failure note inline to `standup/briefings/YYYY-MM/YYYY-MM-DD.md` if that file exists. Do not create any new files. Do not create any alerts folder.

After all steps are complete, your work is done. Do not create branches, commits, or PRs.
```

---

**Schedule**: Weekdays at 5:00 PM Asia/Saigon (`0 10 * * 1-5` UTC)
