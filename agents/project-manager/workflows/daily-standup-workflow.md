# Daily Stand-Up Workflow

**Owner:** Project Manager Agent
**Trigger:** Two-phase daily schedule (Mon–Fri)
- Phase 1: 7:00 AM Asia/Saigon (UTC 00:00) — morning reminder
- Phase 2: 9:00 AM Asia/Saigon (UTC 02:00) — compile and distribute
**Purpose:** Compile individual check-ins, detect conflicts, and distribute the daily stand-up to the team via Telegram.

---

## Folder Structure

```
standup/
└── individual/
    ├── dave.md       # Dave's check-in (written the evening before)
    ├── yon.md        # Yon's check-in (written the evening before)
    ├── agents.md     # Combined agent updates for the day
    └── <YYYY-MM>/
        └── <YYYY-MM-DD>.md   # Compiled stand-up for the day
```

Wait — compiled output goes to:
```
standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md
```

---

## Phase 1 — Morning Reminder (7:00 AM)

Send a reminder to Dave and Yon to submit their check-ins before 9 AM.

- **Primary**: Gmail to dave@edge8.co (and Yon, Trac, Khang emails when confirmed)
- **Fallback**: Write `agents/project-manager/output/alerts/alert-YYYY-MM-DD.md`

---

## Phase 2 — Compile & Distribute (9:00 AM)

### Step 1: Read all check-in files

Read all files in `standup/individual/`:
- `dave.md`
- `yon.md`
- `trac.md`
- `khang.md`
- `agents.md`

**Freshness rule:** A check-in is fresh if its `date:` field matches the **previous working day** (yesterday; treat Friday as yesterday on Mondays). Check-ins are written the evening before.

For each human file, extract:
- **Today's focus** items
- **Blockers**
- **Notes** (if present)

For `agents.md`, include the content as-is under an Agent Updates section — no decomposition or routing needed.

If a file is missing, empty, or stale → mark that member as **absent** in the compiled output. Continue regardless.

---

### Step 2: Detect Conflicts

Scan all focus items across `dave.md`, `yon.md`, and `agents.md`. Flag a conflict when two or more parties are working on the same area (same page, component, file, topic, or Supabase table/function).

**Conflict output format:**

```
⚠️ SYNC NEEDED: [area] — [Person A] and [Person/Agent B] are both touching this today. Coordinate before starting.
```

Place conflict warnings at the top of the compiled file.

---

### Step 3: Compile & Save

Create the monthly folder if it does not exist. Write to `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md`:

```markdown
# Daily Stand-Up — <Day, Month DD YYYY>
_Compiled at 09:00 AM_

---

## ⚠️ Conflicts & Sync Alerts
<!-- Insert conflict warnings here, or write "None today." -->

---

## Human Check-Ins

### Dave
**Focus today:**
- <item>

**Blockers:** <blocker or None>

**Notes:** <notes or —>

### Yon
**Focus today:**
- <item>

**Blockers:** <blocker or None>

**Notes:** <notes or —>

### <Name> — No check-in received

---

## Agent Updates
<!-- Copy each agent's section from standup/individual/agents.md as-is, or write "No agent update received." if missing/stale -->

---

_End of stand-up. Ping the PM agent in Telegram for changes or updates throughout the day._
```

---

### Step 4: Push to Telegram

Send a summary to the team Telegram channel:

```
📋 *Stand-Up — <Day DD Mon YYYY>*

⚠️ *Conflicts:* <count, or "None">
<If conflicts exist, list each one as a bullet>

👥 *Team focus:*
• Dave: <first 1–2 focus items, or "No check-in">
• Yon: <first 1–2 focus items, or "No check-in">

🤖 *Agent updates:* <one-line summary, or "None received">

🔗 Full stand-up saved to standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md

_Ping @PM-agent for any changes or updates today._
```

If Telegram delivery fails → log the error at the bottom of the compiled file. Do not retry.

---

## Check-In File Formats

### Human check-in (`standup/individual/<name>.md`)

```markdown
date: YYYY-MM-DD
name: <Member Name>

## Today's focus
- <task 1>
- <task 2>

## Notes
- <optional context>

## Blockers
- <blocker> or None
```

### Agent check-in (`standup/individual/agents.md`)

One file, one section per agent. Each agent reads its own section to know what to do today.

```markdown
date: YYYY-MM-DD

---

## <agent-name>

**Completed:**
- <what was done>

**Next:**
- <what to do today>

**Blockers:**
None

---

## <agent-name>
...
```

---

## Error Handling

| Situation | Action |
|---|---|
| Any `standup/individual/*.md` date is stale | Mark as absent; continue |
| Monthly folder does not exist | Create it before writing the compiled file |
| Telegram send fails | Log error in compiled file footer; do not retry |
| Both humans absent | Still compile; note absences prominently |
