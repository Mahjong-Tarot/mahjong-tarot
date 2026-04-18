# PM EOD Reminder

**Name**: `PM EOD Reminder`

**Description**: At 5 PM, checks each person's check-in file for freshness. Accepts both today's date and the next compile day's date as valid (Monday on Fridays, otherwise tomorrow) (pre-9 AM check-ins are dated today; post-9 AM check-ins are dated tomorrow). A report is only stale if its content matches what was already in this morning's 9 AM compiled briefing — meaning the person hasn't updated since the compile ran. Sends a reminder + 🔴 status to pending people; a "you're all set" + ✅ status to submitted people. Notification via Lark CLI and Resend (both always). No files are created. No git commits. This trigger is messages and email only.

---

## Prompt

```
It is 5 PM Asia/Saigon end of day. Today's date is YYYY-MM-DD.

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

Also run this snippet immediately after to derive the next compile day. On Fridays the compile happens Monday, not Saturday:

```python
from datetime import date, timedelta
_today = date.fromisoformat("YYYY-MM-DD")
if _today.weekday() == 4:          # Friday → skip weekend
    _compile = _today + timedelta(days=3)
    COMPILE_DAY       = _compile.isoformat()   # Monday's date
    COMPILE_DAY_LABEL = "Monday"
else:
    _compile = _today + timedelta(days=1)
    COMPILE_DAY       = _compile.isoformat()   # tomorrow's date
    COMPILE_DAY_LABEL = "tomorrow"
```

Use `COMPILE_DAY` (the date string) and `COMPILE_DAY_LABEL` ("tomorrow" or "Monday") throughout the rest of this prompt. Never use YYYY-MM-DD-NEXT — it does not account for weekends.

After running the snippet above, immediately export all three values into the current shell session — CLI tools do not inherit Python variables:

```bash
export LARK_CHAT_ID='<value-from-python>'
export RESEND_API_KEY='<value-from-python>'
export RESEND_FROM='<value-from-python>'
```

Use these three shell variables throughout the rest of this prompt wherever $LARK_CHAT_ID, $RESEND_API_KEY, or $RESEND_FROM appear.

The team roster is fixed. Use this exact table — do not derive it from persona.md at runtime:

| Name | Email                  | Check-in file                |
|------|------------------------|------------------------------|
| Dave | dave@edge8.ai          | standup/individual/dave.md   |
| Yon  | yon@edge8.ai           | standup/individual/yon.md    |
| Trac | trac.nguyen@edge8.ai   | standup/individual/trac.md   |

## Step 1 — Check check-in freshness

At 5 PM, a person's check-in can legitimately carry **either** today's date (checked in before 9 AM — the skill dates it as today) **or** the next compile day's date (`COMPILE_DAY` — checked in after 9 AM for the next compile). On Fridays, `COMPILE_DAY` is Monday's date, not Saturday. Both today and `COMPILE_DAY` are valid dates. A report is only stale if its **content matches what was already compiled in this morning's 9 AM briefing** — meaning the person has not updated since then.

### 1a — Read today's 9 AM briefing (staleness reference)

Find the briefing for today: `standup/briefings/YYYY-MM/YYYY-MM-DD.md`. Read it and extract each person's section (focus, notes, blockers). If the file does not exist, skip content comparison for everyone and fall back to date check only.

### 1b — Evaluate each person

For each person, follow this decision tree:

1. Try to read their check-in file. If it does not exist → 🔴 Pending. Skip to 1c.
2. Read line 1. Extract `file_date` (format `date: YYYY-MM-DD`). Extract the full focus/notes/blockers body (everything below line 2).
3. **Date check** — compare `file_date` to both YYYY-MM-DD (today) and `COMPILE_DAY` (next compile day — Monday if today is Friday, otherwise tomorrow):
   - `file_date` matches today or `COMPILE_DAY` → proceed to step 4 (content check)
   - `file_date` is older than today → 🔴 Pending (stale date, no further analysis needed)
4. **Content check** — compare the body against that person's section in today's 9 AM briefing:
   - **Content differs** from the briefing (new focus items, changed blockers, anything updated) → ✅ Submitted
   - **Content is identical** to what was already in the morning briefing → 🔴 Pending (person has not updated since 9 AM compile)
   - **No briefing found** (step 1a failed) → fall back to date: today or `COMPILE_DAY` → ✅ Submitted; older → 🔴 Pending

### 1c — Build two lists

**Submitted** (date is today or `COMPILE_DAY`, content is new since this morning's briefing):
- Example: [Dave, dave@edge8.ai] or [] if none

**Pending** (file missing, date is stale, or content unchanged since this morning's briefing):
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

I'll compile at 9 AM COMPILE_DAY_LABEL — please get your check-in in before then.
```

Send with:
```bash
# Use lark-cli (globally installed, v1.0.12). For full syntax reference, see the lark-im skill.
# --as bot uses tenant_access_token — no OAuth or user login required
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
  --text $'<BUILT_MESSAGE>'
LARK_EXIT=$?
```

Replace `<BUILT_MESSAGE>` with the exact message built above, using `$'...'` with `\n` for line breaks.

