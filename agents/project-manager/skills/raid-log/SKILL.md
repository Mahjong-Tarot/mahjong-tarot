---
name: raid-log
description: Create, update, and review the RAID log (Risks, Assumptions, Issues, Dependencies) stored in standup/briefings/YYYY-MM/raid.md. Use this skill when someone says "log this risk", "update the RAID log", "add an issue", "track this dependency", or during weekly RAID review. Also use proactively when the daily standup or blocker triage surfaces something that should be formally tracked.
---

# RAID Log Skill

## Purpose

The RAID log is the project's memory for things that could go wrong, things assumed to be true, things that have already gone wrong, and things one part of the project is waiting on from another. Without it, the same risks get rediscovered every week.

## RAID definitions

| Letter | Type | Definition |
|--------|------|------------|
| **R** | Risk | A future uncertainty that *might* cause a problem. Not a problem yet. |
| **A** | Assumption | Something we're treating as true without proof. If it turns out to be wrong, the plan breaks. |
| **I** | Issue | A current problem that is actively affecting the project. |
| **D** | Dependency | Something we're waiting on — from another team member, system, or external party. |

The key distinction: a **Risk** is what might happen. An **Issue** is what is happening.

## File location

All entries live in `standup/briefings/YYYY-MM/raid.md`. Create this file if it doesn't exist.

## Entry format

Each entry follows this structure:

```
[RISK | ASSUMPTION | ISSUE | DEPENDENCY]
Description | Probability: H/M/L | Impact: H/M/L | Owner | Mitigation | Status: Open/Closed | Date: YYYY-MM-DD
```

**Probability and Impact** only apply to Risks. For other types, leave as `—`.

## Operations

### Adding a new entry

When the user describes something to log, classify it (R/A/I/D), ask for any missing fields, then append to `standup/briefings/YYYY-MM/raid.md`:

```markdown
## RAID Log

### [R] Risk: [Short title]
Description: [What might happen and why]
Probability: H / Impact: H
Owner: Dave / Yon / [Agent]
Mitigation: [What we'll do if it happens]
Status: Open
Date: YYYY-MM-DD

---
```

Keep entries short — one risk per block, no essays. The log should be scannable in under 2 minutes.

### Updating an existing entry

Find the entry by title, update the relevant fields (Status, Mitigation, Owner), and add a note with today's date:

```
Update YYYY-MM-DD: [What changed]
```

Never delete old entries — mark them `Status: Closed` instead. Closed entries are valuable project history.

### Weekly RAID review

Triggered every Friday alongside the status report. Steps:

1. Read all open entries in `standup/briefings/YYYY-MM/raid.md`
2. For each open Risk: has probability or impact changed?
3. For each open Issue: is it still active? Has it escalated?
4. For each open Dependency: has it been resolved?
5. For each open Assumption: has it been validated or invalidated?
6. Close entries that are resolved
7. Escalate any Risk that has moved to HIGH probability + HIGH impact (→ becomes an Issue)
8. Report summary: X open risks, X open issues, X closed this week

### Escalation rule

Escalate a Risk to an Issue (change type from R to I) when:
- The uncertain event has actually occurred, OR
- Probability has become HIGH and it's actively threatening a milestone

When escalating, keep the original Risk entry (mark `Status: Escalated → Issue`) and create a new Issue entry.

## Output after any operation

Confirm:
- What was added or updated
- Current count of open items by type (R/A/I/D)
- Any items that need immediate attention (HIGH probability + HIGH impact Risks, or open Issues >48h old)
