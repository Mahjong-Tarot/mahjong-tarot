# PM Weekly RAG Report

**Name**: `PM Weekly RAG Report`

**Description**: Generates the weekly RAG (Red/Amber/Green) status report every Friday at 4 PM. Reads the week's compiled stand-ups and decisions from `standup/briefings/YYYY-MM/`, checks Vercel for deployment status, and writes the report to `standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md`. Covers project health, upcoming milestones, top risks, and decisions needed. Sends via Telegram then Lark; if both fail, appends a status note to the report file. Commits on a branch and opens a PR.

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

Send the weekly summary: Telegram → Lark. If both fail, append the notification status at the bottom of standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md → git commit -m "pm(weekly-rag): YYYY-MM-DD" → git push origin pm/weekly-rag/YYYY-MM-DD → gh pr create --title "pm(weekly-rag): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

**Schedule**: Fridays at 4:00 PM Asia/Saigon (`0 9 * * 5` UTC)