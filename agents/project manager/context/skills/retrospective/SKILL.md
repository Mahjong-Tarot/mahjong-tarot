---
name: retrospective
description: Facilitate a lightweight sprint retrospective for the Mahjong Tarot team, synthesise themes from responses, and log action items with owners to the monthly report. Use this skill when someone says "facilitate retro", "let's do a retrospective", "sprint review", or at the end of each sprint boundary. Designed for a small async team — no video call required.
---

# Retrospective Skill

## Purpose

A retrospective is the team's chance to improve its own process. For a small async team, this doesn't need a scheduled meeting — it needs honest, structured reflection and committed action items that actually get followed up. This skill makes that happen.

## Format: Start / Stop / Continue

Keep it simple. Three questions:

1. **Start**: What should we start doing that we're not doing now?
2. **Stop**: What should we stop doing because it's slowing us down or adding no value?
3. **Continue**: What's working well that we should protect and keep doing?

## Step-by-step

### 1. Prompt Dave and Jan

Send each person a Gmail with the three questions and a 48-hour deadline to respond. Keep the message short:

```
Subject: Sprint Retro — quick async input needed

Hey [Name],

Sprint retro time. Three questions — bullet points are fine:

1. Start: What should we start doing?
2. Stop: What should we stop doing?
3. Continue: What's working well?

Reply by [date + 48h]. Takes 5 minutes.

— PM
```

### 2. Collect responses

Responses come back via email or directly as a check-in update. Once both are received (or 48h has passed — proceed with what you have), move to synthesis.

### 3. Synthesise themes

Read all responses and identify recurring themes across Dave and Jan's answers. Group similar points together. Name each theme clearly. Don't list every individual bullet — find the pattern underneath.

For example, if Dave says "more frequent PR reviews" and Jan says "review bottleneck is slowing us down", the theme is: *Code review process is a bottleneck.*

### 4. Generate action items

For each meaningful theme, define one concrete action item:
- **What**: a specific, doable change (not "improve communication")
- **Who**: one named owner (Dave or PM or Jan — not "the team")
- **When**: a deadline or "by next retro"

Limit to 3–5 action items maximum. A long list gets ignored. A short list gets done.

### 5. Append to monthly report

Add the retrospective block to `reports/YYYY-MM.md`:

```markdown
---

### Retrospective — Sprint [N] · YYYY-MM-DD

**What went well (Continue)**
- [Theme]
- [Theme]

**What to improve (Stop/Start)**
- [Theme]
- [Theme]

**Action items**
| Action | Owner | Due |
|--------|-------|-----|
| [Specific change] | Dave / Jan / PM | YYYY-MM-DD |
| ... | ... | ... |

```

### 6. Create GitHub tasks for action items

Each action item becomes a GitHub Projects task so it doesn't get lost:

```bash
gh project item-create <number> --owner <owner> --title "Retro action: [action]" --body "Owner: [Name] | Due: [date]"
```

### 7. Follow up

At the next retro, read the previous retro's action items before prompting for new input. Close items that were completed. Re-raise any that weren't — and ask why.

## Edge cases

- **Only one person responds**: Run the retro with what you have. Note that Jan/Dave did not respond. Carry their non-response as an open action item.
- **Nothing to stop**: That's fine — don't force it. A retro with only "continue" items is a healthy sprint.
- **Too many action items surfaced**: Prioritise by asking: "Which one change would have the biggest positive impact?" Take that one first.
