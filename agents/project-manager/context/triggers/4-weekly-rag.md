# PM Weekly RAG Report

**Name**: `PM Weekly RAG Report`

**Description**: Generates the weekly RAG (Red/Amber/Green) status report every Friday at 4 PM. Reads the week's compiled stand-ups and decisions from `standup/briefings/YYYY-MM/`, checks Vercel for deployment status, and writes the report to `standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md`. Covers project health, upcoming milestones, top risks, and decisions needed. Sends via Lark webhook then Resend email; if both fail, appends a status note inline to the report file. Commits on a branch and opens a PR.

---

## Prompt

```
Run the weekly status report workflow from agents/project-manager/context/weekly-status-report.md and the release monitor workflow from agents/project-manager/context/release-monitor.md.

It is Friday 4 PM Asia/Saigon.

Git workflow first: git pull origin main → git checkout -b pm/weekly-rag/YYYY-MM-DD. All writes go on this branch.

Read standup/briefings/YYYY-MM/ for this week's compiled stand-ups and decisions. Check Vercel for deployment status.

Write the weekly RAG report to standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md using this format:
🟢 GREEN — on track
🟡 AMBER — needs attention | owner | resolution date
🔴 RED — needs escalation | impact | immediate action
📋 UPCOMING — key milestones in the next 2 weeks
⚠️ RISKS — top 3 with probability / impact / mitigation
🔔 DECISIONS NEEDED — items requiring decision with deadline

Read agents/project-manager/context/pm-notification-guide.md for the full notification pattern, Lark message text, and HTML email template (Template 4 — Weekly RAG Report).

Notification (send both — not fallback):
1. Lark webhook: POST to $LARK_WEBHOOK_URL with the "Weekly RAG report" message from pm-notification-guide.md, substituting YYYY-MM-DD and copying the RAG status lines from the report.
2. Resend CLI (always — install if missing: `npm install -g resend`). Substitute all `{{PLACEHOLDER}}` values in a copy of `agents/project-manager/context/template/emails/4-weekly-rag.html`, write to `/tmp/weekly-rag-email.html`, then send with `--html-file /tmp/weekly-rag-email.html`. Subject: "Weekly Status Report — Week of YYYY-MM-DD". Full pattern in pm-notification-guide.md.
3. If BOTH fail: append failure status inline at the bottom of standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md → git commit -m "pm(weekly-rag): YYYY-MM-DD" → git push origin pm/weekly-rag/YYYY-MM-DD → gh pr create --base main → gh pr merge --merge --auto.
```

---

**Schedule**: Fridays at 4:00 PM Asia/Saigon (`0 9 * * 5` UTC)
