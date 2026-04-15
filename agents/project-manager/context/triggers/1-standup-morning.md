# PM Standup Morning

**Name**: `PM Standup Morning`
**Schedule**: Weekdays at 7:00 AM Asia/Saigon (`0 0 * * 1-5` UTC)

**Description**: At 7 AM, checks GitHub for all commits and merged PRs since yesterday 7 AM to build the agent activity picture. Updates `standup/individual/agents.md` with what each agent completed. Checks the freshness of each human check-in file and includes ✅/🔴 status per person in the Lark message. Sends a morning reminder to Dave, Yon, and Trac via Lark CLI and Resend (both always). If both fail, logs inline. Never writes directly to main.

---

## Team email addresses

Always read `agents/project-manager/context/persona.md` for the current team roster. Known addresses at time of writing:

| Name  | Email            | Status    |
|-------|------------------|-----------|
| Dave  | dave@edge8.ai          | confirmed |
| Yon   | yon@edge8.ai           | confirmed |
| Trac  | trac.nguyen@edge8.ai   | confirmed |

Source of truth: `agents/project-manager/context/persona.md`. Always read that file for the current roster — do not hardcode here.

---

## Prompt

```
Run the daily stand-up Phase 1 workflow from agents/project-manager/context/daily-standup.md.

It is now 7 AM Asia/Saigon. Today's date is YYYY-MM-DD. Yesterday's date (last working day) is YYYY-MM-DD-PREV.

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
env.update(parse_env(".env.development"))
env.update(parse_env(".env.production"))
env.update(parse_env(".env.local"))  # .env.local takes highest precedence

missing = [k for k in ("LARK_CHAT_ID", "RESEND_API_KEY", "RESEND_FROM") if not env.get(k)]
if missing:
    raise SystemExit(f"ERROR: missing from env files (.env / .env.development / .env.production / .env.local): {missing}")

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
git checkout -b pm/standup-morning/YYYY-MM-DD

All writes go on this branch.

## Step 2 — Check GitHub for agent activity since yesterday 7 AM

Run the following to gather agent-attributed work. "Agent work" means commits or PRs whose author is a bot/automation account or whose commit message matches conventional agent prefixes (pm/, writer:, web-developer:, build-page:, generate-image:, product-manager:, etc.).

```bash
# Merged PRs since yesterday 7 AM
gh pr list \
  --state merged \
  --search "merged:>YYYY-MM-DD-PREVT00:00:00" \
  --json number,title,author,mergedAt,body \
  --limit 50

# Commits since yesterday 7 AM UTC (adjust for Asia/Saigon offset -7h)
git log \
  --since="YYYY-MM-DD-PREV 00:00" \
  --until="YYYY-MM-DD 00:00" \
  --format="%h %ae %s" \
  --all
```

From the results, group by agent type:
- `pm(...)` → Project Manager agent
- `writer:` / `write-post:` → Writer agent
- `web-developer:` / `build-page:` → Web Developer agent
- `generate-image:` / `image-designer:` → Image Designer agent
- `product-manager:` → Product Manager agent
- Any other bot/automation commit not by a known human → list under "Other agents"

IMPORTANT: If both commands return no results (empty arrays or no output), there was no agent activity overnight. In that case, write "No activity" for all agent sections and proceed immediately to Step 3. Do NOT stop, ask for clarification, or retry.

For each agent where activity was found, extract:
- **Completed**: what PRs/commits were merged/pushed (use exact PR numbers and titles from the output)
- **Next**: run `gh pr list --state open --json title,author,headRefName` and list open PRs by that agent; if none found, write "No open work detected"
- **Blockers**: list any open PR that has been open >24h with no new commits or review activity; or any CI check marked as failed. If none, write "None"

## Step 3 — Update standup/individual/agents.md

Read the current `standup/individual/agents.md`. For each agent section found in Step 2, replace the **Completed**, **Next**, and **Blockers** content. Update the `date:` field at the top to YYYY-MM-DD. Keep the file structure intact — do not remove sections for agents that had no activity (write "No activity" instead).

If an agent type from Step 2 has no section in agents.md yet, append a new section at the bottom.

Format per section:
```
## [agent-name]

