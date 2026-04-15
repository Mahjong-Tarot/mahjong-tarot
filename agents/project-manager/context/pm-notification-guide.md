# PM Agent — Notification Channels

## Overview

Notification pattern for every trigger: **Lark CLI + Resend (both always) → inline log on failure**

- **Lark CLI** — instant team channel message via `lark-cli im +messages-send`; sends a compact priority summary
- **Resend email** — full-length HTML email to the team; sent alongside Lark, not as a fallback
- **Inline log** — appends status to the daily briefing file only if **both** Lark and Resend fail

Never create alerts folders or alert files. Document failures inline.

> **Sender**: `RESEND_FROM` is read from the environment. Requires the domain to be a verified sending domain in Resend.

---

## Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `LARK_CHAT_ID` | Lark group chat ID (oc_xxx format) | `oc_XXXXXXXXXXXXXX` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxx` |
| `RESEND_FROM` | Verified sender address (Resend) | `mahjong-pm@davehajdu.com` |
| `RESEND_TO` | Comma-separated recipients | `dave@edge8.ai,yon@edge8.ai,trac.nguyen@edge8.ai` |

Set these in `~/.claude/settings.json` under `env`.

---

## Channel 1 — Lark CLI

### Identity decision

| Situation | Identity flag | Auth required |
|---|---|---|
| PM agent sends notifications, reminders, reports | `--as bot` | ❌ None — uses pre-configured `tenant_access_token` |
| User asks Claude to act as them / assume their role | `--as user` | ✅ OAuth login required |
| User asks Claude to edit/delete a message on their behalf | `--as user` | ✅ OAuth login required |
| Accessing contacts/data the bot can't reach | `--as user` | ✅ OAuth login required |

**Default is `--as bot`** for all PM operations. Only switch to `--as user` when the user explicitly asks Claude to act as them or perform an action under their identity.

### Message format

Use `lark-cli im +messages-send` with bot identity. The message content depends on the trigger:

- **Reminders** (morning, EOD): use `--text` with `$'...'` to preserve exact line breaks
- **Reports** (standup compiled, weekly RAG): use `--markdown` so headings and bullets render in Lark

```bash
# Use npx as fallback if lark-cli not installed globally
LARK_CMD=lark-cli; command -v lark-cli &>/dev/null || LARK_CMD="npx lark-cli"

# Reminder (plain text, exact formatting)
$LARK_CMD im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'MESSAGE_HERE'

# Report summary (markdown rendering)
$LARK_CMD im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --markdown $'SUMMARY_HERE'
```

Capture exit code. Always set `LARK_CMD` first:
```bash
LARK_CMD=lark-cli; command -v lark-cli &>/dev/null || LARK_CMD="npx lark-cli"
$LARK_CMD im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'...'
LARK_EXIT=$?
```

---

## Channel 2 — Resend Email (HTML only)

Uses the official Resend CLI (`resend`). Always send via `--html-file` — never send raw markdown as email body.

```bash
# Install Resend CLI if not present
if ! command -v resend &>/dev/null; then
  npm install -g resend
fi

# Convert comma-separated RESEND_TO to space-separated for CLI
TO_ARGS=$(echo "$RESEND_TO" | tr ',' ' ')

RESEND_API_KEY=$RESEND_API_KEY resend emails send \
  --from "$RESEND_FROM" \
  --to $TO_ARGS \
  --subject "SUBJECT_HERE" \
  --html-file "TEMPLATE_FILE_HERE" \
  --quiet
RESEND_EXIT=$?

# Fallback: if CLI fails or is unavailable, send via Resend API directly using cURL
if [ $RESEND_EXIT -ne 0 ]; then
  python3 -c "
import json,subprocess,sys
html=open('TEMPLATE_FILE_HERE').read()
payload=json.dumps({'from':'$RESEND_FROM','to':'$RESEND_TO'.split(','),'subject':'SUBJECT_HERE','html':html})
r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','POST','https://api.resend.com/emails','-H','Authorization: Bearer $RESEND_API_KEY','-H','Content-Type: application/json','--data',payload],capture_output=True,text=True)
sys.exit(0 if r.stdout.strip().startswith('2') else 1)
"
  RESEND_EXIT=$?
fi
```

