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


Source of truth: `agents/project-manager/context/persona.md`. Update GitHub usernames there when confirmed.

---

## Prompt

```
Run the daily stand-up Phase 2 workflow.

It is now 9 AM Asia/Saigon — the stand-up compile deadline. Today's date is YYYY-MM-DD. Yesterday (last working day) is YYYY-MM-DD-PREV.

## Step 0 — Load credentials and team roster

Run this Python snippet to load secrets and team emails before doing anything else. Stop and report if any key is missing.

```python
import os, re

def parse_env(path):
    vals = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                vals[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return vals

env = {}
env.update(parse_env(".env"))
env.update(parse_env(".env.local"))  # .env.local takes precedence

missing = [k for k in ("LARK_CHAT_ID", "RESEND_API_KEY", "RESEND_FROM") if not env.get(k)]
if missing:
    raise SystemExit(f"ERROR: missing from .env / .env.local: {missing}")

with open("agents/project-manager/context/persona.md") as f:
    text = f.read()
emails = list(dict.fromkeys(
    e for e in re.findall(r'[\w.+-]+@[\w.-]+\.[a-z]{2,}', text)
    if "example" not in e
))

LARK_CHAT_ID   = env["LARK_CHAT_ID"]
RESEND_API_KEY = env["RESEND_API_KEY"]
RESEND_FROM    = env["RESEND_FROM"]
RESEND_TO      = ",".join(emails)
```

Use these four values throughout the rest of this prompt wherever $LARK_CHAT_ID, $RESEND_API_KEY, $RESEND_FROM, or $RESEND_TO appear.

## Step 1 — Git workflow

git pull origin main
git checkout -b pm/standup-compile/YYYY-MM-DD

All writes go on this branch.

## Step 2 — Read check-in files

Read all five files in standup/individual/:
- dave.md, yon.md, trac.md (human check-ins)
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

---

## 👥 Human Check-Ins

### Dave
**Focus today:**
- [items]

**Blockers:** [blocker or None]

**Notes:** [notes or —]

### Yon / Trac
[same structure — or "No check-in received (file stale or missing)"]

---

## 🤖 Agent Updates
<!-- Copy standup/individual/agents.md content as-is, or "No agent update received." if missing/stale -->

---

_End of stand-up._
```

## Step 7 — Send summary to Lark, full report via Resend

Notification (send both — not fallback):

### 1. Lark CLI — structured priority summary

Build the message from the compiled briefing using the structure below — omit any section with no content. Then send with:

```bash
lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --markdown $'<BUILT_SUMMARY>'
LARK_EXIT=$?
```

Message structure:

```
📋 Stand-Up — DAY DD Mon YYYY

⚠️ ALERTS
• [Each conflict or sync clash — one line each, e.g. "Dave + Yon both touching auth middleware"]
• [Each mismatch flag — include PR # if relevant, e.g. "Trac: PR #42 merged — not in check-in"]
(Omit section if none)

🔴 HIGH PRIORITY
• [Any task or blocker flagged as urgent, overdue, or escalation-worthy — one line each with owner]
(Omit section if none)

👥 HUMAN STATUS
• Dave: [first focus item] [🔴/⚠️ if mismatch] — PR #N if relevant
• Yon: ...
• Trac: ...

🤖 AGENT TODO
• project-manager: [next action]
• writer: [next action]
• web-developer: [next action]
• image-designer: [next action]
(Include only agents with active work; skip if "No activity")

📁 Full report: standup/briefings/YYYY-MM/YYYY-MM-DD.md
```

Rules:
- Every PR reference must include the PR number (e.g. PR #42) and a 3–5 word title
- High priority = any task with a deadline today or tomorrow, any blocker >24h unresolved, or any negative mismatch
- Keep each line under 80 characters
- Do not include notes or raw check-in text — distil to one actionable phrase per item

### 2. Resend CLI — full report

Send the complete compiled briefing content:
- Read standup/briefings/YYYY-MM/YYYY-MM-DD.md in full
- Substitute all `{{PLACEHOLDER}}` values in a copy of `agents/project-manager/context/template/emails/2-standup-compile.html`, injecting the full content into `{{STANDUP_CONTENT}}`
- Write to /tmp/standup-compile-email.html, then run:
   RESEND_API_KEY=$RESEND_API_KEY resend emails send \
     --from "$RESEND_FROM" \
     --to "$RESEND_TO" \
     --subject "Daily Stand-Up — YYYY-MM-DD" \
     --html-file /tmp/standup-compile-email.html \
     --quiet

### 3. If BOTH fail

Append failure status inline at the bottom of standup/briefings/YYYY-MM/YYYY-MM-DD.md. No alerts folder.

## Step 8 — Git commit and branch cleanup

AGENT_BRANCH="pm/standup-compile/YYYY-MM-DD"

git add standup/briefings/YYYY-MM/YYYY-MM-DD.md
git commit -m "pm(standup-compile): YYYY-MM-DD"
git push origin "$AGENT_BRANCH"
gh pr create --title "pm(standup-compile): YYYY-MM-DD" --base main --body "Daily stand-up compiled YYYY-MM-DD"
gh pr merge --merge --auto --delete-branch

# Clean up local agent branch — only if it matches pm/* (never touch user branches)
git checkout main
git pull origin main
git branch -d "$AGENT_BRANCH" 2>/dev/null || true
```
