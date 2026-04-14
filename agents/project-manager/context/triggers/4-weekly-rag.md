# PM Weekly RAG Report

**Name**: `PM Weekly RAG Report`

**Description**: Generates the weekly RAG (Red/Amber/Green) status report every Friday at 4 PM. Reads the week's compiled stand-ups and decisions from `standup/briefings/YYYY-MM/`, checks Vercel for deployment status, and writes the report to `standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md`. Covers project health, upcoming milestones, top risks, and decisions needed. Sends via Lark CLI and Resend (both always); if both fail, appends a status note inline to the report file. Commits on a branch and opens a PR.

---

## Prompt

```
Run the weekly status report workflow from agents/project-manager/context/weekly-status-report.md and the release monitor workflow from agents/project-manager/context/release-monitor.md.

It is Friday 4 PM Asia/Saigon.

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
git checkout -b pm/weekly-rag/YYYY-MM-DD

All writes go on this branch.

## Step 2 — Generate the RAG report

Read standup/briefings/YYYY-MM/ for this week's compiled stand-ups and decisions. Check Vercel for deployment status.

Write the weekly RAG report to standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md using this format:
🟢 GREEN — on track
🟡 AMBER — needs attention | owner | resolution date
🔴 RED — needs escalation | impact | immediate action
📋 UPCOMING — key milestones in the next 2 weeks
⚠️ RISKS — top 3 with probability / impact / mitigation
🔔 DECISIONS NEEDED — items requiring decision with deadline

## Step 3 — Send summary to Lark, full report via Resend

Notification (send both — not fallback):

### 1. Lark CLI — structured priority summary

Build the message from the RAG report using the structure below — omit any section with no content. Then send with:

```bash
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --markdown $'<BUILT_SUMMARY>'
LARK_EXIT=$?
```

Message structure:

```
📊 Weekly Status — Week of YYYY-MM-DD

🔴 RED — ESCALATION NEEDED
• [Each red item — impact + immediate action required, one line each]
(Omit section if none)

🟡 AMBER — NEEDS ATTENTION
• [Each amber item — owner + resolution date, one line each]
(Omit section if none)

🟢 GREEN
• [Each green item — one line each]
(Omit section if none)

🔔 DECISIONS NEEDED
• [Each open decision — deadline + who decides, one line each]
(Omit section if none)

⚠️ TOP RISKS
• [Top 3 risks — probability / impact / mitigation, one line each]

🤖 AGENT TODO (this week)
• project-manager: [priority next action]
• writer: [priority next action]
• web-developer: [priority next action]
• image-designer: [priority next action]
(Include only agents with active work)

📁 Full report: standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md
```

Rules:
- RED items must always be first and include immediate action required
- Every decision must include a deadline date
- Keep each line under 80 characters
- Do not include full risk tables or milestone lists — distil to one actionable phrase per item

### 2. Resend CLI — full report

Send the complete RAG report content:
- Read standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md in full
- Substitute all `{{PLACEHOLDER}}` values in a copy of `agents/project-manager/context/template/emails/4-weekly-rag.html`, injecting the full content into `{{RAG_CONTENT}}`
- Write to /tmp/weekly-rag-email.html, then run:
   RESEND_API_KEY=$RESEND_API_KEY resend emails send \
     --from "$RESEND_FROM" \
     --to "$RESEND_TO" \
     --subject "Weekly Status Report — Week of YYYY-MM-DD" \
     --html-file /tmp/weekly-rag-email.html \
     --quiet

### 3. If BOTH fail

Append failure status inline at the bottom of standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md. Do not create any alerts folder or alert files.

## Step 4 — Commit and branch cleanup

AGENT_BRANCH="pm/weekly-rag/YYYY-MM-DD"

git add standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md
git commit -m "pm(weekly-rag): YYYY-MM-DD"
git push origin "$AGENT_BRANCH"
gh pr create --title "pm(weekly-rag): YYYY-MM-DD" --base main --body "Weekly RAG report YYYY-MM-DD"
gh pr merge --merge --auto --delete-branch

# Clean up local agent branch — only if it matches pm/* (never touch user branches)
git checkout main
git pull origin main
git branch -d "$AGENT_BRANCH" 2>/dev/null || true
```

---

**Schedule**: Fridays at 4:00 PM Asia/Saigon (`0 9 * * 5` UTC)
