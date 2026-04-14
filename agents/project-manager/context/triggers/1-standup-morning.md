# PM Standup Morning

**Name**: `PM Standup Morning`
**Schedule**: Weekdays at 7:00 AM Asia/Saigon (`0 0 * * 1-5` UTC)

**Description**: At 7 AM, checks GitHub for all commits and merged PRs since yesterday 7 AM to build the agent activity picture. Updates `standup/individual/agents.md` with what each agent completed. Then sends a morning check-in reminder to all four human team members via Lark CLI and Resend (both always). If both fail, logs inline. Never writes directly to main.

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

For each agent, extract:
- **Completed**: what PRs/commits were merged/pushed
- **Next**: infer from open PRs or branch names if available (run `gh pr list --state open --json title,author,headRefName`)
- **Blockers**: flag any open PR that has been open >24h with no activity, or any failed CI check

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

## Step 4 — Send morning reminder to human team members

Read agents/project-manager/context/pm-notification-guide.md for the Lark message text and HTML email template (Template 1 — Morning Reminder).

Notification (send both — not fallback):
1. Lark CLI (always — bot identity, "Labs" group chat):
   lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" \
     --text $'🌅 Daily Stand-Up Reminder — YYYY-MM-DD\n\nPlease submit your check-in to standup/individual/<name>.md before 9:00 AM today.\n\nFiles:\n• standup/individual/dave.md\n• standup/individual/yon.md\n• standup/individual/trac.md\n\nThe PM agent compiles the stand-up at 9 AM.'
   LARK_EXIT=$?
2. Resend CLI (always — install if missing: `npm install -g resend`). Substitute `{{DATE}}` in a copy of `agents/project-manager/context/template/emails/1-standup-morning.html`, write to `/tmp/standup-morning-email.html`, then send:
   RESEND_API_KEY=$RESEND_API_KEY resend emails send \
     --from "$RESEND_FROM" \
     --to "$RESEND_TO" \
     --subject "Daily Stand-Up Reminder — YYYY-MM-DD" \
     --html-file /tmp/standup-morning-email.html \
     --quiet
   Full pattern in pm-notification-guide.md.
3. If BOTH fail: append failure status inline to standup/briefings/YYYY-MM/YYYY-MM-DD.md. No alerts folder.

## Step 5 — Git commit and branch cleanup

AGENT_BRANCH="pm/standup-morning/YYYY-MM-DD"

git add standup/individual/agents.md standup/briefings/YYYY-MM/YYYY-MM-DD.md
git commit -m "pm(standup-morning): YYYY-MM-DD"
git push origin "$AGENT_BRANCH"
gh pr create --title "pm(standup-morning): YYYY-MM-DD" --base main --body "Agent activity update + morning reminder YYYY-MM-DD"
gh pr merge --merge --auto --delete-branch

# Clean up local agent branch — only if it matches pm/* (never touch user branches)
git checkout main
git pull origin main
git branch -d "$AGENT_BRANCH" 2>/dev/null || true
```
