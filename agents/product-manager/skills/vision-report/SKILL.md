---
name: vision-report
description: "Writes a structured markdown vision report (press release style) for a feature or product direction. MUST be used when the user says 'write a press release', 'write a vision report for X', 'define the end vision for Y', or David/Yon wants to articulate what success looks like before building begins."
---

# Vision Report

## Purpose
Produces a versioned `.md` vision report written in press-release style. Forces the team to define outcomes before solutions, surfaces requirements from benefit claims, and creates a durable reference document that evolves with the product.

## Steps

### 1. Clarify the vision
Ask:
- "What outcome does this create for users?"
- "How should users feel or behave differently after using it?"
- "What makes this genuinely different or better than alternatives?"

### 2. Determine the version number
Check `agents/product_manager/output/vision-reports/` for existing files matching this feature slug.
- First version: `<slug>-v1.md`
- Each revision: increment — `<slug>-v2.md`, `<slug>-v3.md`, etc.
- Never overwrite an existing version.

### 3. Write the vision report
Save to `agents/product_manager/output/vision-reports/<slug>-v<n>.md`:

```markdown
# [Feature Name] — Vision Report
_Date: YYYY-MM-DD | Version: vN | Author: PM Agent | Audience: David, Yon_

## Headline
[One sentence. Benefit-focused, customer-first.]

## The Problem
[Who is affected, what the problem is, and why it matters now.]

## The Solution
[What we are building and why this approach is right.]

## What Changes for the User
[How users feel and behave differently after this ships.]

## Why This Matters to the Business
[Strategic value, market differentiation, or competitive angle.]

## Customer Voice (Hypothetical)
> "[A synthesized quote capturing the ideal user reaction.]"

## Success Looks Like
1. [Measurable outcome 1]
2. [Measurable outcome 2]
3. [Measurable outcome 3]
```

### 4. Extract requirements
Pull each benefit claim from the report and convert to a testable metric or requirement. Append to the same file:

```markdown
## Requirements Extracted
| Benefit Claim | Requirement / Success Metric | Feasibility Question |
|---------------|------------------------------|----------------------|
| ...           | ...                          | ...                  |
```

### 5. Present and iterate
Share the report with David and Yon. Ask:
> "Does this capture the vision? Any section to strengthen or reframe?"

Each revision is a new versioned file. Never edit a published version.

## File Paths
| Operation | Path |
|-----------|------|
| Read (version check) | `agents/product_manager/output/vision-reports/` |
| Write | `agents/product_manager/output/vision-reports/<slug>-v<n>.md` |

## Edge Cases
- **Feature name is vague**: Ask for a working title before writing. The slug must be stable.
- **David wants to edit a published version**: Create a new version instead. Explain that versioning preserves history for stakeholders.
- **Requirements extraction yields nothing testable**: Flag explicitly — "This claim needs a measurable definition of success." Ask David to define it.
