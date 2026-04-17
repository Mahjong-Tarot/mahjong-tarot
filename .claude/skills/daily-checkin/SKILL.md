---
name: daily-checkin
description: Help a human (Dave or Yon) or an agent write their daily check-in. Use when someone says "help me write my check-in", "I need to do my standup", "update my standup", or "fill in my check-in". Writes human check-ins to standup/individual/[name].md and updates the agent's section in standup/individual/agents.md.
---

# Daily Check-in Skill

## Purpose

Guide a human or agent through their daily check-in and write the result to the correct file, ready for the PM agent to pick up at 9 AM.

---

## Step 1 — Identify who is checking in

Determine whether the caller is a **human** or an **agent**.

**If human** (Dave or Yon) → go to the Human Check-in flow below.
**If agent** (project-manager, web-developer, writer, product-manager, etc.) → go to the Agent Check-in flow below.

If unclear, ask:

> *"Are you a human team member or an agent checking in?"*

---

## Human Check-in Flow

### 1. Confirm the person

If not already clear from context, ask:

> *"Who are you? (Dave, Yon, or Trac)"*

Map to file:
- Dave → `standup/individual/dave.md`
- Yon → `standup/individual/yon.md`
- Trac → `standup/individual/trac.md`

### 2. Ask about today's focus

> *"What are you working on today?"*

If the answer is vague, follow up for specifics. Collect 1–5 focus items and confirm them back before writing.

### 3. Ask about notes (optional)

> *"Any context worth sharing — background, decisions made, anything the team should know?"*

Capture briefly if yes; skip if no.

### 4. Ask about blockers

> *"Any blockers stopping or slowing you down?"*

Record `None` or a brief description per blocker.

### 5. Determine the check-in date

Before writing, check the current local time and set the date accordingly:

| Time of check-in | Date to use | Reason |
|------------------|-------------|--------|
| Before 09:00 | **Today** | Early morning = today's standup |
| 09:00 or later | **Tomorrow** | Standup has already run or is imminent — prep for next day |

Use `date +%H:%M` (or equivalent) to get the current time if not already known from context.

### 6. Write the file

Write to `standup/individual/[name].md`, replacing any previous content:

```markdown
date: YYYY-MM-DD
name: [Name]

## Today's focus
- [item 1]
- [item 2]

## Notes
- [optional — omit section if nothing to add]

## Blockers
[None | description]
```

Rules:
- Line 1 must be `date: YYYY-MM-DD` — use the date determined in Step 5 above
- Focus items must be action-oriented (verb + outcome)
- `## Blockers` must always be present, even if "None"

### 7. Confirm

> *"Your check-in is saved to `standup/individual/[name].md`. The PM picks it up at 9 AM. You're all set."*

If date was set to tomorrow: *"It's past 9 AM — I've dated this for tomorrow so it's ready for the next 9 AM compile."*

### 8. Offer to commit and push

Run `git status` to see the full picture of modified and untracked files in the working tree.

Present the results clearly, split into two groups:

```
📋 Your standup file:
  standup/individual/[name].md

📂 Other changed files (if any):
  [list every other modified/untracked file — or "None" if clean]
```

Then ask:

> *"Would you like me to commit and push:*
> **(A) Just your standup file** — only `standup/individual/[name].md`*
> **(B) Everything listed above** — all changed files*
> **(C) Skip — I'll handle it myself"*

**If A — standup only:**

```bash
git checkout -b standup/[name]/YYYY-MM-DD
git add standup/individual/[name].md
git commit -m "standup([name]): YYYY-MM-DD"
git push origin standup/[name]/YYYY-MM-DD
gh pr create --title "standup([name]): YYYY-MM-DD" --base main --body "Daily check-in for [Name]"
gh pr merge --merge --auto --delete-branch
git checkout main && git pull origin main
git branch -d standup/[name]/YYYY-MM-DD 2>/dev/null || true
```

**If B — everything:**

Show the exact file list again and ask once more before touching anything:

> *"To confirm — I'll stage and commit these files:*
> *[list every file explicitly, one per line]*
> *Proceed? (yes / no)"*

Only proceed after an explicit "yes". Stage each file by name — **never** use `git add .` or `git add -A`. Then follow the same branch → commit → push → PR → merge flow as option A, with a commit message that summarises all the changes.

**If C — skip:**

> *"No problem. Run `git add standup/individual/[name].md` when you're ready."*

---

## Agent Check-in Flow

### 1. Identify the agent

Determine which agent is checking in (e.g. `web-developer`, `writer`, `product-manager`).

### 2. Gather the update

Ask (or infer from context):

- **Completed:** What did this agent finish or make progress on since the last check-in?
- **Next:** What will this agent work on today?
- **Blockers:** Anything preventing progress?

If the agent is self-reporting, extract completed/next/blockers from what it says.

### 3. Update agents.md

Read `standup/individual/agents.md`. Find the section matching `## [agent-name]`. Replace the **Completed**, **Next**, and **Blockers** content for that agent only.

For the `date:` field at the top: apply the same date rule as humans — before 09:00 use today, 09:00 or later use tomorrow. Only update it if all agents have checked in, or leave it as-is if only one section is being updated mid-day.

The file structure:

```markdown
date: YYYY-MM-DD

---

## [agent-name]

**Completed:**
- [what was done]

**Next:**
- [what to do today]

**Blockers:**
[None | description]

---

## [next-agent]
...
```

Rules:
- Only modify the section for the checking-in agent — do not touch other agents' sections
- Keep bullet points action-oriented
- `**Blockers:**` must always be present

### 4. Confirm

> *"[Agent-name] check-in saved to `standup/individual/agents.md`. The PM will include it in today's compiled stand-up."*

---

## Conversational tone

- Brief and direct — this should take under 2 minutes for humans, under 30 seconds for agents
- If someone says "just write it based on what I told you", do it immediately
- If someone pastes a wall of text, extract the relevant fields yourself, confirm, then write

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Human is not Dave or Yon | Write to `standup/individual/[name].md`; note PM may not recognise it |
| Agent section missing from agents.md | Append a new section at the bottom using the standard format |
| No focus / next items given | Ask once more; if still nothing, write "No update provided" and flag it |
| Check-in already exists for today | Overwrite the relevant section — the new entry is canonical |
| Person wants to update later | Tell them to re-run this skill; it will overwrite |
