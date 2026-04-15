---
name: weekly-status-report
description: Scheduled Friday workflow. Runs at 4 PM every Friday. Pulls data from the monthly report, GitHub Projects, the RAID log, and Vercel to produce a structured RAG (Red/Amber/Green) status report and appends it to the monthly report file.
trigger: Friday 4:00 PM (scheduled)
---

# Weekly Status Report Workflow

## Purpose

Produce a structured weekly status report that tells the team and any stakeholders exactly where things stand — what's green, what needs attention, and what needs escalation — without sugarcoating or padding.

## Data sources to read

Before writing the report, gather current state from:

1. **`standup/briefings/YYYY-MM/`** — Read this week's daily compiled stand-ups (`YYYY-MM-DD.md` files Mon–Fri) to understand what was worked on and what blockers appeared.
2. **GitHub Projects** — Run `gh project list` and `gh project item-list <number>` to get task status (open, in progress, done, blocked).
3. **`standup/briefings/YYYY-MM/raid.md`** — Check for any open risks or issues logged this week.
4. **Vercel MCP** — List recent deployments to report on release activity.

## Report format

Write the report to `standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md` (create the monthly folder if needed):

```markdown
### Weekly Status — YYYY-MM-DD

🟢 **GREEN — On track**
[What is proceeding as planned and why. Be specific — name the tasks or milestones.]

🟡 **AMBER — Needs attention**
[What is at risk. For each item: what it is, who owns it, target resolution date.]

🔴 **RED — Escalation needed**
[What is blocked or off-track. Impact if unresolved. Immediate action required.]

📋 **UPCOMING — Next 2 weeks**
[Key milestones, deadlines, or sprint boundaries coming up.]

⚠️ **TOP RISKS**
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| ...  | H/M/L      | H/M/L  | ...        |

🔔 **DECISIONS NEEDED**
[Any items requiring Dave or Yon to decide, with deadline if known.]

📊 **METRICS THIS WEEK**
- Tasks completed: X
- Tasks in progress: X
- Blockers opened: X / resolved: X
- Deployments: X (via Vercel)
```

## How to assign RAG status

Be honest. The instinct is to make things look green — resist it.

- 🟢 **GREEN**: Work is proceeding, no meaningful risks, on schedule.
- 🟡 **AMBER**: A risk or delay exists but has a clear owner and mitigation plan. Not yet a crisis.
- 🔴 **RED**: A blocker is unresolved >48h, a milestone is in jeopardy, or escalation is genuinely needed.

If nothing is red this week, that's great — say so clearly rather than inventing something. If everything is red, don't soften it.

## Output

After appending the report, confirm:
- Path and heading where it was written
- Overall RAG colour for the week (the dominant status)
- Any items flagged RED that need immediate Dave/Yon attention
