# PM Standup Morning

**Name**: `PM Standup Morning`
**Schedule**: Weekdays at 7:00 AM Asia/Saigon (`0 0 * * 1-5` UTC)

**Description**: At 7 AM, checks GitHub for all commits and merged PRs since yesterday 7 AM to build the agent activity picture. Updates `standup/individual/agents.md` with what each agent completed. Then sends a morning check-in reminder to all four human team members. Tries Lark webhook first, then Resend CLI. If both fail, logs inline. Never writes directly to main.

---

## Team email addresses

Always read `agents/project-manager/context/persona.md` for the current team roster. Known addresses at time of writing:

| Name  | Email            | Status    |
|-------|------------------|-----------|
| Dave  | dave@edge8.ai          | confirmed |
| Yon   | yon@edge8.ai           | confirmed |
| Trac  | trac.nguyen@edge8.ai   | confirmed |
| Khang | khang@edge8.ai         | confirmed |

Source of truth: `agents/project-manager/context/persona.md`. Always read that file for the current roster — do not hardcode here.

---

## Prompt

```
Run the daily stand-up Phase 1 workflow from agents/project-manager/context/daily-standup.md.

It is now 7 AM Asia/Saigon. Today's date is YYYY-MM-DD. Yesterday's date (last working day) is YYYY-MM-DD-PREV.

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

Read agents/project-manager/context/pm-notification-guide.md for the full notification pattern.

Send reminder to: Dave (dave@edge8.co) — and any other confirmed addresses from agents/project-manager/context/persona.md.

Lark message (use "Morning reminder" format from pm-notification-guide.md):
```
🌅 Daily Stand-Up Reminder — YYYY-MM-DD

Please submit your check-in to standup/individual/<name>.md before 9:00 AM today.

Files:
• standup/individual/dave.md
• standup/individual/yon.md
• standup/individual/trac.md
• standup/individual/khang.md

The PM agent compiles the stand-up at 9 AM.
```

Notification (send both — not fallback):
1. Lark webhook: POST to $LARK_WEBHOOK_URL.
2. Resend CLI (always — install if missing: `npm install -g resend`).
   - Template: agents/project-manager/context/template/emails/1-standup-morning.html
   - Subject: "Daily Stand-Up Reminder — YYYY-MM-DD"
   - To: dave@edge8.ai yon@edge8.ai trac.nguyen@edge8.ai khang.h.nguyen@edge8.ai
3. If BOTH fail: append failure status inline to standup/briefings/YYYY-MM/YYYY-MM-DD.md. No alerts folder.

## Step 5 — Git commit

git add standup/individual/agents.md standup/briefings/YYYY-MM/YYYY-MM-DD.md
git commit -m "pm(standup-morning): YYYY-MM-DD"
git push origin pm/standup-morning/YYYY-MM-DD
gh pr create --title "pm(standup-morning): YYYY-MM-DD" --base main --body "Agent activity update + morning reminder YYYY-MM-DD"
gh pr merge --merge --auto
```
