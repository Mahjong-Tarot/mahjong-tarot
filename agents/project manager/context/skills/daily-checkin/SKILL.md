---
name: daily-checkin
description: Help a human team member (Dave or Yon) structure and write their daily check-in MD file. Use this skill when someone says "help me write my check-in", "I need to do my standup", "fill in my check-in", or "structure my daily update". Guides the human through what they're working on and any blockers, then writes the correctly formatted file to standup/<name>.md.
---

# Daily Check-in Skill

## Purpose

Guide a human through their daily check-in and write the result to their `standup/<name>.md` file in the correct format, ready for the PM agent to pick up.

This skill is human-facing — it asks questions conversationally, structures the answers, and handles the file write. The human should not need to know the file format.

---

## Step-by-step

### 1. Identify the person

If the person's name is not already clear from context, ask:

> *"Are you Dave or Yon?"*

Map the name to the correct file:
- Dave → `standup/dave.md`
- Yon → `standup/yon.md`

### 2. Ask about today's focus

Ask open-ended — do not provide a template yet:

> *"What are you working on today? List anything you plan to complete or make progress on."*

Wait for the response. If the person gives very brief or vague answers (e.g. "the website"), follow up:

> *"Can you be a bit more specific? For example, which part of the website, and what's the intended outcome by end of day?"*

Collect 1–5 focus items. Restate them back as bullet points for confirmation:

> *"Here's what I've got for your focus:*
> *- ...*
> *- ...*
> *Does that look right?"*

Adjust if needed.

### 3. Ask about blockers

> *"Are there any blockers — things stopping you or slowing you down right now?"*

Acceptable responses:
- "None" / "No blockers" → record as `None`
- One or more blockers → ask for brief description of each: what it is, who or what is needed to unblock it

If a blocker has been open for more than 1 day, note it so the PM can flag it for triage.

### 4. Ask about carried-over work (optional, quick)

> *"Anything left over from yesterday that's rolling into today?"*

If yes, fold it into Today's focus. If no, move on.

### 5. Write the check-in file

Using today's date (`YYYY-MM-DD`), write the following to `standup/<name>.md`, **replacing** any previous content:

```markdown
date: YYYY-MM-DD
name: [Name]

## Today's focus
- [item 1]
- [item 2]
- ...

## Blockers
[None | description of blocker(s)]
```

Rules:
- Line 1 must be `date: YYYY-MM-DD` — the PM uses this to verify freshness
- Focus items should be action-oriented (verb + outcome), not vague labels
- Blockers section must always be present, even if "None"
- Do not add any extra sections or headers — the PM reads this programmatically

### 6. Confirm to the human

After writing the file, tell the person:

> *"Your check-in is saved to `standup/<name>.md`. The PM will pick it up during the morning cycle. You're all set."*

If it is already past 10:00 AM, add:

> *"Note: the stand-up deadline has passed. The PM may already be pinging — this will update your status immediately."*

---

## Conversational tone

- Keep it brief and friendly — this should take under 2 minutes
- Do not lecture about process or format
- If someone says "just write it based on what I told you", do it — do not ask more questions
- If someone pastes a wall of text, extract the relevant focus items and blockers yourself, confirm, then write

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Person is not Dave or Yon | Write to `standup/<name>.md` using their provided name; note that the PM may not recognise it |
| No focus items given | Ask once more; if still nothing, write "No focus items provided" and flag it |
| Check-in already exists for today | Overwrite it — the new entry is the canonical one |
| Person wants to add more later | Tell them to re-run this skill and the file will be updated |
