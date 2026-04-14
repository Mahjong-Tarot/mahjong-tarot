You are the Project Manager agent for the Mahjong Tarot project. Your task is to register all required scheduled triggers in Claude Code using the `RemoteTrigger` tool.

> **IMPORTANT — run this from the main Claude Code session only.** Do not invoke via `@project-manager` or any subagent. `RemoteTrigger` requires the user's OAuth token which is only available in the main session. Running via a subagent will produce a 401 error.

## Step 0 — Load secrets for trigger creation

**Why this step exists**: RemoteTrigger sessions run in Anthropic's cloud with no access to local files or env vars. The only secure way to pass secrets is to embed them directly in the trigger prompt at creation time — they are stored on Anthropic's servers, never in git. The source files in `agents/project-manager/context/triggers/` use `$LARK_CHAT_ID` etc. as placeholders; this step substitutes the real values before calling `RemoteTrigger {action: "create"}`.

### Load the values

Run this Python script to read secrets from local `.env` files and build the substitution map. Do not proceed if any key is missing.

```bash
python3 - <<'PYEOF'
import os, re, sys

def parse_env_file(path):
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
env.update(parse_env_file(".env"))
env.update(parse_env_file(".env.local"))  # .env.local takes precedence

missing = [k for k in ("LARK_CHAT_ID", "RESEND_API_KEY", "RESEND_FROM") if not env.get(k)]
if missing:
    print(f"ERROR: missing from .env / .env.local: {missing}")
    sys.exit(1)

# Read team emails from persona.md
with open("agents/project-manager/context/persona.md") as f:
    text = f.read()
emails = list(dict.fromkeys(
    e for e in re.findall(r'[\w.+-]+@[\w.-]+\.[a-z]{2,}', text)
    if "example" not in e
))

print("LARK_CHAT_ID=" + env["LARK_CHAT_ID"])
print("RESEND_API_KEY="   + env["RESEND_API_KEY"])
print("RESEND_FROM="      + env["RESEND_FROM"])
print("RESEND_TO="        + ",".join(emails))
PYEOF
```

### Substitution rule (apply to ALL trigger prompts before creating)

Before calling `RemoteTrigger {action: "create"}` for each trigger, take the prompt text from the trigger's source file and replace every occurrence of these placeholders with the real values read above:

| Placeholder | Replace with |
|---|---|
| `$LARK_CHAT_ID` | actual webhook URL |
| `$RESEND_API_KEY` | actual API key |
| `$RESEND_FROM` | value from `.env.local` |
| `$RESEND_TO` | comma-separated team emails |

The substituted prompt goes into `events[0].data.message.content` in the `RemoteTrigger` body. The source files in git keep the `$PLACEHOLDER` syntax unchanged.

Once you have the substitution map, proceed to create the triggers below.

---

## Trigger type rule

**Always use `RemoteTrigger` — never `CronCreate`.**

- `CronCreate` is session-local and does not persist reliably across contexts (VS Code extension limitation).
- `RemoteTrigger` runs on Anthropic's cloud — always-on, no machine dependency, survives restarts.

All times are **Asia/Saigon (UTC+7)**. `RemoteTrigger` cron expressions are in **UTC**.

---

## Output folder rule

All PM-written files go into `standup/briefings/YYYY-MM/`. Create the monthly folder if it does not exist. Never write to `agents/project-manager/output/` or any other location.

```
standup/
└── briefings/
    └── YYYY-MM/
        ├── YYYY-MM-DD.md          ← compiled daily stand-up
        ├── weekly-rag-YYYY-MM-DD.md   ← Friday RAG report
        ├── raid.md                ← RAID log (updated in place)
        └── decisions.md           ← decisions log (appended daily)
```

---

## Git workflow rule (applies to ALL triggers)

Never write directly to main. Never delete or checkout any branch that does not start with `pm/`.

```
1. git pull origin main
2. git checkout -b pm/<task>/YYYY-MM-DD        # agent branch only
3. Make all file writes on this branch
4. git add <changed files explicitly>
5. git commit -m "pm(<task>): YYYY-MM-DD"
6. git push origin pm/<task>/YYYY-MM-DD
7. gh pr create --title "pm(<task>): YYYY-MM-DD" --base main --body "<one-line summary>"
8. gh pr merge --merge --auto --delete-branch  # deletes remote branch on merge
9. git checkout main && git pull origin main
10. git branch -d pm/<task>/YYYY-MM-DD 2>/dev/null || true  # delete local branch
```

Branch cleanup rules:
- `--delete-branch` on `gh pr merge` handles remote deletion automatically after merge
- Local branch deletion uses `-d` (safe delete — fails silently if not fully merged)
- Only ever delete branches matching `pm/*` — never touch user working branches

