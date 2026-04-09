---
name: solution-options
description: "Develops three solution options with pros/cons and a recommendation. MUST be used when the user asks 'how should we approach this?', 'what are our options for X?', 'what's the best way to solve Y?', or the problem is defined and it's time to decide how to solve it. Always includes a visual deliverable."
---

# Solution Options

## Purpose
Produces three distinct solution options for a defined problem, evaluates them against agreed criteria, recommends a path, and delivers an HTML visual to make the options concrete for David and Yon.

## Steps

### 1. Recap the problem
Restate the problem statement, target user, and success criteria from earlier analysis (or from the current conversation). Confirm with the human:
> "Is this still the frame we're working within?"

Do not proceed if the problem is still unclear.

### 2. Develop three options
For each option:
- **How it works** — brief description
- **Pros** — 3–4 specific advantages
- **Cons** — 3–4 specific trade-offs
- **Effort estimate** — rough (days / weeks / sprint)
- **Risk level** — Low / Medium / High

### 3. Identify decision criteria
Ask the human for 3–4 criteria to evaluate against (e.g. speed to market, user delight, cost, technical risk). Score each option 1–5 against each criterion and produce a comparison matrix.

### 4. Recommend a path
State clearly which option best serves the stated criteria and why. Also state: "What would need to be true to choose a different option?"

### 5. Write the document
Save to `agents/product_manager/output/solutions/<slug>.md`:

```markdown
# Solution Options: [Problem/Feature Name]
_Date: YYYY-MM-DD | Author: PM Agent_

## Problem Recap
[Problem statement + user + success criteria]

## Options

### Option A — [Name]
[Description, pros, cons, effort, risk]

### Option B — [Name]
[Description, pros, cons, effort, risk]

### Option C — [Name]
[Description, pros, cons, effort, risk]

## Evaluation Matrix
| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| ...       | .../5    | .../5    | .../5    |
| **Total** | ...      | ...      | ...      |

## Recommendation
**Option [X]** — [One paragraph justification]

What would need to be true to choose differently: [Condition]

## Next Step
[Specific action if Option X is approved]
```

### 6. Build the HTML visual
Create an HTML demo or comparison visual at `agents/product_manager/output/visuals/<slug>-options.html`. This is mandatory — text alone is not sufficient.

The visual should show all three options side-by-side with their key attributes and the recommendation highlighted.

### 7. Present to human
Share both the `.md` document and the HTML visual. Ask:
> "Which direction should we take?"

Wait for human approval before marking complete.

## File Paths
| Operation | Path |
|-----------|------|
| Write (doc) | `agents/product_manager/output/solutions/<slug>.md` |
| Write (visual) | `agents/product_manager/output/visuals/<slug>-options.html` |

## Edge Cases
- **Problem is not yet defined**: Do not generate options. Route to `idea-to-epic` first.
- **Human wants only 2 options**: Generate 2 but flag that a third option (even a "do nothing" baseline) is useful for comparison.
- **Human skips criteria definition**: Use default criteria: user impact, speed to market, and technical risk.
- **HTML visual is complex**: Simplify to a comparison card layout rather than an interactive prototype.
