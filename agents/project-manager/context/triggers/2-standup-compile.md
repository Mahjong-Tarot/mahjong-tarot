# PM Standup Compile

**Name**: `PM Standup Compile`
**Schedule**: Weekdays at 9:00 AM Asia/Saigon (`0 2 * * 1-5` UTC)

**Description**: At 9 AM, reads all five check-in files and pulls GitHub commits/PRs for each human member since yesterday 7 AM. Pairs reported work against actual git activity, flags mismatches (positive or negative). Compiles the full daily briefing including a Git Activity section. Sends summary via Lark → Resend CLI. Commits on a branch and opens a PR.

---

## Team

| Name  | Email                  | GitHub username | Check-in file                  |
|-------|------------------------|-----------------|--------------------------------|
| Dave  | dave@edge8.ai          | TBC             | standup/individual/dave.md     |
| Yon   | yon@edge8.ai           | TBC             | standup/individual/yon.md      |
| Trac  | trac.nguyen@edge8.ai   | TracNg99        | standup/individual/trac.md     |
| Khang | khang@edge8.ai         | TBC             | standup/individual/khang.md    |

Source of truth: `agents/project-manager/context/persona.md`. Update GitHub usernames there when confirmed.

---

## Prompt

```
Run the daily stand-up Phase 2 workflow.

It is now 9 AM Asia/Saigon — the stand-up compile deadline. Today's date is YYYY-MM-DD. Yesterday (last working day) is YYYY-MM-DD-PREV.

## Step 1 — Git workflow

git pull origin main
git checkout -b pm/standup-compile/YYYY-MM-DD

All writes go on this branch.

## Step 2 — Read check-in files

Read all five files in standup/individual/:
- dave.md, yon.md, trac.md, khang.md (human check-ins)
- agents.md (agent updates — already populated by the 7 AM trigger)

Freshness rule: a human check-in is fresh if its `date:` field matches YYYY-MM-DD-PREV (treat Friday as yesterday on Mondays). Mark stale files as absent — do not discard, note the absence explicitly.

## Step 3 — Pull GitHub activity for each human member

For each human member, fetch their commits and PRs since yesterday 7 AM Asia/Saigon (= YYYY-MM-DD-PREV 00:00 UTC):

```bash
# All commits since yesterday by all authors — filter by known GitHub usernames
git log \
  --since="YYYY-MM-DD-PREV 00:00" \
  --until="YYYY-MM-DD 00:00" \
  --format="%h %ae %an %s" \
  --all

# PRs opened or updated since yesterday
gh pr list \
  --state all \
  --search "updated:>YYYY-MM-DD-PREV" \
  --json number,title,author,state,url,createdAt,mergedAt,additions,deletions \
  --limit 50
```

Map authors to team members using the GitHub username table above. For unknown authors, list them under "Unattributed" and flag for review.

Build a per-person activity summary:
- **Dave**: [list of commits/PRs, or "No git activity detected"]
- **Yon**: ...
- **Trac**: ...
- **Khang**: ...

## Step 4 — Mismatch analysis

For each human member, compare their check-in report against their git activity:

**Positive mismatch** (did more than reported):
→ Git shows commits/PRs not mentioned in check-in. Note: "[Name] merged PR #N ([title]) — not mentioned in check-in."

**Negative mismatch** (reported work but no commits found):
→ Check-in mentions work but no corresponding git activity. Note: "[Name] reported '[focus item]' but no related commits or PRs found."

**Clean** (report matches activity, or absent check-in with no activity):
→ No flag needed.

If GitHub username is TBC for a member, skip mismatch analysis for that person and note: "GitHub username not configured — skipping git verification for [Name]."

## Step 5 — Detect conflicts across check-ins

Scan all focus items across all five files. Flag a conflict when two or more parties are working on the same area (same page, component, file, topic, or Supabase table/function).

## Step 6 — Compile the daily briefing

Write to standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the monthly folder if needed).

Use this structure exactly:

```markdown
# Daily Stand-Up — DAY, MONTH DD YYYY
_Compiled at 09:00 AM Asia/Saigon_

---

## ⚠️ Conflicts & Sync Alerts
<!-- Conflicts across focus items, or "None today." -->

---

## 🔍 Git Activity vs. Reported Work

### Dave
**Reported:** [focus items from check-in, or "No check-in received"]
**Git activity:** [commits/PRs since yesterday 7 AM, or "None detected"]
**Verdict:** ✅ Matches | ⚠️ Positive mismatch — [detail] | 🔴 Negative mismatch — [detail] | ⏭️ GitHub username TBC

### Yon
[same structure]

### Trac
[same structure]

### Khang
[same structure]

---

## 👥 Human Check-Ins

### Dave
**Focus today:**
- [items]

**Blockers:** [blocker or None]

**Notes:** [notes or —]

### Yon / Trac / Khang
[same structure — or "No check-in received (file stale or missing)"]

---

## 🤖 Agent Updates
<!-- Copy standup/individual/agents.md content as-is, or "No agent update received." if missing/stale -->

---

_End of stand-up._
```

## Step 7 — Send notification

Read agents/project-manager/context/pm-notification-guide.md for the full notification pattern.

Build the Lark message substituting actual values:
```
📋 Stand-Up — DAY DD Mon YYYY

⚠️ Conflicts: <count or "None">
🔍 Mismatches: <count or "None">

👥 Team focus:
• Dave: <first 1–2 focus items or "No check-in"> [⚠️ mismatch if applicable]
• Yon: ...
• Trac: ...
• Khang: ...

🤖 Agents: <one-line summary>

📁 Full file: standup/briefings/YYYY-MM/YYYY-MM-DD.md
```

Notification (send both — not fallback):
1. Lark webhook: POST to $LARK_WEBHOOK_URL.
2. Resend CLI (always — install if missing: `npm install -g resend`).
   - Substitute all `{{PLACEHOLDER}}` values in a copy of agents/project-manager/context/template/emails/2-standup-compile.html
   - Write substituted file to /tmp/standup-compile-email.html
   - Run: resend emails send --from "$RESEND_FROM" --to dave@edge8.ai yon@edge8.ai trac.nguyen@edge8.ai khang.h.nguyen@edge8.ai --subject "Stand-Up Summary — YYYY-MM-DD" --html-file /tmp/standup-compile-email.html --quiet
3. If BOTH fail: append failure status inline at the bottom of standup/briefings/YYYY-MM/YYYY-MM-DD.md. No alerts folder.

## Step 8 — Git commit

git add standup/briefings/YYYY-MM/YYYY-MM-DD.md
git commit -m "pm(standup-compile): YYYY-MM-DD"
git push origin pm/standup-compile/YYYY-MM-DD
gh pr create --title "pm(standup-compile): YYYY-MM-DD" --base main --body "Daily stand-up compiled YYYY-MM-DD"
gh pr merge --merge --auto
```