---

## Communication rule

Send **both** Lark and Resend on every trigger — not as a fallback chain. Only fall back to inline log if both fail.

- **Lark**: `lark-cli im +messages-send --as bot --chat-id $LARK_CHAT_ID` — use `--text` for reminders, `--markdown` for report summaries
- **Resend**: Resend CLI (`resend emails send --html-file`) using `$RESEND_API_KEY`, `$RESEND_FROM`, `$RESEND_TO` — always HTML, never raw markdown
- **Inline log**: append failure status to the relevant daily file in `standup/briefings/YYYY-MM/` only when both Lark and Resend fail

Full patterns and HTML templates: `agents/project-manager/context/pm-notification-guide.md`

> **Testing mode**: `RESEND_FROM` = `mahjong-pm@davehajdu.com`. Emails will only deliver to the Resend account owner's email. Switch to `pm@edge8.ai` once `edge8.ai` is verified as a sending domain in Resend.

Full notification patterns and HTML email templates: `agents/project-manager/context/pm-notification-guide.md`

---

## RemoteTrigger body shape

```json
{
  "name": "TRIGGER_NAME",
  "cron_expression": "CRON_UTC",
  "enabled": true,
  "job_config": {
    "ccr": {
      "environment_id": "env_01Ly7cgFD1z5N2xN9VtNZ42S",
      "session_context": {
        "model": "claude-sonnet-4-6",
        "sources": [
          {"git_repository": {"url": "https://github.com/Mahjong-Tarot/mahjong-tarot"}}
        ],
        "allowed_tools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep"]
      },
      "events": [
        {"data": {
          "uuid": "<fresh lowercase v4 uuid>",
          "session_id": "",
          "type": "user",
          "parent_tool_use_id": null,
          "message": {"role": "user", "content": "PROMPT_FROM_BELOW"}
        }}
      ]
    }
  }
}
```

---

## Triggers to create

### 1. Morning stand-up reminder
- **Name (canonical — use exactly)**: `PM Standup Morning`
- **Tool**: `RemoteTrigger {action: "create"}`
- **Schedule**: `0 0 * * 1-5` (Mon–Fri 7:00 AM Asia/Saigon = 00:00 UTC)
- **Prompt**:

```
Run the daily stand-up Phase 1 workflow from agents/project-manager/context/daily-standup.md.

It is now 7 AM Asia/Saigon. Send a morning check-in reminder to all four team members — Dave, Yon, Trac, and Khang — asking them to submit their check-in files in standup/individual/ before 9 AM:
- standup/individual/dave.md
- standup/individual/yon.md
- standup/individual/trac.md
- standup/individual/khang.md

Notification order: Lark webhook ($LARK_CHAT_ID) → Resend email ($RESEND_API_KEY, Template 1 from agents/project-manager/context/pm-notification-guide.md) → inline log to standup/briefings/YYYY-MM/YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Git workflow: git pull origin main → git checkout -b pm/standup-morning/YYYY-MM-DD → write any file changes on this branch → git add <files> → git commit -m "pm(standup-morning): YYYY-MM-DD" → git push → gh pr create --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

### 2. Stand-up compile and distribute
- **Name (canonical — use exactly)**: `PM Standup Compile`
- **Tool**: `RemoteTrigger {action: "create"}`
- **Schedule**: `0 2 * * 1-5` (Mon–Fri 9:00 AM Asia/Saigon = 02:00 UTC)
- **Prompt**:

```
Run the daily stand-up Phase 2 workflow from agents/project-manager/workflows/daily-standup-workflow.md.

It is now 9 AM Asia/Saigon — the stand-up compile deadline.

Git workflow first: git pull origin main → git checkout -b pm/standup-compile/YYYY-MM-DD. All writes go on this branch.

Read all five files in standup/individual/: dave.md, yon.md, trac.md, khang.md, and agents.md. Check freshness on the four human files (date must match the previous working day — yesterday; treat Friday as yesterday on Mondays).

Detect conflicts across all five check-ins.

Compile the daily stand-up to standup/briefings/YYYY-MM/YYYY-MM-DD.md (create the monthly folder if needed). Include agent updates as-is under an Agent Updates section.

Send the summary: Lark webhook ($LARK_CHAT_ID) → Resend email ($RESEND_API_KEY, Template 2 from agents/project-manager/context/pm-notification-guide.md) → inline log at the bottom of standup/briefings/YYYY-MM/YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/YYYY-MM-DD.md → git commit -m "pm(standup-compile): YYYY-MM-DD" → git push origin pm/standup-compile/YYYY-MM-DD → gh pr create --title "pm(standup-compile): YYYY-MM-DD" --base main → gh pr merge --merge --auto.
```

---

### 3. End-of-day reminder
- **Name (canonical — use exactly)**: `PM EOD Reminder`
- **Tool**: `RemoteTrigger {action: "create"}`
- **Schedule**: `0 10 * * 1-5` (Mon–Fri 5:00 PM Asia/Saigon = 10:00 UTC)
- **Prompt**:

```
It is 5 PM Asia/Saigon end of day.

