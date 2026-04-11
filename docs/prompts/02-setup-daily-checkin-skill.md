Update the daily check-in skill so it reflects the current team and file structure.

Read the following files before writing anything:
- `agents/project-manager/context/persona.md` — for the current team roster and check-in file paths
- `standup/individual/agents.md` — for the current agent list and section structure

---

## What to produce

Write identical content to both locations:
1. `.claude/skills/daily-checkin/SKILL.md`
2. `agents/project-manager/skills/daily-checkin/SKILL.md`

---

## Required structure

### Frontmatter
```yaml
---
name: daily-checkin
description: Help a human team member or agent write their daily check-in. Use when someone says "help me write my check-in", "I need to do my standup", "update my standup", or "fill in my check-in".
---
```

### Step 1 — Identify the caller
Determine if it is a human or an agent. If unclear, ask.

### Human check-in flow
1. Confirm which team member (list every human by name from persona.md — e.g. "Are you Dave, Yon, Trac, or Khang?")
2. Map name → `standup/individual/<name>.md`
3. Ask: today's focus, notes (optional), blockers
4. Write the file with this format:
   ```
   date: YYYY-MM-DD
   name: Dave

   ## Today's focus
   - ...

   ## Notes
   - (omit section if nothing)

   ## Blockers
   None
   ```
5. Confirm: "Saved to `standup/individual/dave.md`. PM picks it up at 9 AM."
   If past 9 AM: "Stand-up already ran — this will be in tomorrow's report."

### Agent check-in flow
1. Identify which agent is checking in
2. Gather: Completed, Next, Blockers
3. Read `standup/individual/agents.md`
4. Find `## <agent-name>` section and update only that section
5. Do not touch any other agent's section
6. Format:
   ```
   ## <agent-name>

   **Completed:**
   - ...

   **Next:**
   - ...

   **Blockers:**
   None
   ```
7. Confirm: "<agent-name> check-in saved to `standup/individual/agents.md`."

### Edge cases table
| Situation | Action |
|---|---|
| Human not in known list | Write to `standup/individual/<name>.md`; note PM may not recognise it |
| Agent section missing from agents.md | Append a new section at the bottom |
| No items given | Ask once more; write "No update provided" if still nothing |
| Check-in already exists | Overwrite — the new entry is canonical |

### Tone
- Under 2 minutes for humans, under 30 seconds for agents
- If "just write it" — do it immediately, no more questions

---

After writing both files, confirm the paths and note any team members or agents that were added or changed from the previous version.
