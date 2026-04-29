You are setting up the Project Manager agent for this repository from scratch.

Before writing any files, interview the user to gather everything you need. Ask all questions in a single conversational block — do not ask one at a time.

---

## Interview questions

Ask the user:

1. **Team members** — Who is on the team? For each person, collect:
   - Name (used as the check-in filename, e.g. `dave` → `standup/individual/dave.md`)
   - Role: human or AI agent
   - Email address (for Gmail reminders — write "TBC" if unknown)

2. **Agents** — Which AI agents will be active on this project? For each, collect:
   - Agent name (e.g. `web-developer`, `writer`)
   - One-line role description

3. **Schedule** — What times do you want the stand-up cycle to run?
   - Morning reminder time (default: 7:00 AM)
   - Compile / deadline time (default: 9:00 AM)
   - End-of-day reminder time (default: 5:00 PM)
   - Weekly report day and time (default: Friday 4:00 PM)
   - Timezone (e.g. Asia/Saigon, America/New_York)

4. **Communication** — How should the PM notify the team?
   - Is Gmail connected? (yes / no)
   - Is Telegram connected? (yes / no) — if yes, confirm the channel/group name

5. **Repository** — What is the GitHub repo URL for this project?
   (Format: `https://github.com/org/repo`)

---

## After the interview, produce all files in one pass

### Folder structure to create

```
agents/project-manager/
├── context/
│   ├── persona.md
│   ├── daily-standup.md
│   └── schedule-all-tasks.md
├── workflows/
│   └── daily-standup-workflow.md
└── skills/
    └── daily-checkin/
        └── SKILL.md

standup/
└── individual/
    ├── <name>.md          ← one per human team member
    └── agents.md          ← one combined file for all agents

.claude/skills/daily-checkin/
└── SKILL.md
```

### Rules for each file

**`agents/project-manager/context/persona.md`**
- Team table with all members, their check-in file paths, and emails
- Daily workflow section showing the two-phase stand-up cycle with exact local times
- Data locations table (inputs: `standup/individual/*.md`; outputs: `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md`)
- Scheduled tasks table with local times AND correct UTC cron expressions
- Tools & MCPs section reflecting what is and isn't connected

**`agents/project-manager/context/daily-standup.md`**
- Two-phase workflow: Phase 1 = morning reminder, Phase 2 = compile & distribute
- File locations table listing every team member's check-in path
- Step-by-step instructions for each phase
- Check-in file formats for both humans and agents

**`agents/project-manager/workflows/daily-standup-workflow.md`**
- Folder structure diagram
- Phase 1 and Phase 2 steps
- Conflict detection rules
- Compiled output format written to `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md`
- Telegram summary format
- Error handling table

**`agents/project-manager/context/schedule-all-tasks.md`**
- All triggers listed with canonical names, UTC cron expressions, and self-contained prompts
- UTC conversions clearly noted (local time → UTC offset based on user's timezone)
- Trigger names (use exactly): `PM Standup Morning`, `PM Standup Compile`, `PM EOD Reminder`, `PM Weekly RAG Report`

**`standup/individual/<name>.md`** (one per human, e.g. `dave.md`)
```
date: YYYY-MM-DD
name: Dave

## Today's focus
-

## Notes
-

## Blockers
None
```

**`standup/individual/agents.md`**
One section per agent, same structure every day:
```
date: YYYY-MM-DD

---

## <agent-name>

**Completed:**
-

**Next:**
-

**Blockers:**
None

---
```

**Both `daily-checkin` SKILL.md files** (`.claude/skills/` and `agents/project-manager/skills/`)
- Human flow: maps each team member name to their check-in file
- Agent flow: reads `standup/individual/agents.md`, updates only the relevant agent's section

---

## Cron UTC conversion rule

Convert local times to UTC using the user's timezone offset. Always show the conversion explicitly in `schedule-all-tasks.md`.

Example for Asia/Saigon (UTC+7) — subtract 7 hours:
- 7:00 AM → 00:00 UTC → `0 0 * * 1-5`
- 9:00 AM → 02:00 UTC → `0 2 * * 1-5`
- 5:00 PM → 10:00 UTC → `0 10 * * 1-5`
- Friday 4:00 PM → Friday 09:00 UTC → `0 9 * * 5`

---

When all files are written, confirm with a table showing every file created and its purpose.
