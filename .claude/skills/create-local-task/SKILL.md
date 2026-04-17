# Skill: create-local-task

Create a local Claude Code scheduled task by writing a `SKILL.md` file to `~/.claude/scheduled-tasks/<task-name>/`.

## When to use

Trigger this skill when the user says things like:
- "schedule a local task to..."
- "create a local scheduled task for..."
- "add a task to ~/.claude/scheduled-tasks/..."
- "set up a routine that runs every..."

**Do not use the `RemoteTrigger` tool or the `/schedule` skill** — those create cloud-hosted CCR tasks. This skill is for local Desktop tasks only.

---

## How local scheduled tasks work

A scheduled task requires **two steps** — writing the file alone is not enough:

1. **SKILL.md** — defines the prompt the agent runs when triggered
2. **MCP registration** — registers the cron schedule and task ID with Claude Desktop's internal scheduler via `mcp__scheduled-tasks__create_scheduled_task`

Without step 2, the folder exists but the task never fires.

```
~/.claude/scheduled-tasks/
└── <task-name>/
    └── SKILL.md
```

The `create_scheduled_task` MCP tool writes the SKILL.md and registers the schedule in one call. You can also write the file manually first, then register separately — but both must happen.

---

## SKILL.md structure

```markdown
---
name: <task-name>
description: <one sentence — what this task does, when it runs, and what it outputs>
---

<prompt body>
```

### Frontmatter rules
| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Kebab-case, matches the folder name exactly |
| `description` | Yes | One sentence. Include: trigger time, what it does, where output goes, what notifications it sends |

No other frontmatter fields are used. Do not add `schedule`, `cron`, `enabled`, or `working_directory` — these are not read from the file.

---

## Prompt body patterns

Study the four existing tasks for conventions. Key patterns to follow:

### 1. Open with time context
Always state the trigger time and inject date placeholders that Claude will resolve at runtime:
```
It is now 7 AM Asia/Saigon. Today's date is YYYY-MM-DD. Yesterday's date (last working day) is YYYY-MM-DD-PREV.
```
Use `YYYY-MM-DD` as a literal placeholder — the running agent substitutes the real date.

### 2. Step 0 — Load credentials
If the task needs API keys or secrets, always start with a Python env-loading snippet that reads `.env`, `.env.development`, `.env.production`, `.env.local` (in that order, last wins). Fail fast with a clear error if any key is missing:
```python
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
env.update(parse_env(".env.local"))

missing = [k for k in ("KEY1", "KEY2") if not env.get(k)]
if missing:
    raise SystemExit(f"ERROR: missing keys: {missing}")
```
After the Python snippet, immediately export values to the shell — CLI tools don't inherit Python variables.

### 3. Git workflow (if writing files)
Tasks that write files always branch off main:
```bash
git pull origin main
git checkout -b <agent-prefix>/<task-name>/YYYY-MM-DD
# ... do work on branch ...
git add <specific files>
git commit -m "<prefix>(<task-name>): YYYY-MM-DD"
git push origin <branch>
gh pr create --title "..." --base main --body "..."
gh pr merge --merge --auto --delete-branch
git checkout main && git pull origin main
git branch -d <branch> 2>/dev/null || true
```
Tasks that only send notifications (no file writes) skip git entirely.

### 4. Notification pattern
Always send both Lark and Resend — they are not fallbacks for each other, both always fire:
- **Lark**: `lark-cli im +messages-send --as bot --chat-id "$LARK_CHAT_ID" --text $'...'`
  - Fallback chain if it fails: re-auth → verify chat ID → try `--markdown` → HTTP direct
- **Resend**: read HTML template → substitute `{{DATE}}` → write to `/tmp/` → `resend emails send`
  - Fallback chain if it fails: reinstall CLI → cURL API → Python requests
- **If BOTH fail**: append a failure note inline to a relevant existing file. Never create new alert files.

### 5. Numbered steps
Structure the prompt as numbered steps (`## Step 0`, `## Step 1`, etc.). Each step should have a single clear responsibility. Include an explicit `IMPORTANT:` note for any edge case where the agent might stall (e.g., empty results, missing files).

---

## Workflow

1. **Gather requirements from the user:**
   - Task name (suggest a kebab-case name if not given)
   - What it does (the agent's job)
   - When it fires (time + recurrence — for documentation purposes; cron is set in the UI)
   - What credentials it needs
   - Whether it writes files (needs git workflow) or is notifications-only
   - What notifications to send (Lark, email, both, neither)

2. **Draft the SKILL.md prompt body** using the structure above:
   - Open with time/date context
   - Step 0: credential loading (if needed)
   - Numbered steps for the task logic
   - Notification step (if needed)
   - Git commit/PR step (if writing files)

3. **Register the task via MCP** — call `mcp__scheduled-tasks__create_scheduled_task` with:
   - `taskId`: kebab-case name
   - `description`: one-line summary
   - `prompt`: the full prompt body
   - `cronExpression`: standard 5-field cron in **local time** (e.g. `"0 9 * * 1-5"` for weekdays at 9 AM)
   - `notifyOnCompletion`: `true` (default)

   This tool writes the SKILL.md and registers the schedule atomically. Do **not** manually `mkdir` + `Write` the file separately when using this tool — it handles both.

4. **Confirm to the user:**
   - File path created and task registered
   - Next scheduled run time (the MCP tool returns this)
   - Remind them to click **Run now** once in Claude Desktop's Scheduled sidebar to pre-approve tool permissions — prevents future runs from pausing on permission prompts

---

## Example: minimal notification-only task

```markdown
---
name: daily-digest
description: Sends a morning digest of open GitHub PRs and issues to the team via Lark every weekday at 8 AM.
---

It is 8 AM. Today's date is YYYY-MM-DD.

## Step 0 — Load credentials

[credential loading snippet]

## Step 1 — Fetch open PRs and issues

gh pr list --state open --json number,title,author,createdAt --limit 20
gh issue list --state open --json number,title,assignees,createdAt --limit 20

## Step 2 — Send Lark message

[build message from results, send via lark-cli]
```

---

## Example: file-writing task

```markdown
---
name: weekly-summary
description: Every Friday at 4 PM, reads the week's standup briefings and writes a summary to standup/briefings/YYYY-MM/weekly-YYYY-MM-DD.md. Sends via Lark and Resend. Commits on a branch and opens a PR.
---

It is Friday 4 PM. Today's date is YYYY-MM-DD.

## Step 0 — Load credentials
[...]

## Step 1 — Read this week's briefings
[...]

## Step 2 — Write summary file
[...]

## Step 3 — Send notifications
[...]

## Step 4 — Git commit and PR
[...]
```
