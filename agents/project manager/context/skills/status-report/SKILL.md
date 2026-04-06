---
name: status-report
description: Generate the weekly RAG (Red/Amber/Green) status report for the Mahjong Tarot project and append it to the monthly report file. Use this every Friday at 4 PM, or whenever someone says "generate status report", "what's our status", "weekly report", or "how are we tracking". Pulls data from GitHub Projects, recent daily entries in the monthly report, and the RAID log to produce a structured, honest snapshot of where the project stands.
---

# Status Report Skill

## Purpose

Produce a structured weekly status report that tells the team and any stakeholders exactly where things stand — what's green, what needs attention, and what needs escalation — without sugarcoating or padding.

## Data sources to read

Before writing the report, gather current state from:

1. **`reports/YYYY-MM.md`** — Read this week's daily stand-up entries (Mon–Fri) to understand what was worked on and what blockers appeared.
2. **GitHub Projects** — Run `gh project list` and `gh project item-list <number>` to get task status (open, in progress, done, blocked).
3. **`context/RAID.md`** — Check for any open risks or issues logged this week.
4. **Vercel MCP** — List recent deployments to report on release activity.

## Report format

Append the following block to `reports/YYYY-MM.md` under a `### Weekly Status — YYYY-MM-DD` heading:

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
