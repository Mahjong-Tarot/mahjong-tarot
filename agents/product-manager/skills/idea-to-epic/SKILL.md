---
name: idea-to-epic
description: "Translates a human idea or feature request into a structured epic and user stories. MUST be used when the user says 'we should build X', 'what if we added Y', 'users need Z', or brings any feature request or product idea. Always starts by asking what problem is being solved."
---

# Idea to Epic

## Purpose
Turns a raw idea into a documented epic with a clear problem statement, success criteria, and 3–5 user stories. Ensures every feature traces back to a real user problem before any work begins.

## Steps

### 1. Ask the problem question
Before anything else, ask:
> **"What is the problem we are trying to solve?"**

Do not proceed until this is answered clearly. Also ask:
- "Who is experiencing this problem?"
- "Why does this matter now?"

### 2. Search for existing work
Check `agents/product_manager/output/epics/` for any epic that already covers this problem space.
- If one exists: propose new user stories to add to it. Skip to step 5.
- If none exists: proceed to step 3.

### 3. Write the problem statement
Draft 2–3 sentences:
> "Customers struggle to [action] because [barrier], which leads to [negative outcome]."

Confirm with the human before proceeding.

### 4. Create the epic
Write a `.md` file to `agents/product_manager/output/epics/<slug>.md`:

```markdown
# Epic: [Title]
_Date: YYYY-MM-DD | Author: PM Agent_

## Problem Statement
[2–3 sentences]

## Description
[Brief rationale — why this epic exists]

## Success Criteria
1. [Measurable outcome 1]
2. [Measurable outcome 2]
3. [Measurable outcome 3]
```

### 5. Break into user stories
Create 3–5 user stories appended to the same epic file:

```markdown
## User Stories

### US-01: [Short title]
**As a** [user type], **I want** [capability] **so that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
```

### 6. Present to human
Share the epic and user stories. Ask:
> "Does this capture the problem correctly? Any stories to add, remove, or reframe?"

Wait for feedback before marking complete.

## File Paths
| Operation | Path |
|-----------|------|
| Read (existing epics) | `agents/product_manager/output/epics/` |
| Write | `agents/product_manager/output/epics/<slug>.md` |

## Output Format
Single `.md` file per epic containing: problem statement, description, success criteria, and user stories.

## Edge Cases
- **Idea is vague ("make it better")**: Ask "Better for whom, and in what situation?" before writing anything.
- **Epic already exists**: Add new user stories to the existing file rather than creating a duplicate.
- **Human skips the problem question**: Do not proceed to the epic. Restate the question once more, then wait.
