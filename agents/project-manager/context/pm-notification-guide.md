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
| `LARK_CHAT_ID` | Lark group chat ID (oc_xxx format) | `oc_xxxxxxxxxxxxxxxxxx` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxx` |
| `RESEND_FROM` | Verified sender address (Resend) | `mahjong-pm@davehajdu.com` |
| `RESEND_TO` | Comma-separated recipients | `dave@edge8.ai,yon@edge8.ai,trac.nguyen@edge8.ai,khang.h.nguyen@edge8.ai` |

Set these in `~/.claude/settings.json` under `env`.

---

## Channel 1 — Lark CLI

Use `lark-cli im +messages-send` with bot identity. The message content depends on the trigger:

- **Reminders** (morning, EOD): use `--text` with `$'...'` to preserve exact line breaks
- **Reports** (standup compiled, weekly RAG): use `--markdown` so headings and bullets render in Lark

```bash
# Reminder (plain text, exact formatting)
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'MESSAGE_HERE'

# Report summary (markdown rendering)
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --markdown $'SUMMARY_HERE'
```

Capture exit code to determine if fallback is needed:
```bash
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'...'
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
```

Replace `SUBJECT_HERE` with the trigger subject and `TEMPLATE_FILE_HERE` with the path to the relevant HTML template under `agents/project-manager/context/template/emails/`.

---

## Channel 3 — Inline Log (fallback only)

Only used if **both** Lark CLI and Resend fail. Append to the bottom of the relevant daily file:

```
---
**Notification failure — YYYY-MM-DD HH:MM**
Lark CLI: [exit code or error]
Resend: [exit code or error]
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

# 3. Only if BOTH failed — append inline to daily file
if [ $LARK_EXIT -ne 0 ] && [ $RESEND_EXIT -ne 0 ]; then
  echo "
---
**Notification failure — $(date '+%Y-%m-%d %H:%M')**
Lark CLI: exited $LARK_EXIT
Resend: exited $RESEND_EXIT
Action: Team must check this file manually." >> "standup/briefings/$(date '+%Y-%m')/$(date '+%Y-%m-%d').md"
fi
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
Placeholders: `{{DAY}}`, `{{DATE}}`, `{{CONFLICTS_OR_NONE}}`, `{{DAVE_FOCUS}}`, `{{DAVE_BLOCKERS}}`, `{{YON_FOCUS}}`, `{{YON_BLOCKERS}}`, `{{TRAC_FOCUS}}`, `{{TRAC_BLOCKERS}}`, `{{KHANG_FOCUS}}`, `{{KHANG_BLOCKERS}}`, `{{AGENT_UPDATES}}`, `{{STANDUP_CONTENT}}`, `{{YYYY-MM}}`, `{{YYYY-MM-DD}}`

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
