---
name: daily-standup
description: Two-phase scheduled workflow. Phase 1 runs at 7 AM Mon–Fri (morning reminder). Phase 2 runs at 9 AM Mon–Fri (compile and distribute). Reads dave.md, yon.md, trac.md, khang.md, and agents.md from standup/individual/, detects conflicts, compiles the daily stand-up file, and sends a summary to the team via Lark and email.
trigger: Phase 1 — Daily 7:00 AM Mon–Fri (UTC 00:00). Phase 2 — Daily 9:00 AM Mon–Fri (UTC 02:00).
---

# Daily Stand-up Workflow

## Purpose

Two-phase async stand-up cycle:

- **Phase 1 (7 AM)**: Send morning reminder to Dave, Yon, Trac, and Khang to submit their check-ins before 9 AM.
- **Phase 2 (9 AM)**: Read all five check-in files, detect conflicts, compile the daily stand-up, and push a summary to the team.

## File locations

| File | Path | Notes |
|------|------|-------|
| Dave's check-in | `standup/individual/dave.md` | Written the evening before; date must match yesterday |
| Yon's check-in | `standup/individual/yon.md` | Written the evening before; date must match yesterday |
| Trac's check-in | `standup/individual/trac.md` | Written the evening before; date must match yesterday |
| Khang's check-in | `standup/individual/khang.md` | Written the evening before; date must match yesterday |
| Agent updates | `standup/individual/agents.md` | Combined agent daily update; included as-is |
| Daily compiled output | `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md` | Created fresh each day |
| Notification failure log | Inline at bottom of daily briefing file | Written only when both Lark and Resend fail |

---

## Phase 1 — Morning Reminder (7:00 AM)

Send a reminder to Dave, Yon, Trac, and Khang:

> *"Good morning! Please submit your check-in to `standup/individual/<name>.md` before 9 AM so it's included in today's stand-up."*

Notification (send both — not fallback):
- **Lark CLI**: `lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'...'` — "Morning reminder" message from `pm-notification-guide.md`
- **Resend email**: HTML template 1 from `agents/project-manager/context/template/emails/1-standup-morning.html` — always send via `--html-file`, never raw markdown
- **Inline log**: Append failure status to `standup/briefings/YYYY-MM/YYYY-MM-DD.md` only if **both** Lark and Resend fail

---

## Phase 2 — Compile & Distribute (9:00 AM)

### Step 1: Read check-in files

Read all five files in `standup/individual/`:
- `dave.md`, `yon.md`, `trac.md`, `khang.md`
- `agents.md`

**Freshness rule:** A check-in is fresh if its `date:` field matches the **previous working day** (yesterday; treat Friday as yesterday on Mondays).

For human files, extract focus items, blockers, and notes. For `agents.md`, include the content as-is — no decomposition needed.

If a file is missing or stale, mark it as absent in the compiled output and continue.

### Step 2: Detect conflicts

Scan all focus items across all five files. Flag a conflict when two or more parties are working on the same area (same page, component, file, topic, or Supabase table/function).

### Step 3: Compile the daily file

Create the monthly folder if it doesn't exist. Write the compiled file to `standup/briefings/<YYYY-MM>/<YYYY-MM-DD>.md`:

```markdown
# Daily Stand-Up — <Day, Month DD YYYY>
_Compiled at 09:00 AM Asia/Saigon_

---

## ⚠️ Conflicts & Sync Alerts
<!-- Insert conflict warnings here, or write "None today." -->

---

## 🔍 Git Activity vs. Reported Work

### Dave
**Reported:** [focus items or "No check-in received"]
**Git activity:** [commits/PRs since yesterday 7 AM, or "None detected"]
**Verdict:** ✅ Matches | ⚠️ Positive mismatch — [detail] | 🔴 Negative mismatch — [detail] | ⏭️ GitHub username TBC

### Yon / Trac / Khang
[same structure]

---

## 👥 Human Check-Ins

### Dave
**Focus today:**
- <item>

**Blockers:** <blocker or None>

**Notes:** <notes or —>

### Yon / Trac / Khang
[same structure — or "No check-in received (file stale or missing)"]

---

## 🤖 Agent Updates
<!-- Copy standup/individual/agents.md content as-is, or "No agent update received." if missing/stale -->

---

_End of stand-up._
```

### Step 4: Send notification

Notification (send both — not fallback):

1. **Lark CLI** — send structured priority summary (see trigger 2 prompt for message format):
   ```bash
   lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --markdown $'<BUILT_SUMMARY>'
   ```

2. **Resend email** — send full compiled briefing as HTML:
   - Substitute `{{PLACEHOLDER}}` values in `agents/project-manager/context/template/emails/2-standup-compile.html`
   - Inject full briefing content into `{{STANDUP_CONTENT}}`
   - Write to `/tmp/standup-compile-email.html`
   - Send with `RESEND_API_KEY=... resend emails send --from "..." --to "..." --subject "..." --html-file /tmp/standup-compile-email.html --quiet`

3. **Inline log** — append failure status to bottom of `standup/briefings/YYYY-MM/YYYY-MM-DD.md` only if **both** Lark and Resend fail. No alerts folder or alert files.

Full notification patterns and HTML templates: `agents/project-manager/context/pm-notification-guide.md`

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
| Lark send fails | Continue to Resend; log failure inline if Resend also fails |
| Resend send fails | Continue; log failure inline if Lark also failed |
| Both notification channels fail | Append inline log to briefing file; no alerts folder |
| Both humans absent | Still compile; note absences prominently |
