---
name: lark-send
version: 1.0.0
description: "Send messages to the Mahjong Tarot team Lark group chat via bot identity. Wraps lark-cli im +messages-send for PM agent notifications, reminders, and reports."
metadata:
  requires:
    bins: ["lark-cli"]
  source: "Derived from userSettings:lark-im (+messages-send shortcut)"
---

# Lark Send — PM Agent Notifications

Sends messages to the Labs group chat using bot identity (`tenant_access_token`). No OAuth required.

## Identity rule

**Default: `--as bot`** — uses the pre-configured `tenant_access_token`. No interactive login needed.

Use `--as user` **only** when the user explicitly asks Claude to act as them, send a message under their name, or perform an action on their behalf. `--as user` requires OAuth login.

## CLI fallback

Always resolve the command with a fallback in case `lark-cli` is not on `PATH`:

```bash
LARK_CMD=lark-cli; command -v lark-cli &>/dev/null || LARK_CMD="npx lark-cli"
```

Then use `$LARK_CMD` in place of `lark-cli`.

## Message type by trigger

| Trigger | Flag | Why |
|---------|------|-----|
| Morning reminder, EOD reminder | `--text $'...'` | Plain text with exact line breaks; no Markdown conversion |
| Standup compiled, Weekly RAG | `--markdown $'...'` | Renders headings and bullets in Lark |

## Commands

```bash
# Reminder (plain text, exact formatting — line breaks via $'...')
LARK_CMD=lark-cli; command -v lark-cli &>/dev/null || LARK_CMD="npx lark-cli"
$LARK_CMD im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
  --text $'🌅 Daily Stand-Up Reminder — YYYY-MM-DD\n\nMessage body here.'
LARK_EXIT=$?

# Report summary (markdown rendering — headings and bullets)
LARK_CMD=lark-cli; command -v lark-cli &>/dev/null || LARK_CMD="npx lark-cli"
$LARK_CMD im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
  --markdown $'## Stand-Up Summary\n\n• Item 1\n• Item 2'
LARK_EXIT=$?
```

## Environment

| Variable | Source | Description |
|----------|--------|-------------|
| `LARK_CHAT_ID` | `.env` / `.env.local` | Labs group chat ID (`oc_xxx`) |

Load with the standard Step 0 Python snippet before sending.

## What `--markdown` does

`--markdown` is **not** raw Markdown passthrough. The shortcut converts the input into a Feishu `post` JSON payload:
- Headings are normalised (`# Title` → `#### Title`)
- Spacing and blank lines may be compressed
- It always becomes `msg_type=post` with a single `zh_cn` locale

Use `--text $'...'` when exact line breaks and spacing matter (reminders). Use `--markdown` when readable formatting is the priority (reports).

## Full reference

The authoritative `+messages-send` reference is at:
`~/.claude/skills/lark-im/references/lark-im-messages-send.md`

Read it for: `--content` JSON format, @mention syntax, idempotency keys, media uploads, dry-run.
