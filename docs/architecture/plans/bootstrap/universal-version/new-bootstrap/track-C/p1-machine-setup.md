# Track C — P1: Machine Setup

> **Who runs this**: You, on your own laptop
> **Prerequisite**: P0 complete — Next.js project on GitHub
> **End state**: Claude Code fully configured, Supabase connected, website live on Vercel

---

## Overview

P0 gave you a repo. P1 wires it into the full system:

- Claude Code permissions so it never asks you to approve routine actions
- Your API keys written to a secure local file
- Supabase connected as an MCP tool (Claude can query your database)
- Skills installed so Claude can run check-ins and create tasks
- Your site deployed live on Vercel

---

## Step 1 — Install remaining tools

```bash
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || true
brew install jq ffmpeg
npm install -g vercel
```

Verify:
```bash
jq --version && ffmpeg -version && vercel --version
```

---

## Step 2 — Install Claude Code

If you haven't already:

```bash
npm install -g @anthropic-ai/claude-code
```

Verify:
```bash
claude --version
```

Log in (uses your Claude Pro subscription — no separate API key needed):

```bash
claude
```

On first launch, Claude Code will walk you through authentication. Complete it, then close it with `/exit` — we'll come back to it in Step 8.

---

## Step 3 — Create global Claude Code directories

```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/rules
```

---

## Step 4 — Pre-seed Claude Code permissions

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

## Deployment
- Never deploy using `vercel deploy` or `vercel --prod` directly.
- All deployments through `git push` → CI/CD only.

## Secrets
- Never commit `.env` files, API keys, tokens, or passwords.
- Never include secrets in code, comments, or commit messages.

## Approvals
- Social posts → draft for approval first.
- Email campaigns → ALWAYS require human approval before sending.
EOF
```

---

## Step 6 — Set up Supabase (skip if not ready)

If you don't have a Supabase account yet, skip this step and come back to it. Everything else will still work.

Say this to Claude Code:

```
Set up Supabase for this project from scratch:
1. Fetch the latest Supabase MCP setup documentation so you follow the current install method
2. Add the MCP server to ~/.claude/settings.local.json
3. Start the Supabase authentication flow and give me the browser URL to authorize
4. After I tell you I've completed authorization, finish the auth flow
5. Create a new Supabase project named {your-project-slug}, closest region to [your city/country]
6. Once the project is ready, retrieve NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   and SUPABASE_SERVICE_ROLE_KEY
7. Write them to ~/code-projects/{your-project-slug}-website/.env.local
   (also leave GEMINI_API_KEY and RESEND_API_KEY as empty placeholders)
8. Verify the connection by confirming the project is accessible via MCP
```

**The only manual step**: Claude will output a URL — open it in a browser and click **Authorize**. Tell Claude "done" when the page confirms success.

Claude handles everything else: package installation, config file update, auth completion, project creation, API key retrieval, and writing `.env.local`.

---

## Step 7 — Install global skills

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

## Step 8 — Deploy to Vercel

### 8a — Log in to Vercel CLI

```bash
vercel login
```

Authenticate with your GitHub account.

### 8b — Import and deploy

Output this and follow the steps:

```
▲  VERCEL IMPORT

1. Go to https://vercel.com/new
2. Under "Import Git Repository", find {your-project-slug}-website and click Import
3. On the Configure Project screen:
   - Framework Preset: Next.js (auto-detected — correct, leave it)
   - Root Directory: already set via vercel.json — do NOT change it
   - Environment Variables: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
     if you completed Step 6, otherwise skip for now
4. Click Deploy

The first deploy takes ~1 minute.
Once it says "Congratulations!", your site is live.
```

Note your live URL (looks like `{your-project-slug}-website.vercel.app`).

---

## Step 9 — Verify the site

Open the live URL in a browser. Confirm:
- [ ] Hero section loads with your name
- [ ] Infinite Leverage Agenda section renders
- [ ] 18 Protocols grid renders
- [ ] CTA section at the bottom

---

## P1 complete — what you have now

- [ ] jq, ffmpeg, vercel CLI installed
- [ ] Claude Code installed and authenticated
- [ ] `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/` created
- [ ] Claude Code permissions pre-seeded (no more approval interruptions)
- [ ] `~/.claude/rules/global-engineering.md` written
- [ ] Supabase project created and MCP configured (or deferred)
- [ ] Global skills installed: `daily-checkin`, `create-routines`
- [ ] Site live on Vercel with auto-deploy on every `git push origin main`

**Next**: [P2 — Your AI Team](p2-agent-team.md)