Git workflow first: git pull origin main → git checkout -b pm/eod/YYYY-MM-DD. All writes go on this branch.

Send a reminder to Dave, Yon, Trac, and Khang to write their check-in to standup/individual/<name>.md tonight, ready for tomorrow's 9 AM stand-up. Notification order: Lark webhook ($LARK_CHAT_ID) → Resend email ($RESEND_API_KEY, Template 3 from agents/project-manager/context/pm-notification-guide.md) → inline log appended to standup/briefings/YYYY-MM/decisions.md. Do not create any alerts folder or alert files.

Append any key decisions made today to standup/briefings/YYYY-MM/decisions.md (create if missing).

Review standup/briefings/YYYY-MM/raid.md and confirm the blocker list is current (create if missing).

Commit: git add standup/briefings/YYYY-MM/decisions.md standup/briefings/YYYY-MM/raid.md → git commit -m "pm(eod): YYYY-MM-DD" → git push origin pm/eod/YYYY-MM-DD → gh pr create --title "pm(eod): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

### 4. Weekly RAG status report
- **Name (canonical — use exactly)**: `PM Weekly RAG Report`
- **Tool**: `RemoteTrigger {action: "create"}`
- **Schedule**: `0 9 * * 5` (Friday 4:00 PM Asia/Saigon = 09:00 UTC)
- **Prompt**:

```
Run the weekly status report workflow from agents/project-manager/context/weekly-status-report.md and the release monitor workflow from agents/project-manager/context/release-monitor.md.

It is Friday 4 PM Asia/Saigon.

Git workflow first: git pull origin main → git checkout -b pm/weekly-rag/YYYY-MM-DD. All writes go on this branch.

Read standup/briefings/YYYY-MM/ for this week's compiled stand-ups and decisions. Check Vercel for deployment status.

Write the weekly RAG report to standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md using this format:
🟢 GREEN — on track
🟡 AMBER — needs attention | owner | resolution date
🔴 RED — needs escalation | impact | immediate action
📋 UPCOMING — key milestones in the next 2 weeks
⚠️ RISKS — top 3 with probability / impact / mitigation
🔔 DECISIONS NEEDED — items requiring decision with deadline

Send the weekly summary: Lark webhook ($LARK_CHAT_ID) → Resend email ($RESEND_API_KEY, Template 4 from agents/project-manager/context/pm-notification-guide.md) → inline log at the bottom of standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md. Do not create any alerts folder or alert files.

Commit: git add standup/briefings/YYYY-MM/weekly-rag-YYYY-MM-DD.md → git commit -m "pm(weekly-rag): YYYY-MM-DD" → git push origin pm/weekly-rag/YYYY-MM-DD → gh pr create --title "pm(weekly-rag): YYYY-MM-DD" --base main → gh pr merge --merge --auto. Never commit to main directly.
```

---

### 5. Sprint retrospective
- **Schedule**: Set manually at each sprint boundary
- **Prompt**:

```
Run the retrospective workflow from agents/project-manager/context/retrospective.md. The sprint has ended.

Git workflow first: git pull origin main → git checkout -b pm/retro/YYYY-MM-DD.

Send Start/Stop/Continue questions to Dave, Yon, Trac, and Khang via Telegram → Lark → fallback file. Give a 48-hour response deadline.

Once all responses are received (or 48h passes), synthesise themes and generate action items. Write the retro report to standup/briefings/YYYY-MM/retro-YYYY-MM-DD.md. Create GitHub issues for each action item.

Commit: git add standup/briefings/YYYY-MM/retro-YYYY-MM-DD.md → git commit -m "pm(retro): YYYY-MM-DD" → git push → gh pr create --base main → gh pr merge --merge --auto.
```

---

## After creating all triggers

List all active triggers and report back:

| Trigger name | Cron (UTC) | Local time (Asia/Saigon) | Status | Next run | Trigger ID |
|---|---|---|---|---|---|
| PM Standup Morning | `0 0 * * 1-5` | Mon–Fri 7:00 AM | | | |
| PM Standup Compile | `0 2 * * 1-5` | Mon–Fri 9:00 AM | | | |
| PM EOD Reminder | `0 10 * * 1-5` | Mon–Fri 5:00 PM | | | |
| PM Weekly RAG Report | `0 9 * * 5` | Friday 4:00 PM | | | |
