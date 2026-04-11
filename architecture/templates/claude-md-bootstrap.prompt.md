# Claude Code Bootstrap Prompt
## Generate global + project CLAUDE.md in one session

> **How to use:** Copy everything below the horizontal rule into a fresh Claude Code session
> in your new project folder. Answer the questions, then Claude generates both files.

---

You are setting up a Claude Code workspace for a new project. Your job is to generate two files:

1. **`.claude/rules/global-engineering.md`** — universal engineering rules for every project on this machine
2. **`CLAUDE.md`** — project-specific instructions committed to this repo

Before generating anything, ask me the following questions **in a single message**. Number them. Wait for all answers before writing any files.

---

**Project questions:**

1. What is the project name?
2. In one sentence, what does this project do or produce?
3. What is your name (the human who approves work and runs `git push`)?
4. What is the GitHub repo URL?
5. What is the local path to the repo on your machine? (e.g. `~/Documents/my-project`)
6. What is the primary tech stack? (e.g. Next.js Pages Router, Django + React, plain HTML, etc.)
7. Which agents will work on this project? Choose any that apply:
   - Product Manager (ideas → epics → vision)
   - Project Manager (delivery, risk, RAID log)
   - Web Developer (drafts → components)
   - Writer (briefs → blog posts / copy)
   - Other (describe)
8. Does this project publish content on a regular cadence? (yes / no)
   - If yes: where does source content live, and where does published output go?
9. Are there any tools or services that need specific rules? (e.g. Supabase, Stripe, a custom MCP server)
10. Any hard rules specific to this project that Claude must never violate?

---

Once I answer, generate the two files using the structure below.

---

## File 1: `.claude/rules/global-engineering.md`

Use this exact content — do not personalise it, it applies to all projects:

```markdown
# Global Engineering Rules
<!--
  These rules apply to every project on this machine.
  PROMOTE to ~/.claude/rules/global-engineering.md on each team member's machine.
-->

## Git discipline

- Run `git status` before any file work. Stop and report if there are uncommitted changes or merge conflicts.
- Never force-push (`--force` or `--force-with-lease`) to any branch.
- Never skip hooks with `--no-verify`.
- Never amend a commit that has already been pushed to a remote.
- Never use `git add .` or `git add -A` — stage files explicitly by name.
- Never create a commit unless explicitly instructed by the user.

## Branch and PR discipline

- Never push directly to `main` or `master`. All changes go through a pull request.
- Never merge a PR while CI checks are failing.
- Confirm the correct base branch before opening a PR.

## Deployment discipline

- Never deploy using `vercel deploy`, `vercel --prod`, or any direct CLI deploy command.
- All deployments — preview and production — must flow through `git push` → CI/CD pipeline only.
- Never manually promote a deployment unless explicitly instructed and no CI pipeline exists.
- Never modify environment variables in the Vercel dashboard without recording the change in the repo's env documentation.
- Vercel MCP and Vercel CLI are permitted for read-only operations only: deployment status, build logs, runtime logs, analytics. Any write action must go through CI/CD or requires explicit user confirmation.

## Secrets and credentials

- Never commit `.env` files, API keys, tokens, passwords, or credentials of any kind.
- Never include secrets in code, comments, log statements, or commit messages.
- If a secret is found in staged files, remove it and warn the user before anything else.

## Destructive operations

- Always confirm with the user before: `rm -rf`, `git reset --hard`, `git branch -D`, dropping database tables, or overwriting uncommitted work.
- Investigate unknown files, branches, or lock files before deleting.
- Never use destructive commands to bypass errors — diagnose the root cause first.

## Code quality gates

- Never skip a failing test to ship faster. Fix it or escalate.
- Never disable or bypass a linter, type-checker, or CI step without explicit instruction.
- Never ship code with known security vulnerabilities (OWASP top 10: injection, XSS, broken auth, etc.).

## Supabase

When any task involves Supabase (database queries, auth, storage, edge functions, migrations, or RLS policies):
- Use the Supabase MCP tools (`mcp__supabase__*`) — do not use raw `curl`, `psql`, or Supabase CLI calls unless MCP tools are unavailable.
- If not authenticated, call `mcp__supabase__authenticate` first.
- Never hardcode Supabase URLs, anon keys, or service role keys in code — read them from environment variables.
- Never run destructive migrations (DROP, TRUNCATE, DELETE without WHERE) without explicit user confirmation.

## Continuous improvement

When a solution is explicitly approved by the user OR confirmed working (tests pass, build succeeds, user says "yes" / "perfect" / "that's right"), proactively invoke the `/capture-learning` skill without waiting to be asked.

Invoke only if all three are true:
1. A concrete problem was encountered — not exploration or planning
2. A solution was applied and confirmed working
3. The user explicitly approved the outcome
```

---

## File 2: `CLAUDE.md`

Generate this file using my answers. Follow these rules strictly:

- **Under 200 lines total**
- Use bullet points and headers — no prose walls
- Be specific and imperative ("Never use...", "Always read...")
- Do NOT duplicate anything from global-engineering.md
- Point to `context/` files for project-specific detail (style guide, categories, etc.) rather than embedding it here
- Use `<!-- HTML comments -->` for maintainer notes — they cost zero tokens

Structure the file with these sections in order:

### 1. Role (3–5 lines)
One paragraph. Who is Claude in this project, what is the primary job, who is the approver, where does output go.

### 2. Does / Does not (2 bullet lists)
5–8 bullets each. What Claude will do. What it will never do.

### 3. Folder structure (code block)
Annotated tree of the repo. Include: content source, context/, agents/ (only the ones from Q7), .claude/, working_files/, output destination.

### 4. Agent structure (if any agents selected in Q7)
One table row per agent:
| Agent | Persona file | Output path | Trigger phrase |

### 5. Primary workflow (if Q8 = yes)
Numbered steps. Keep each step to 2–3 lines. No sub-bullets.

### 6. Working files
Standard rule: `working_files/` is git-ignored scratch space. Files go here if unreferenced or not yet in final format. Never commit from here.

### 7. Error handling
Table: Situation | Action. 4–6 rows covering the most likely failure modes for this project.

### 8. Quality checklist
5–8 checkboxes. Run before every commit.

### 9. Project-specific rules (if any from Q10)
Bullet list. Imperative voice only.

---

After writing both files, output:

> **Next steps:**
> 1. Run `mkdir -p ~/.claude/rules && cp .claude/rules/global-engineering.md ~/.claude/rules/global-engineering.md` to promote the global rules to your machine.
> 2. Create `CLAUDE.local.md` for personal overrides and add it to `.gitignore`.
> 3. Run `/memory` in Claude Code to verify all files load.
> 4. Commit `CLAUDE.md` and `.claude/` to git.
