---
name: daily-standup
description: Two-phase scheduled workflow. Phase 1 runs at 7 AM Mon–Fri (morning reminder). Phase 2 runs at 9 AM Mon–Fri (compile and distribute). Reads dave.md, yon.md, and agents.md from standup/individual/, detects conflicts, compiles the daily stand-up file, and sends a summary to the team Telegram channel.
trigger: Phase 1 — Daily 7:00 AM Mon–Fri (UTC 00:00). Phase 2 — Daily 9:00 AM Mon–Fri (UTC 02:00).
---

# Daily Stand-up Workflow

## Purpose

Two-phase async stand-up cycle:

- **Phase 1 (7 AM)**: Send morning reminder to Dave and Yon to submit their check-ins before 9 AM.
- **Phase 2 (9 AM)**: Read all three check-in files, detect conflicts, compile the daily stand-up, and push a summary to Telegram.

## File locations

| File | Path | Notes |
|------|------|-------|
| Dave's check-in | `standup/individual/dave.md` | Written the evening before; date must match yesterday |
| Yon's check-in | `standup/individual/yon.md` | Written the evening before; date must match yesterday |
| Trac's check-in | `standup/individual/trac.md` | Written the evening before; date must match yesterday |
| Khang's check-in | `standup/individual/khang.md` | Written the evening before; date must match yesterday |
| Agent updates | `standup/individual/agents.md` | Combined agent daily update; included as-is |
| Daily compiled output | `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md` | Created fresh each day |
| Alert fallback | `agents/project-manager/output/alerts/alert-YYYY-MM-DD.md` | Written when Gmail unavailable |

---

## Phase 1 — Morning Reminder (7:00 AM)

Send a reminder to Dave and Yon:

> *"Good morning! Please submit your check-in to `standup/individual/<name>.md` before 9 AM so it's included in today's stand-up."*

- **Primary channel**: Gmail (dave@edge8.co + Yon, Trac, and Khang's emails when confirmed).
- **Fallback**: Write `agents/project-manager/output/alerts/alert-YYYY-MM-DD.md`.

---

## Phase 2 — Compile & Distribute (9:00 AM)

### Step 1: Read check-in files

Read all files in `standup/individual/`:
- `dave.md`
- `yon.md`
- `trac.md`
- `khang.md`
- `agents.md`

**Freshness rule:** A check-in is fresh if its `date:` field matches the **previous working day** (yesterday; treat Friday as yesterday on Mondays).

For human files, extract focus items, blockers, and notes. For `agents.md`, include the content as-is — no decomposition needed.

If a file is missing or stale, mark it as absent in the compiled output and continue.

### Step 2: Detect conflicts

Scan all focus items across all three files. Flag a conflict when two or more parties are working on the same area (same page, component, file, topic, or Supabase table/function).

### Step 3: Compile the daily file

Create the monthly folder if it doesn't exist. Write the compiled file to `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md`:

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
...

### <Name> — No check-in received

---

## Agent Updates
<!-- Copy each agent's section from standup/individual/agents.md as-is, or write "No agent update received." if missing/stale -->

---

_End of stand-up. Ping the PM agent in Telegram for changes or updates throughout the day._
```

### Step 4: Send Telegram summary

```
📋 *Stand-Up — <Day DD Mon YYYY>*

⚠️ *Conflicts:* <count, or "None">

👥 *Team focus:*
• Dave: <first 1–2 focus items, or "No check-in">
• Yon: <first 1–2 focus items, or "No check-in">

🤖 *Agent updates:* <one-line summary, or "None received">

🔗 Full stand-up saved to standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md

_Ping @PM-agent for any changes or updates today._
```

If Telegram delivery fails, log the error at the bottom of the compiled file. Do not retry.

---

## Check-in file formats

### Human (`standup/individual/<name>.md`)
```
date: YYYY-MM-DD
name: <Name>

## Today's focus
- ...

## Notes
- (optional)

## Blockers
None
```

### Agent (`standup/individual/agents.md`)

One file, one section per agent. Each agent reads its own section to know what to do today.

```
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

## Edge cases

| Situation | Action |
|-----------|--------|
| Check-in date is stale | Mark as absent; continue |
| Monthly folder does not exist | Create it before writing |
| Telegram send fails | Log error in compiled file footer; do not retry |
| Both humans absent | Still compile; note absences prominently |
