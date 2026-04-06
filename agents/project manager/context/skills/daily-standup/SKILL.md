---
name: daily-standup
description: Run the daily async stand-up cycle for the Mahjong Tarot team. Triggers on the morning schedule or when manually invoked. Reads Dave and Jan's check-in MD files, verifies freshness, pings missing members if past the 10 AM deadline, summarises all inputs, and appends the day's entry to the monthly report. Also assigns tasks in GitHub Projects for both humans and AI agents. Use this skill every morning at 9 AM, or any time someone says "run standup", "collect check-ins", or "do the morning cycle".
---

# Daily Stand-up Skill

## Purpose

Run the complete async stand-up cycle: collect human check-ins, enforce the 10 AM deadline, summarise the day, assign tasks, and log everything to the monthly report. This is the PM's most important daily action — it sets the direction for the whole team.

## File locations

| File | Path | Notes |
|------|------|-------|
| Dave's check-in | `standup/dave.md` | Must have today's date on line 1 |
| Jan's check-in | `standup/jan.md` | Must have today's date on line 1 |
| Monthly report | `reports/YYYY-MM.md` | Append today's block |

## Step-by-step

### 1. Read both check-in files

Read `standup/dave.md` and `standup/jan.md`. For each file, check line 1 for the datestamp:

```
date: YYYY-MM-DD
```

A check-in is **fresh** if the date matches today. A check-in is **stale or missing** if the date is wrong or the file is empty.

### 2. Handle missing check-ins

If it is **before 10:00 AM** and one or both check-ins are missing:
- Note who is missing and wait. The scheduled ping task will nudge them.

If it is **10:00 AM or later** and check-ins are still missing:
- Send a Gmail reminder to the missing person: *"Stand-up deadline passed — please submit your check-in now."*
- Re-check every 5 minutes until received (via the scheduled ping task).
- Once all check-ins are in, continue to step 3.

If **both check-ins are fresh**, continue immediately.

### 3. Summarise and plan

Read both check-ins fully. Then decide:
- **Human tasks**: what Dave and Jan will own today
- **Agent tasks**: what AI agents will execute today

Think about dependencies — if Dave is blocked waiting on Jan, flag it. If an agent task unblocks a human task, sequence them accordingly.

### 4. Append to the monthly report

Open `reports/YYYY-MM.md` and append a new daily block using this format:

```markdown
---

## YYYY-MM-DD

### Dave
[paste or summarise Dave's focus and blockers]

### Jan
[paste or summarise Jan's focus and blockers]

### Agent: [AgentName]
- [Task assigned]
- [Task assigned]

```

Keep each entry factual and concise — this document will be read back by AI later for querying, so clarity beats polish.

### 5. Create GitHub tasks

For each task identified in step 3, create a GitHub Projects task using the `gh` CLI:

```bash
gh project item-create <project-number> --owner <owner> --title "<task title>" --body "<acceptance criteria>"
```

Every task must have:
- A clear title (action verb + subject)
- Acceptance criteria in the body (what does "done" look like?)
- Assignee if known

### 6. Confirm completion

After appending the report and creating tasks, output a brief summary:
- Who checked in ✅ / who was missing ❌
- Number of tasks created for humans and agents
- Any blockers flagged
- Link or path to today's entry in the monthly report

## Check-in file format (expected)

```
date: YYYY-MM-DD
name: Dave

## Today's focus
- ...

## Blockers
None / [description]
```

If a check-in is present but not in this format, do your best to extract intent rather than rejecting it.

## Edge cases

- **Both check-ins are stale from yesterday**: Treat as missing and start the ping loop.
- **Agent has no tasks today**: Still include the agent block in the report with "No tasks assigned."
- **GitHub Projects CLI unavailable**: Log tasks as a bullet list at the end of today's report block instead, and note they need manual creation.