Replace `SUBJECT_HERE` with the trigger subject and `TEMPLATE_FILE_HERE` with the `/tmp/` path of the rendered HTML file.

---

## Channel 3 — Inline Log (fallback only)

Only used if **both** Lark CLI and Resend fail. Append to the bottom of the relevant daily file:

```
---
**Notification failure — YYYY-MM-DD HH:MM**
Lark CLI: exited $LARK_EXIT
Resend: exited $RESEND_EXIT
Action: Team must check this file manually.
```

---

## Usage pattern for PM agent

```bash
# 1. Send Lark (always)
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'MESSAGE'
LARK_EXIT=$?

# 2. Send Resend email (always — install CLI if missing)
if ! command -v resend &>/dev/null; then npm install -g resend; fi
TO_ARGS=$(echo "$RESEND_TO" | tr ',' ' ')
RESEND_API_KEY=$RESEND_API_KEY resend emails send \
  --from "$RESEND_FROM" \
  --to $TO_ARGS \
  --subject "SUBJECT" \
  --html-file "TEMPLATE_FILE" \
  --quiet
RESEND_EXIT=$?

Files:
• standup/individual/dave.md
• standup/individual/yon.md
• standup/individual/trac.md


The PM agent compiles the stand-up at 9 AM.
```

### Standup compiled
```
📋 Stand-Up — Day DD Mon YYYY

⚠️ Conflicts: <count or "None">

👥 Team focus:
• Dave: <first 1–2 items or "No check-in">
• Yon: <first 1–2 items or "No check-in">
• Trac: <first 1–2 items or "No check-in">


🤖 Agents: <one-line or "None received">

📁 Full file: standup/briefings/YYYY-MM/YYYY-MM-DD.md
```

### EOD reminder
```
🌙 End of Day — YYYY-MM-DD

Please write your check-in tonight so it's ready for tomorrow's 9:00 AM stand-up.

Files:
• standup/individual/dave.md
• standup/individual/yon.md
• standup/individual/trac.md

```

### Weekly RAG report
```
📊 Weekly Status Report — Week of DD Mon YYYY

<RAG status block — copy the emoji status lines from the weekly-rag file>

📁 Full report: standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md
```

---

## HTML Email Templates

All templates follow the site style guide. Always send via `--html-file` — never convert markdown to body text.

### Template 1 — Morning Standup Reminder

Subject: `Daily Stand-Up Reminder — YYYY-MM-DD`
File: `agents/project-manager/context/template/emails/1-standup-morning.html`
Placeholders: `{{DATE}}`

---

### Template 2 — Standup Compiled

Subject: `Daily Stand-Up — YYYY-MM-DD`
File: `agents/project-manager/context/template/emails/2-standup-compile.html`
Placeholders: `{{DAY}}`, `{{DATE}}`, `{{CONFLICTS_OR_NONE}}`, `{{DAVE_FOCUS}}`, `{{DAVE_BLOCKERS}}`, `{{YON_FOCUS}}`, `{{YON_BLOCKERS}}`, `{{TRAC_FOCUS}}`, `{{TRAC_BLOCKERS}}`, `{{AGENT_UPDATES}}`, `{{STANDUP_CONTENT}}`, `{{YYYY-MM}}`, `{{YYYY-MM-DD}}`

---

### Template 3 — End-of-Day Reminder

Subject: `Check-In Reminder — Tonight for YYYY-MM-DD`
File: `agents/project-manager/context/template/emails/3-eod-reminder.html`
Placeholders: `{{DATE}}`, `{{TOMORROW}}`

---

### Template 4 — Weekly RAG Report

Subject: `Weekly Status Report — Week of YYYY-MM-DD`
File: `agents/project-manager/context/template/emails/4-weekly-rag.html`
Placeholders: `{{DATE}}`, `{{GREEN_STATUS}}`, `{{AMBER_STATUS}}`, `{{RED_STATUS}}`, `{{TOP_RISKS}}`, `{{UPCOMING_MILESTONES}}`, `{{DECISIONS_NEEDED}}`, `{{RAG_CONTENT}}`, `{{YYYY-MM}}`, `{{YYYY-MM-DD}}`
