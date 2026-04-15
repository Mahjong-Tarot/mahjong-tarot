---
name: resend-email
version: 1.0.0
description: "Send HTML emails to the Mahjong Tarot team via Resend CLI. Covers correct --to flag syntax, markdown-to-HTML conversion before injection, and cURL fallback when CLI fails."
metadata:
  requires:
    bins: ["resend"]
  installCmd: "npm install -g resend"
---

# Resend Email — PM Agent Notifications

Sends full HTML email reports to the team. Always runs alongside Lark (both always, not fallback).

## Critical: --to flag syntax

`--to` takes **space-separated** addresses, not a comma-separated string.

```bash
# WRONG — comma-separated string is rejected by the CLI
resend emails send --to "$RESEND_TO" ...

# CORRECT — convert comma-separated to space-separated first
TO_ARGS=$(echo "$RESEND_TO" | tr ',' ' ')
resend emails send --to $TO_ARGS ...
```

`RESEND_TO` is a comma-separated string (e.g. `dave@edge8.ai,yon@edge8.ai,trac.nguyen@edge8.ai`). Always expand it before passing to `--to`.

## Install check

```bash
if ! command -v resend &>/dev/null; then npm install -g resend; fi
```

## Markdown → HTML before injection

The briefing files (`standup/briefings/YYYY-MM/YYYY-MM-DD.md`, `weekly-rag-YYYY-MM-DD.md`) are raw Markdown. **Never inject raw Markdown into `{{STANDUP_CONTENT}}` or `{{RAG_CONTENT}}`** — it will render as literal `#`, `**`, `---` characters in the email.

Convert to HTML first:

```python
try:
    import markdown as md_lib
except ImportError:
    import subprocess
    subprocess.run(['pip', 'install', 'markdown'], capture_output=True)
    import markdown as md_lib

with open('standup/briefings/YYYY-MM/YYYY-MM-DD.md') as f:
    raw_content = f.read()

html_content = md_lib.markdown(raw_content, extensions=['nl2br', 'tables'])
# Now substitute html_content into {{STANDUP_CONTENT}} in the template
```

Extensions:
- `nl2br` — single newlines become `<br>` (preserves line breaks from the briefing)
- `tables` — renders Markdown table syntax as `<table>`

## Full send pattern

```bash
if ! command -v resend &>/dev/null; then npm install -g resend; fi
TO_ARGS=$(echo "$RESEND_TO" | tr ',' ' ')
RESEND_API_KEY=$RESEND_API_KEY resend emails send \
  --from "$RESEND_FROM" \
  --to $TO_ARGS \
  --subject "SUBJECT HERE" \
  --html-file /tmp/email-output.html \
  --quiet
RESEND_EXIT=$?

# Fallback: if CLI fails, send via Resend API directly using cURL
if [ $RESEND_EXIT -ne 0 ]; then
  python3 -c "
import json,subprocess,sys
html=open('/tmp/email-output.html').read()
payload=json.dumps({'from':'$RESEND_FROM','to':'$RESEND_TO'.split(','),'subject':'SUBJECT HERE','html':html})
r=subprocess.run(['curl','-s','-o','/dev/null','-w','%{http_code}','-X','POST','https://api.resend.com/emails','-H','Authorization: Bearer $RESEND_API_KEY','-H','Content-Type: application/json','--data',payload],capture_output=True,text=True)
sys.exit(0 if r.stdout.strip().startswith('2') else 1)
"
  RESEND_EXIT=$?
fi
```

Note: the cURL fallback uses `$RESEND_TO.split(',')` (Python list) so it correctly handles multiple recipients — no `TO_ARGS` conversion needed there.

## HTML templates

All email templates live at `agents/project-manager/context/template/emails/`. Always use the existing template — do not create new ones or inline HTML.

| Trigger | Template | Key placeholder |
|---------|----------|-----------------|
| Morning reminder | `1-standup-morning.html` | `{{DATE}}` |
| Standup compiled | `2-standup-compile.html` | `{{STANDUP_CONTENT}}` (HTML, not markdown) |
| EOD reminder | `3-eod-reminder.html` | `{{DATE}}`, `{{TOMORROW}}` |
| Weekly RAG | `4-weekly-rag.html` | `{{RAG_CONTENT}}` (HTML, not markdown) |

The `<div>` containers for `{{STANDUP_CONTENT}}` and `{{RAG_CONTENT}}` do **not** have `white-space:pre-wrap` — injected HTML will render normally.

## Environment

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | Verified sender address |
| `RESEND_TO` | Comma-separated recipient list |

Load with the standard Step 0 Python snippet before sending.