**Completed:**
- [PR #N: title — merged at HH:MM] or [commit abc1234: message]

**Next:**
- [inferred from open PRs/branches, or "No open work detected"]

**Blockers:**
[None | description]
```

## Step 4 — Check check-in file freshness

For each person, do the following exactly:

1. Try to read the file. If the file does not exist → mark as 🔴 Stale.
2. If the file exists, read line 1. It must be in the format `date: YYYY-MM-DD`.
3. Compare the date on line 1 to the value of YYYY-MM-DD-PREV provided at the top of this prompt.
   - If the dates match exactly → ✅ Fresh
   - If the dates do not match → 🔴 Stale

Do NOT infer or guess. Compare the literal date strings only.

Files to check:
- Dave → standup/individual/dave.md
- Yon  → standup/individual/yon.md
- Trac → standup/individual/trac.md

Build a status line for each person to use in Step 5:
- Fresh → name only: `✅ Dave`
- Stale → name + file path: `🔴 Yon — standup/individual/yon.md`

## Step 5 — Send morning reminder to human team members

Use the notification pattern from agents/project-manager/context/pm-notification-guide.md. Always use the HTML email template at `agents/project-manager/context/template/emails/1-standup-morning.html` — do not create or modify templates.

Notification (send both — not fallback):
1. Lark CLI (always — bot identity, "Labs" group chat). Use the status lines built in Step 4 to construct the message. Replace each placeholder with the exact status string — do not leave placeholders in the sent message.
   # --as bot uses tenant_access_token — no OAuth or user login required
   lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
     --text $'🌅 Daily Stand-Up Reminder — YYYY-MM-DD\n\nCheck-in status (please update yours before 9:00 AM):\n• [STATUS_DAVE]\n• [STATUS_YON]\n• [STATUS_TRAC]\n\nThe PM agent compiles at 9 AM.'
   LARK_EXIT=$?

   Example of a correctly built message (do not copy literally — use real status from Step 4):
   --text $'🌅 Daily Stand-Up Reminder — 2026-04-15\n\nCheck-in status (please update yours before 9:00 AM):\n• ✅ Dave\n• 🔴 Yon — standup/individual/yon.md\n• ✅ Trac\n\nThe PM agent compiles at 9 AM.'
2. Resend CLI (always — install if missing: `npm install -g resend`). Substitute `{{DATE}}` in a copy of `agents/project-manager/context/template/emails/1-standup-morning.html`, write to `/tmp/standup-morning-email.html`, then send:
   RESEND_API_KEY=$RESEND_API_KEY resend emails send \
     --from "$RESEND_FROM" \
     --to "$RESEND_TO" \
     --subject "Daily Stand-Up Reminder — YYYY-MM-DD" \
     --html-file /tmp/standup-morning-email.html \
     --quiet
   Full pattern in pm-notification-guide.md.
3. If BOTH fail: append failure status inline to standup/briefings/YYYY-MM/YYYY-MM-DD.md. No alerts folder.

## Step 6 — Git commit and branch cleanup

AGENT_BRANCH="pm/standup-morning/YYYY-MM-DD"

git add standup/individual/agents.md
# Only add the briefing file if it was created (failure log written to it):
git add standup/briefings/YYYY-MM/YYYY-MM-DD.md 2>/dev/null || true
git commit -m "pm(standup-morning): YYYY-MM-DD"
git push origin "$AGENT_BRANCH"
gh pr create --title "pm(standup-morning): YYYY-MM-DD" --base main --body "Agent activity update + morning reminder YYYY-MM-DD"
gh pr merge --merge --auto --delete-branch

# Clean up local agent branch — only if it matches pm/* (never touch user branches)
git checkout main
git pull origin main
git branch -d "$AGENT_BRANCH" 2>/dev/null || true
```