If LARK_EXIT is non-zero, self-diagnose and retry through each option in order until one succeeds — do not stop at the first failure:
1. **Check auth**: run `lark-cli whoami` — if it fails or returns no identity, re-authenticate: `lark-cli auth login --as bot`; then retry the send
2. **Check chat ID**: verify `$LARK_CHAT_ID` is set (`echo "$LARK_CHAT_ID"`) — if empty, re-export from .env before retrying
3. **Try `--markdown` instead of `--text`**: wrap the message in markdown and retry with `--markdown`
4. **Send via HTTP**: call the Lark OpenAPI directly using `curl` with a fresh `tenant_access_token` from `lark-cli auth token --as bot`
5. Only mark Lark as failed after all four options above are exhausted

## Step 3 — Send reminder email to pending people only

Skip this step entirely if the Pending list from Step 1 is empty.

If there are pending people:
- Read `agents/project-manager/context/template/emails/3-eod-reminder.html`
- Substitute `{{DATE}}` with YYYY-MM-DD and `{{TOMORROW}}` with `COMPILE_DAY` (Monday's date if today is Friday, otherwise tomorrow's date)
- Write the substituted HTML to `/tmp/eod-reminder-email.html`
- Build the recipient list from pending emails only (comma-to-space conversion):
  PENDING_TO="<pending email 1> <pending email 2> ..."  # space-separated, from Step 1 Pending list
- Send:
  ```bash
  # Ensure key is in shell env before invoking CLI (Python variables do not auto-export)
  if [ -z "$RESEND_API_KEY" ]; then
    export RESEND_API_KEY=$(python3 -c "
import re
def penv(p):
    v={}
    try:
        [v.update({k.strip():val.strip().strip('\"').strip(\"'\")}) for line in open(p) for k,_,val in [line.strip().partition('=')] if line.strip() and not line.startswith('#') and '=' in line]
    except: pass
    return v
e={}; [e.update(penv(f)) for f in ['.env','.env.development','.env.production','.env.local']]
print(e.get('RESEND_API_KEY',''))
")
  fi
  if ! command -v resend &>/dev/null; then npm install -g resend; fi
  RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
    --from "$RESEND_FROM" \
    --to $PENDING_TO \
    --subject "Check-In Reminder — Tonight for YYYY-MM-DD" \
    --html-file /tmp/eod-reminder-email.html \
    --quiet
  RESEND_REMINDER_EXIT=$?
  ```
  If RESEND_REMINDER_EXIT is non-zero, self-diagnose and retry through each option in order until one succeeds — do not stop at the first failure:
  1. **Verify the key**: run `echo "$RESEND_API_KEY" | head -c 8` — if empty, re-read from .env files using the inline Python above and `export RESEND_API_KEY=<value>`; then retry the CLI
  2. **Reinstall CLI**: run `npm install -g resend` and retry
  3. **cURL direct API**: POST the HTML file to `https://api.resend.com/emails` with `Authorization: Bearer $RESEND_API_KEY` header using `curl`
  4. **Python `requests` library**: `pip install requests` if needed, then POST to `https://api.resend.com/emails` with the same payload
  5. Only mark this Resend send as failed after all four options above are exhausted

## Step 4 — Send acknowledgment email to submitted people only

Skip this step entirely if the Submitted list from Step 1 is empty.

If there are submitted people:
- Read `agents/project-manager/context/template/emails/3b-eod-submitted.html`
- Substitute `{{DATE}}` with YYYY-MM-DD and `{{TOMORROW}}` with `COMPILE_DAY` (Monday's date if today is Friday, otherwise tomorrow's date)
- Write the substituted HTML to `/tmp/eod-submitted-email.html`
- Build the recipient list from submitted emails only (comma-to-space conversion):
  SUBMITTED_TO="<submitted email 1> <submitted email 2> ..."  # space-separated, from Step 1 Submitted list
- Send:
  ```bash
  # Ensure key is in shell env before invoking CLI (Python variables do not auto-export)
  if [ -z "$RESEND_API_KEY" ]; then
    export RESEND_API_KEY=$(python3 -c "
import re
def penv(p):
    v={}
    try:
        [v.update({k.strip():val.strip().strip('\"').strip(\"'\")}) for line in open(p) for k,_,val in [line.strip().partition('=')] if line.strip() and not line.startswith('#') and '=' in line]
    except: pass
    return v
e={}; [e.update(penv(f)) for f in ['.env','.env.development','.env.production','.env.local']]
print(e.get('RESEND_API_KEY',''))
")
  fi
  if ! command -v resend &>/dev/null; then npm install -g resend; fi
  RESEND_API_KEY="$RESEND_API_KEY" resend emails send \
    --from "$RESEND_FROM" \
    --to $SUBMITTED_TO \
    --subject "You're all set — Check-In Received for YYYY-MM-DD" \
    --html-file /tmp/eod-submitted-email.html \
    --quiet
  RESEND_SUBMITTED_EXIT=$?
  ```
  If RESEND_SUBMITTED_EXIT is non-zero, self-diagnose and retry through each option in order until one succeeds — do not stop at the first failure:
  1. **Verify the key**: run `echo "$RESEND_API_KEY" | head -c 8` — if empty, re-read from .env files using the inline Python above and `export RESEND_API_KEY=<value>`; then retry the CLI
  2. **Reinstall CLI**: run `npm install -g resend` and retry
  3. **cURL direct API**: POST the HTML file to `https://api.resend.com/emails` with `Authorization: Bearer $RESEND_API_KEY` header using `curl`
  4. **Python `requests` library**: `pip install requests` if needed, then POST to `https://api.resend.com/emails` with the same payload
  5. Only mark this Resend send as failed after all four options above are exhausted

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
