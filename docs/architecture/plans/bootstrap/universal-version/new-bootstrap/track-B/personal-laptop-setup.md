# Personal Laptop — P1: Machine Setup

> **Who runs this**: Dave (sets up), client watches — client takes over from Step 4 onward
> **Machine**: Client's personal laptop
> **Prerequisite**: P0 complete — tools installed, GitHub authenticated, project cloned locally
> **Output**: Laptop fully configured as a Claude Code machine — matching the Mac Mini's `~/.claude/` setup so agents behave identically on both machines

---

## Overview

P0 got you connected. P1 wires the machine:

- Claude Code permissions so it never interrupts you mid-task to ask for approvals
- Your API keys in a secure local file
- Supabase connected as an MCP tool (Claude can query your database)
- Global engineering rules
- Skills installed so Claude can run check-ins and create tasks

No website scaffold here — the site already exists and is live. This is pure machine configuration.

---

## Step 1 — Install remaining dev tools

```bash
node --version 2>/dev/null || brew install node
jq --version 2>/dev/null || brew install jq
ffmpeg -version 2>/dev/null || brew install ffmpeg
```

---

## Step 2 — Create global Claude Code directories

```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/rules
```

---

## Step 3 — Pre-seed Claude Code permissions

This is a one-time setup so Claude never interrupts you mid-task to ask permission for routine commands.

```bash
python3 - << 'PYEOF'
import json, os

path = os.path.expanduser("~/.claude/settings.local.json")
settings = {}
if os.path.exists(path):
    with open(path) as f:
        try: settings = json.load(f)
        except: settings = {}

perms = settings.setdefault("permissions", {})
allow = perms.setdefault("allow", [])

required = [
    "Bash(*)", "WebFetch", "Skill(*)",
    "mcp__plugin_context-mode_context-mode__ctx_batch_execute",
    "mcp__plugin_context-mode_context-mode__ctx_search",
    "mcp__plugin_context-mode_context-mode__ctx_execute",
    "mcp__plugin_context-mode_context-mode__ctx_fetch_and_index",
    "mcp__plugin_context-mode_context-mode__ctx_execute_file",
    "mcp__supabase__authenticate",
    "mcp__supabase__complete_authentication",
]

allow = [p for p in allow if p != "Bash(*)"]
existing = set(allow)
added = [p for p in required if p not in existing and p != "Bash(*)"]
allow = ["Bash(*)", *allow, *added]
perms["allow"] = allow
perms["defaultMode"] = "acceptEdits"

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(settings, f, indent=2)
print("✅ Permissions set.")
PYEOF
```

`Bash(*)` allows every CLI command without a prompt. `acceptEdits` auto-approves all file writes. Claude will never interrupt mid-task to ask for permission.

---

## Step 4 — Write global CLAUDE.md

```bash
cat > ~/.claude/CLAUDE.md << 'EOF'
# Global Claude Code Rules

## Identity
You are the AI development team for {Business Name}. You have 8 specialist agents available globally on this machine.

## Agents
All 8 agents are installed in `~/.claude/agents/`. Agents are defined in the agents repo at `~/{project-slug}-agents/`.

## Engineering rules
See `~/.claude/rules/global-engineering.md` for all code and git discipline rules.

## Content queue
Add a `brief.md` to any `content/topics/{slug}/` folder to queue a post.
The Writer picks the oldest unwritten topic automatically on schedule.

## Publishing workflow (automated Mon–Wed — runs on Mac Mini)
1. Monday 9am    — Writer writes the post + image prompt
2. Tuesday 9am   — Designer generates the hero image
3. Wednesday 9am — Web Developer builds and stages the page
4. Run: `git push origin main` (owner only)
EOF
```

---

## Step 5 — Write global engineering rules

