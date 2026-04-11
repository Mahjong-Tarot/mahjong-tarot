---
name: competitive-analysis
description: "Researches and documents how competitors solve a specific problem. MUST be used when the user asks 'how do competitors handle X?', 'what does the market look like for Y?', 'are there similar products?', or requests competitive intelligence. Produces a landscape doc with gaps and differentiation angles."
---

# Competitive Analysis

## Purpose
Produces a structured competitive landscape document covering 3–5 competitors — their features, positioning, pricing, strengths, and weaknesses — and synthesizes 2–3 differentiation angles for the team.

## Steps

### 1. Define the scope
Ask:
- "Which competitors should we include?" (or propose 3–5 if the human is unsure)
- "Which aspects matter most — features, UX, pricing, positioning, or all?"
- "What are we trying to learn from this analysis?"

### 2. Research each competitor
Use web search to investigate each competitor. For each, document:
- **How they solve the problem** (feature set, approach)
- **Their positioning** (messaging, target user)
- **Pricing model** (if publicly available)
- **Strengths** (2–3)
- **Weaknesses** (2–3)

### 3. Identify patterns and gaps
Across all competitors, find:
- Features everyone has (table stakes)
- Features nobody has (gaps / opportunities)
- Underserved user needs
- Positioning white space

### 4. Synthesize and write the document
Save to `agents/product_manager/output/competitive/<slug>.md`:

```markdown
# Competitive Analysis: [Topic]
_Date: YYYY-MM-DD | Author: PM Agent_

## Scope
[What we analyzed and why]

## Competitor Profiles

### [Competitor 1]
- **Approach:** ...
- **Positioning:** ...
- **Pricing:** ...
- **Strengths:** ...
- **Weaknesses:** ...

[Repeat for each competitor]

## Landscape Summary
[Common patterns, table-stakes features, pricing norms]

## Gaps & Opportunities
1. [Gap 1]
2. [Gap 2]

## Differentiation Angles
1. **[Angle 1]:** [Why this could win]
2. **[Angle 2]:** [Why this could win]
3. **[Angle 3]:** [Why this could win]
```

### 5. Present to human
Share the document and ask:
> "Which of these differentiation angles resonates most?"

Wait for feedback before marking complete.

## File Paths
| Operation | Path |
|-----------|------|
| Write | `agents/product_manager/output/competitive/<slug>.md` |

## Edge Cases
- **Competitor has no public pricing**: Note "pricing not publicly available" and move on.
- **Web search unavailable**: Note the limitation, produce the analysis from known context, and flag gaps explicitly.
- **Human names a non-existent competitor**: Flag it, ask if they meant a similar known brand, and confirm before researching.
