---
name: blocker-triage
description: Automated triage workflow. Triggered automatically when the daily stand-up flags blockers, or runs on the midday check schedule. Scans GitHub Projects for blocked or stalled tasks, ranks by severity and age, drafts escalations for anything >48 hours unresolved, and writes a triage report to output/triage/.
trigger: Auto-triggered by daily-standup when blockers are flagged; also midday scheduled check
---

# Blocker Triage Workflow

## Purpose

Surface everything that's stuck before it quietly kills a deadline. A blocker that's been sitting for two days without action is a project risk — this workflow finds those early and gets the right person moving.

## Step-by-step

### 1. Pull all open tasks from GitHub Projects

```bash
gh project item-list <project-number> --owner <owner> --format json
```

Filter for tasks with status: `blocked`, `in progress` (stalled), or any label indicating a dependency or wait state.

Also check for tasks that have been `in progress` for more than 2 days without a status update — these are likely stalled even if not explicitly labelled blocked.

### 2. Classify each blocker

For each blocked or stalled task, determine:

| Field | What to find |
|-------|-------------|
| **Task** | Title and GitHub link |
| **Owner** | Who is assigned |
| **Age** | How many days since status last changed |
| **Type** | Internal (can be resolved within the team) vs. External (waiting on something outside) |
| **Severity** | H / M / L — based on impact on other tasks or milestones |

### 3. Rank by priority

Sort blockers using this logic:
1. **Age > 48h** → immediate escalation regardless of severity
2. **High severity** → surface first even if recent
3. **External dependency** → flag separately since resolution path is different
4. **Low severity + recent** → monitor, no action yet

### 4. Draft escalations for critical blockers

For any blocker that is >48h old or HIGH severity, draft a concise escalation note:

```
🔴 BLOCKER: [Task title]
Owner: [Name]
Blocked for: [X days]
Impact: [What can't proceed until this is resolved]
Action needed: [Specific ask — a decision, a conversation, an unblock]
```

These can be sent via Gmail or logged as a comment on the GitHub task.

### 5. Write triage report

Write the triage report to `agents/project manager/output/triage/triage-YYYY-MM-DD.md`:

```markdown
# Blocker Triage — YYYY-MM-DD

## 🔴 CRITICAL (>48h or high impact)
- [Task] | Owner: [Name] | Age: X days | [escalation drafted]

## 🟡 WATCH (recent, medium impact)
- [Task] | Owner: [Name] | Age: X days | Monitor

## 🟢 CLEAR
No blockers meeting escalation threshold.
```

Then send escalation notes via Gmail for any CRITICAL items, or log as GitHub comments if Gmail is unavailable.

## What counts as a blocker

- A task explicitly marked `blocked` in GitHub Projects
- A task `in progress` with no update in 48+ hours
- A task waiting on an external dependency (design, external API, third party)
- A task where the acceptance criteria are unclear and work can't proceed

## What does NOT count as a blocker

- A task that's simply not started yet (that's backlog management, not a blocker)
- A task in review (review is progress)
- A completed task