```bash
cat > ~/.claude/rules/global-engineering.md << 'EOF'
# Global Engineering Rules

## Git
- Run `git status` before any file work.
- Never force-push to any branch.
- Never skip hooks with `--no-verify`.
- Never use `git add .` or `git add -A` — stage files explicitly by name.
- Never create a commit unless explicitly instructed.

## Branch and PR discipline
- Never push directly to `main` or `master`. All changes go through a pull request.
- Confirm the correct base branch before opening a PR.

## Deployment
- Never deploy using `vercel deploy` or `vercel --prod` directly.
- All deployments through `git push` → CI/CD only.

## Secrets
- Never commit `.env` files, API keys, tokens, or passwords.
- Never include secrets in code, comments, or commit messages.

## Approvals
- Social posts → draft for approval first.
- Email campaigns → ALWAYS require human approval before sending.

## Destructive operations
- Always confirm with the user before: `rm -rf`, `git reset --hard`, dropping database tables.
EOF
```

---

## Step 6 — Write .env credentials

```bash
cat > ~/.claude/.env << 'EOF'
SUPABASE_URL={from-credentials-file}
SUPABASE_ANON_KEY={from-credentials-file}
SUPABASE_SERVICE_ROLE_KEY={from-credentials-file}
GEMINI_API_KEY={from-credentials-file}
RESEND_API_KEY={from-credentials-file}
LARK_APP_ID={from-credentials-file}
LARK_APP_SECRET={from-credentials-file}
LARK_WEBHOOK_URL={from-credentials-file}
EOF
```

Replace all `{from-credentials-file}` values from the credentials file transferred in P0.

---

## Step 7 — Configure Supabase MCP

This connects the client's laptop to the same Supabase account set up in Track A.

Say this to Claude Code:

```
Set up the Supabase MCP server on this machine:
1. Fetch the latest Supabase MCP setup documentation so you follow the current install method
2. Add the MCP server to ~/.claude/settings.local.json
3. Start the Supabase authentication flow and give me the browser URL to authorize
4. After I tell you I've completed authorization, finish the auth flow
5. Verify the connection by listing the Supabase projects on this account
```

**The only manual step**: Claude will output a URL — open it in a browser and click **Authorize**. Tell Claude "done" when the page confirms success.

Claude handles everything else: package installation, config file update, auth completion, and connection verification.

---

## Step 8 — Install global skills

### daily-checkin

```bash
mkdir -p ~/.claude/skills/daily-checkin
cat > ~/.claude/skills/daily-checkin/SKILL.md << 'EOF'
---
name: daily-checkin
description: Run morning standup check-in — reads recent git commits, open PRs, and any pending content briefs; outputs a plan for the day.
triggers: ["daily checkin", "morning standup", "what's on today"]
---

## Steps
1. Run `git log --oneline -10` in the project folder
2. Run `gh pr list --state open`
3. Check `content/topics/` for any folders with `brief.md` but no `blog.md`
4. Output: what shipped yesterday, open PRs, content queued today
EOF
```

### create-routines

```bash
mkdir -p ~/.claude/skills/create-routines
cat > ~/.claude/skills/create-routines/SKILL.md << 'EOF'
---
name: create-routines
description: Creates a task file with a clear description, acceptance criteria, and priority.
triggers: ["create task", "new task", "log task", "add a task"]
---

## Steps
1. Ask: task title, description, priority (high/medium/low)
2. Write to `working_files/tasks/{YYYY-MM-DD}-{slug}.md`
3. Format:
   ```
   # {Title}
   Priority: {priority}
   Created: {date}

   ## Description
   {description}

   ## Acceptance criteria
   - [ ] ...
   ```
EOF
```

---

## P1 complete — what you have now

- [ ] node, jq, ffmpeg installed
- [ ] `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/` created
- [ ] `~/.claude/settings.local.json` with full permission bypass + Supabase MCP
- [ ] `~/.claude/CLAUDE.md` written (matches Mac Mini)
- [ ] `~/.claude/rules/global-engineering.md` written
- [ ] `~/.claude/.env` written with all API keys
- [ ] Global skills installed: `daily-checkin`, `create-routines`

**Next**: [P2 — Agent Team](personal-laptop-p2.md)
