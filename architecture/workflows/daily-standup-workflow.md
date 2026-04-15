# Daily Stand-Up Compiler — Workflow Specification

**Trigger:** 9:00 AM daily (scheduled task)
**Owner:** Project Manager agent

---

## Overview

This workflow collects individual check-ins from humans and agents, cross-references them for conflicts and ad-hoc requests, merges everything into a single dated stand-up file, and pushes a summary to the team Telegram channel.

---

## Phase 1 — Gather

**Source:** `standup/individual/` folder — one file per team member, named `<member-name>.md` (e.g. `dave.md`, `yon.md`).

**Check-in file format (expected structure):**

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

**Gather rules:**
- Read every `.md` file in `standup/individual/` at run time.
- Check the `date:` field in each file. If a file's date is not today's date, treat the member as **absent** — include a note in the compiled output that no check-in was received.
- Do not error out on a missing or stale file — log the absence and continue.

---

## Phase 2 — Analyze & Cross-Reference

### 2a — Parse human check-ins

From each current check-in, extract:

1. **Working-on list** — everything under `## Today's focus`
2. **Agent requests** — any mention of `@<agent-name>` in any section, treated as a directed task for that agent today (e.g. `@data-agent pull Q1 numbers`, `@writer-agent draft intro for fire-horse post`)

### 2b — Pull agent standing tasks

**Source:** `standup/individual/agents.md` — a single config file that lists each agent and its recurring daily responsibilities.

**Expected `agents.md` format:**

```markdown
## <agent-name>

**Role:** <one-line description>

**Daily standing tasks:**
- <task 1>
- <task 2>
```

For each agent listed in `agents.md`, carry its standing tasks forward into today's compiled output regardless of whether any human has mentioned that agent.

### 2c — Merge ad-hoc requests into agent task lists

If a human check-in contains an `@<agent-name>` request, append it to that agent's task list for today under a `**Requested today:**` sub-section. If the agent named in the request does not exist in `agents.md`, flag it as an unresolved mention in the compiled output.

---

## Phase 3 — Conflict Detection

Before compiling, scan all "today's focus" items across every human check-in and every agent task list (standing + requested). Flag a conflict when **two or more people or agents are working on the same area**.

**Conflict matching heuristics:**
- Same page, component, or file mentioned (e.g. `blog/index.jsx`, `fire-horse post`, `generate-image skill`)
- Same explicit topic slug or feature area
- Same Supabase table or edge function

**Conflict output format — insert inline in the compiled file:**

```
⚠️ SYNC NEEDED: [area] — [Person A] and [Agent B] are both touching this today. Coordinate before starting.
```

Place conflict warnings at the top of the compiled file, before individual sections, so they're impossible to miss.

---

## Phase 4 — Compile & Save

### Output file location

```
standup/
└── <YYYY-MM>/
    └── <YYYY-MM-DD>.md
```

Example: `standup/2026-04/2026-04-11.md`

Create the monthly folder if it does not exist.

### Compiled file structure

```markdown
# Daily Stand-Up — <Day, Month DD YYYY>
_Compiled at 09:00 AM_

---

## ⚠️ Conflicts & Sync Alerts
<!-- Insert conflict warnings here, or write "None today." -->

---

## Human Check-Ins

### <Member Name>
**Focus today:**
- <item>

**Blockers:** <blocker or None>

**Notes:** <notes or —>

<!-- Repeat for each member. If absent, write: -->
### <Member Name> — No check-in received

---

## Agent Tasks

### <agent-name>
**Standing tasks:**
- <task>

**Requested today:**
- <@mention source> — <task> _(requested by <Name>)_

<!-- Repeat for each agent -->

---

_End of stand-up. Ping the PM agent in Telegram for changes or updates throughout the day._
```

---

## Phase 5 — Distribute via Telegram

After saving the compiled file, send a summary message to the team Telegram channel.

**Telegram message format:**

```
📋 *Stand-Up — <Day DD Mon YYYY>*

⚠️ *Conflicts:* <count, or "None">
<If conflicts exist, list each one as a bullet>

👥 *Team focus:*
• <Name>: <first 1–2 focus items>
• <Name>: <first 1–2 focus items>

🤖 *Agents on deck:*
• <agent-name>: <standing tasks count> standing + <N> new requests

🔗 Full stand-up saved to standup/<YYYY-MM>/<YYYY-MM-DD>.md

_Ping @PM-agent for any changes or updates today._
```

**Delivery notes:**
- Use the Telegram MCP tool already connected in Claude Code.
- Send to the configured team group/channel.
- If Telegram delivery fails, log the error at the bottom of the compiled stand-up file and do not retry automatically — surface it at the next run.

---

## Error Handling

| Situation | Action |
|---|---|
| `standup/individual/<name>.md` date is stale | Mark member as absent; continue |
| `standup/individual/agents.md` missing | Skip agent section; insert warning in compiled file |
| `@<agent>` mention references unknown agent | Flag as unresolved in compiled output |
| Monthly folder does not exist | Create it before writing the compiled file |
| Telegram send fails | Log error in compiled file footer; do not retry |
| Two members absent | Still compile; note absences prominently |

---

## File & Folder Reference

| Path | Purpose |
|---|---|
| `standup/individual/<name>.md` | Each team member's daily check-in |
| `standup/individual/agents.md` | Agent roster and standing daily tasks |
| `standup/briefings/` | Monthly briefing archives (separate workflow) |
| `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md` | Compiled daily stand-up output |

