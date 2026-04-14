# PM Agent — Notification Channels

## Overview

Notification pattern for every trigger: **Lark + Resend (both always) → inline log on failure**

- **Lark webhook** — instant team channel message (no domain required)
- **Resend email** — styled HTML email to the team; sent alongside Lark, not as a fallback
- **Inline log** — appends status to the daily briefing file only if **both** Lark and Resend fail

Never create alerts folders or alert files. Document failures inline.

> **Sender**: `RESEND_FROM` is read from `.env.local`. Requires the domain to be a verified sending domain in Resend.

---

## Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| `LARK_CHAT_ID` | Lark group chat ID (oc_xxx format) | `oc_e5fe68740864439744b3fb0f31f81040` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxx` |
| `RESEND_FROM` | Verified sender address (Resend) | `mahjong-pm@davehajdu.com` |
| `RESEND_TO` | Comma-separated recipients | `dave@edge8.ai,yon@edge8.ai,trac.nguyen@edge8.ai` |

Set these in `~/.claude/settings.json` under `env`.

---

## Channel 1 — Lark CLI

Use `lark-cli im +messages-send` with bot identity. The message content depends on the trigger:

- **Reminders** (morning, EOD): use `--text` with `$'...'` to preserve exact line breaks
- **Reports** (standup compiled, weekly RAG): use `--markdown` so headings and bullets render in Lark

```bash
# Reminder (plain text, exact formatting)
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'MESSAGE_HERE'
LARK_EXIT=$?

# Report summary (markdown rendering)
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --markdown $'SUMMARY_HERE'
LARK_EXIT=$?
```

---

## Channel 2 — Resend Email (via Resend CLI)

Uses the official Resend CLI (`resend`). Install it if not present, then send using `--html-file` to read the template directly — no shell quoting or JSON encoding needed.

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
```

Replace `SUBJECT_HERE` with the trigger subject and `TEMPLATE_FILE_HERE` with the path to the relevant template under `agents/project-manager/context/template/emails/`.

---

## Channel 3 — Inline Log (fallback)

If both Lark and Resend fail, append this block to the bottom of `standup/briefings/YYYY-MM/YYYY-MM-DD.md`:

```
---
**Notification failure — YYYY-MM-DD HH:MM**
Lark CLI: exited $LARK_EXIT
Resend: exited $RESEND_EXIT
Action: Team must check this file manually.
```

---

## Lark Message Formats

### Morning reminder
```
🌅 Daily Stand-Up Reminder — YYYY-MM-DD

Please submit your check-in to standup/individual/<name>.md before 9:00 AM today.

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

All templates follow the Mahjong Mirror web style guide: Midnight Indigo headers, Celestial Gold accents, Warm Cream backgrounds, no rounded corners, editorial typography.

### Template 1 — Morning Standup Reminder

Subject: `Daily Stand-Up Reminder — YYYY-MM-DD`
File: `agents/project-manager/context/template/emails/1-standup-morning.html`
Placeholders: `{{DATE}}`

---

### Template 2 — Standup Compiled

Subject: `Stand-Up Summary — YYYY-MM-DD`
File: `agents/project-manager/context/template/emails/2-standup-compile.html`
Placeholders: `{{DAY}}`, `{{DATE}}`, `{{CONFLICTS_OR_NONE}}`, `{{DAVE_FOCUS}}`, `{{DAVE_BLOCKERS}}`, `{{YON_FOCUS}}`, `{{YON_BLOCKERS}}`, `{{TRAC_FOCUS}}`, `{{TRAC_BLOCKERS}}`, `{{AGENT_UPDATES}}`, `{{STANDUP_CONTENT}}`, `{{YYYY-MM}}`, `{{YYYY-MM-DD}}`

---

### Template 3 — End-of-Day Reminder

Subject: `Check-In Reminder — Tonight for {{DATE}}`
File: `agents/project-manager/context/template/emails/3-eod-reminder.html`
Placeholders: `{{DATE}}`, `{{TOMORROW}}`

---

### Template 4 — Weekly RAG Report

Subject: `Weekly Status Report — Week of {{DATE}}`
File: `agents/project-manager/context/template/emails/4-weekly-rag.html`
Placeholders: `{{DATE}}`, `{{GREEN_STATUS}}`, `{{AMBER_STATUS}}`, `{{RED_STATUS}}`, `{{TOP_RISKS}}`, `{{UPCOMING_MILESTONES}}`, `{{DECISIONS_NEEDED}}`, `{{YYYY-MM}}`, `{{YYYY-MM-DD}}`

---

## Usage pattern for PM agent

For each trigger, send both Lark and Resend. Only fall back to inline log if **both** fail.

```bash
# 1. Send Lark (always)
LARK_STATUS=$(curl -s -o /tmp/lark_resp.json -w "%{http_code}" \
  -X POST "$LARK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"msg_type":"text","content":{"text":"LARK_MESSAGE"}}')

# 2. Send Resend email (always — install CLI if missing)
if ! command -v resend &>/dev/null; then
  npm install -g resend
fi

TO_ARGS=$(echo "$RESEND_TO" | tr ',' ' ')

resend emails send \
  --from "$RESEND_FROM" \
  --to $TO_ARGS \
  --subject "SUBJECT" \
  --html-file "TEMPLATE_FILE" \
  --quiet
RESEND_EXIT=$?

# 3. Only if BOTH failed — append inline to daily file
if [ "$LARK_STATUS" != "200" ] && [ $RESEND_EXIT -ne 0 ]; then
  echo "
---
**Notification failure — $(date '+%Y-%m-%d %H:%M')**
Lark: HTTP $LARK_STATUS
Resend: CLI exited $RESEND_EXIT
Action: Team must check this file manually." >> "standup/briefings/$(date '+%Y-%m')/$(date '+%Y-%m-%d').md"
fi
```
