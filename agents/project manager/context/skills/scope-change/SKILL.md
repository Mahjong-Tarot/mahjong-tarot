---
name: scope-change
description: Assess the impact of a proposed scope change on schedule, capacity, and current sprint commitments. Produce a structured change assessment and log it to the decision log. Use this skill when someone says "assess this change", "we want to add X", "scope change", "new requirement", or "can we fit this in?". Prevents scope creep by making the trade-off visible before committing.
---

# Scope Change Assessment Skill

## Purpose

Every scope change has a cost — in time, in focus, or in something else that doesn't get done. This skill makes that cost visible so Dave and Jan can make an informed decision rather than casually absorbing new work until the sprint collapses.

## Step-by-step

### 1. Capture the proposed change

Ask (or extract from the user's message) the following:

- **What**: What is being added, changed, or removed?
- **Why**: What is the business or user reason for this change?
- **Who requested it**: Dave, Jan, or external stakeholder?
- **Urgency**: Must-have now, nice-to-have, or future consideration?

### 2. Assess impact on current sprint

Pull the current sprint's committed tasks from GitHub Projects:

```bash
gh project item-list <number> --owner <owner> --format json
```

For the proposed change, estimate:

| Dimension | Assessment |
|-----------|------------|
| **Effort** | Small (<1 day) / Medium (1–3 days) / Large (>3 days) |
| **Who is affected** | Dave / Jan / AI agents / all |
| **What gets displaced** | Which current task(s) would slip or be dropped to fit this in? |
| **Dependencies introduced** | Does this change require something else to be done first? |
| **Quality risk** | Does adding this mid-sprint increase the chance of bugs or incomplete work? |

Be honest about effort. Err toward overestimating — it's better to pleasantly surprise than to under-deliver.

### 3. Recommend a path

Based on the assessment, recommend one of three options:

**Option A — Accept now**: The change is small enough to absorb without displacing anything meaningful. Add it to the sprint.

**Option B — Accept in next sprint**: The change has real merit but the current sprint is already committed. Backlog it for next sprint planning.

**Option C — Reject or defer**: The change is out of scope, low value, or would require dropping something more important. Document the decision and the reason.

Make a clear recommendation. Don't present all three as equally valid — the PM's job is to have an opinion.

### 4. Log the decision

Append to `context/decisions.md`:

```markdown
## Scope Change Decision — YYYY-MM-DD

**Proposed change**: [Short description]
**Requested by**: [Name]
**Recommendation**: Accept now / Accept next sprint / Reject
**Rationale**: [Why this recommendation]
**Trade-off**: [What gets displaced or delayed if accepted]
**Decision**: [Pending Dave/Jan confirmation / Approved / Rejected]
**Date**: YYYY-MM-DD
```

### 5. If accepted: create the task

If the change is accepted (now or next sprint), create a GitHub Projects task with clear acceptance criteria:

```bash
gh project item-create <number> --owner <owner> --title "<change title>" --body "Acceptance criteria: [what done looks like]"
```

If accepted for next sprint, add a `next-sprint` label so it surfaces in the next planning cycle.

## What makes a good acceptance criteria

Acceptance criteria answer: *How will we know this is done?*

Bad: "Implement the new feature"
Good: "User can upload a profile photo. Supported formats: JPG, PNG. Max size: 5MB. Photo displays in the header within 2 seconds of upload."

Always include acceptance criteria. A task without them can never be truly "done".

## Key principle

The PM's job in scope change is not to say yes or no — it's to make the trade-off visible so the team can decide with full information. Never quietly absorb a change without surfacing what it costs.
