---
name: build-persona
description: "Develops a fully structured user persona using Harvard Business frameworks. MUST be used when the user says 'who is our target user?', 'develop this persona', 'build out the persona for X', or David brings partial persona information that needs to be fully fleshed out."
---

# Build Persona

## Purpose
Takes whatever David already knows about a user type and builds it into a complete, framework-structured persona document ready for use in subsequent PM phases.

## Steps

### 1. Acknowledge the baseline
Accept whatever David has already provided (name, role, rough context). Do NOT re-ask for information already given.

### 2. Offer framework choice
Present the four Harvard frameworks and ask David to choose one:

> **Which framework fits best for what you're trying to understand?**
>
> - **A — Jobs-to-Be-Done (JTBD):** What is the user trying to accomplish, and why do they "hire" a product?
> - **B — Empathy Map:** What does the user think, feel, say, and do in their context?
> - **C — User Journey + Pain/Gain Profile:** What friction and delight moments exist across their experience?
> - **D — Outcome-Driven Innovation (ODI):** What measurable outcomes does the user want to achieve?

### 3. Ask 2–3 targeted questions only
Review the chosen framework and the baseline. Identify the 2–3 most critical unknowns. Ask only those — one at a time. Do not ask follow-ups unless an answer is critically ambiguous.

### 4. Synthesize the full persona
Assemble into a `.md` file at `agents/product_manager/output/personas/<slug>.md`:

```markdown
# Persona: [Name]
_Date: YYYY-MM-DD | Framework: [Chosen] | Author: PM Agent_

## Overview
[Name] — [Role] — [One-line description]

## Framework: [Chosen Framework Name]

[All framework dimensions, fully populated]

## Primary Use Case Scenarios
1. **[Context]** → [User need] → [Desired outcome]
2. **[Context]** → [User need] → [Desired outcome]

## Key Insight
[1–2 sentences capturing what makes this persona distinctive]
```

### 5. Present and confirm
Share the persona and ask:
> "Does this fully capture the person we're building for?"

Incorporate any corrections before marking persona as complete.

## File Paths
| Operation | Path |
|-----------|------|
| Write | `agents/product_manager/output/personas/<slug>.md` |

## Edge Cases
- **David provides very little baseline**: Ask one broader scoping question ("What do you know about this user so far?") before proposing frameworks.
- **David can't choose a framework**: Recommend JTBD as the default starting point — it's the most broadly useful.
- **Answers are too brief to populate the framework**: Make explicit, labelled assumptions, flag them, and ask David to confirm or correct.
