# Track A — P1: Machine Setup

> **Who runs this**: Dave (the developer) on the Mac Mini
> **Machine state**: Completely fresh — nothing installed
> **Prerequisite**: P0 complete; `{project-slug}-credentials.md` in hand
> **Output**: Mac Mini fully configured, client website live on Vercel, ready for P2

---

## Step 1 — Install remaining tools

Homebrew and git were installed in P0. Claude Code runs the rest:

```bash
eval "$(/opt/homebrew/bin/brew shellenv)" 2>/dev/null || eval "$(/usr/local/bin/brew shellenv)" 2>/dev/null || true
brew install gh node jq ffmpeg
npm install -g vercel
brew tap supabase/tap && brew install supabase/tap/supabase
```

Verify:
```bash
gh --version && node --version && jq --version && ffmpeg -version && vercel --version && supabase --version
```

---

## Step 2 — Authenticate GitHub CLI

```bash
gh auth login
```

- Select: **GitHub.com**
- Protocol: **HTTPS**
- Authenticate: **Login with a web browser**
- Log in with the operator account (`{firstname}@{clientdomain}.com`)

Verify:
```bash
gh auth status
```

---

## Step 3 — Pre-seed Claude Code permissions

```bash
mkdir -p ~/.claude
cat > ~/.claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": ["Bash(*)"],
    "defaultMode": "acceptEdits"
  }
}
EOF
```

`Bash(*)` allows every CLI command without a prompt. `acceptEdits` auto-approves all file writes. Claude will never interrupt mid-task to ask permission.

---

## Step 4 — Create global Claude Code directories

```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/rules
```

---

## Step 5 — Write global CLAUDE.md

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

## Publishing workflow (automated Mon–Wed)
1. Monday 9am    — Writer writes the post + image prompt
2. Tuesday 9am   — Designer generates the hero image
3. Wednesday 9am — Web Developer builds and stages the page
4. Run: `git push origin main` (owner only)
EOF
```

---

## Step 6 — Write global engineering rules

```bash
cat > ~/.claude/rules/global-engineering.md << 'EOF'
# Global Engineering Rules

## Git discipline
- Run `git status` before any file work.
- Never force-push to any branch.
- Never skip hooks with `--no-verify`.
- Never use `git add .` or `git add -A` — stage files explicitly by name.
- Never create a commit unless explicitly instructed by the user.

## Branch and PR discipline
- Never push directly to `main` or `master`. All changes go through a pull request.
- Confirm the correct base branch before opening a PR.

## Deployment discipline
- Never deploy using `vercel deploy` or `vercel --prod` directly.
- All deployments flow through `git push` → CI/CD pipeline only.

## Secrets and credentials
- Never commit `.env` files, API keys, tokens, or passwords.
- Never include secrets in code, comments, or commit messages.

## Destructive operations
- Always confirm with the user before: `rm -rf`, `git reset --hard`, dropping database tables.
EOF
```

---

## Step 7 — Write Supabase credentials to .env

```bash
cat > ~/.claude/.env << 'EOF'
SUPABASE_URL={your-supabase-url}
SUPABASE_ANON_KEY={your-anon-key}
SUPABASE_SERVICE_ROLE_KEY={your-service-role-key}
GEMINI_API_KEY={your-gemini-api-key}
RESEND_API_KEY={your-resend-api-key}
RESEND_DOMAIN={your-client-domain}
LARK_APP_ID={your-lark-app-id}
LARK_APP_SECRET={your-lark-app-secret}
LARK_WEBHOOK_URL={your-lark-webhook-url}
EOF
```

Replace all `{placeholder}` values from the credentials file created in P0.

---

## Step 8 — Configure Supabase MCP

Say this to Claude Code:

```
Set up the Supabase MCP server on this machine:
1. Fetch the latest Supabase MCP setup documentation so you follow the current install method
2. Add the MCP server to ~/.claude/settings.local.json
3. Start the Supabase authentication flow and give me the browser URL to authorize
4. After I tell you I've completed authorization, finish the auth flow
5. Verify the connection by listing my Supabase projects
```

**The only manual step**: Claude will output a URL — open it in a browser and click **Authorize**. Tell Claude "done" when the page confirms success.

Claude handles everything else: package installation, config file update, auth completion, and connection verification.

---

## Step 9 — Install global skills

### daily-checkin skill

```bash
mkdir -p ~/.claude/skills/daily-checkin
cat > ~/.claude/skills/daily-checkin/SKILL.md << 'EOF'
---
name: daily-checkin
description: Run morning standup check-in — reads recent git commits, open PRs, and any pending content briefs; outputs a brief for the day.
triggers: ["daily checkin", "morning standup", "what's on today"]
---

## Steps
1. Run `git log --oneline -10` in the project folder
2. Run `gh pr list --state open`
3. Check `content/topics/` for any folders with `brief.md` but no `blog.md`
4. Output: what shipped yesterday, open PRs, content queued
EOF
```

### create-routines skill

```bash
mkdir -p ~/.claude/skills/create-routines
cat > ~/.claude/skills/create-routines/SKILL.md << 'EOF'
---
name: create-routines
description: Creates a task file in working_files/tasks/ with a clear description, acceptance criteria, and priority.
triggers: ["create task", "new task", "log task"]
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

### skill-creator skill

```bash
mkdir -p ~/.claude/skills/skill-creator
cat > ~/.claude/skills/skill-creator/SKILL.md << 'EOF'
---
name: skill-creator
description: Scaffolds a new skill file for a given agent or global skill.
triggers: ["create skill", "new skill", "add skill"]
---

## Steps
1. Ask: skill name, description, trigger phrases, steps
2. Create `~/.claude/skills/{name}/SKILL.md` or `agents/{agent}/skills/{name}/SKILL.md`
3. Use the SKILL.md template format with frontmatter (name, description, triggers) + Steps section
EOF
```

---

## Step 10 — First project: client website

This is the final step of P1. All code projects live under `~/code-projects/` — the project root is `{project-slug}/`, mirroring the mahjong-tarot codebase structure. The website lives inside it as `website/`.

### 10a — Create project root and full directory structure

```bash
mkdir -p ~/code-projects/{project-slug}
cd ~/code-projects/{project-slug}

# Core project folders (mirrors mahjong-tarot)
mkdir -p agents/{product-manager,developer,qa,devops,writer,designer,web-publisher}/{context,skills}
mkdir -p content/{topics,content-calendar}
mkdir -p docs/architecture/{templates,workflows}
mkdir -p docs/{brand,engineering,product,qa,features,archive}
mkdir -p docs/engineering/{changes,prompts}
mkdir -p docs/plans
mkdir -p emails/drafts
mkdir -p resources
mkdir -p standup/{individual,briefings}
mkdir -p working_files
mkdir -p .claude/{agents,skills,rules}
```

### 10b — Scaffold Next.js 16 into `website/`

Run from `~/code-projects/{project-slug}/`:

```bash
npx create-next-app@16 website \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*" \
  --agents-md \
  --disable-git \
  --yes
cd website
npx shadcn@latest init --defaults
cd ..
```

> **Note — Next.js 16 rename:** `middleware.ts` → `proxy.ts`. Use `proxy.ts` at `website/` root if you add auth or redirect logic.

### 10c — Add vercel.json at project root

```bash
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "rootDirectory": "website"
}
EOF
```

`rootDirectory: "website"` tells Vercel the Next.js app is in the subdirectory — no manual setting needed during import.

### 10d — Configure fonts and Tailwind

`next/font` self-hosts both fonts — no external request at runtime, zero layout shift.

**`website/src/app/layout.tsx`**:

```tsx
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**`website/tailwind.config.ts`**:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
}
export default config
```

### 10e — Apply Infinite Leverage design tokens

**`website/src/app/globals.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ink:       #0B1426;
  --ink-soft:  #1F2A3D;
  --gray-1:    #94A3B8;
  --gray-2:    #64748B;
  --gray-3:    #CBD5E1;
  --rule:      #E2E8F0;
  --blue:      #2563EB;
  --blue-soft: #DBEAFE;
  --cream:     #F2EDE3;
  --paper:     #FFFFFF;
}

body {
  @apply font-sans antialiased;
  color: var(--ink);
  background: var(--paper);
}
```

### 10f — Build the website

All page files go under `website/src/app/`.

**`website/src/app/page.tsx` — Home page (four sections)**

**Section 1 — Hero**
- Full-width, `#0B1426` background, white text
- `{Client First Name}` in Inter Tight 800, `clamp(72px, 10vw, 160px)`, letter-spacing `-0.035em`
- Subtitle: `{Business Name}` in `var(--gray-3)`, 1.4em
- Badge at bottom: green dot (#22C55E) + JetBrains Mono "AI team is online", uppercase, 0.8em

**Section 2 — Infinite Leverage Agenda**

Cream (`#F2EDE3`) background. Heading: **"The Infinite Leverage Agenda"**.

Five tracks as border-top ruled rows — JetBrains Mono number in blue, bold track name, muted description:

| # | Track | Description |
|---|-------|-------------|
| 01 | Mindset | Humans are the orchestrator. AI is the CMS. Structure beats novelty. |
| 02 | Infrastructure | GitHub · Vercel · Supabase. Master three tools, ship anything. |
| 03 | Building | Design systems, automated workflows, admin tools your team uses without escalating. |
| 04 | Team and Ops | The right roles, epic planning, a PM agent that knows what you shipped yesterday. |
| 05 | Continuity | What AI can test on its own. How to hand off context. The work outlives the operator. |

**Section 3 — 18 Protocols**

White background. Heading: **"18 Protocols. One operating system."** Two-column grid (single column on mobile), each row ruled, number in JetBrains Mono blue:

| # | Protocol |
|---|----------|
| 01 | Humans are the orchestrator. |
| 02 | The CMS is dead — AI is the CMS. |
| 03 | The stack: Claude, GitHub, Vercel, Supabase. |
| 04 | Agents are folders, not magic. |
| 05 | GitHub — version control for all code and agent context. |
| 06 | Vercel — deployment; CI/CD via git push only. |
| 07 | Supabase — data layer; contact forms, subscribers, CRM. |
| 08 | Design systems Claude can read. |
| 09 | Workflows that turn intent into output. |
| 10 | Communications that go out automatically. |
| 11 | Admin tools your team uses without escalating. |
| 12 | When to bring in a human engineer. |
| 13 | The roles every Infinite Leverage team has. |
| 14 | How to plan an epic. |
| 15 | A PM agent that already knows what you shipped. |
| 16 | What AI can test on its own, and what it cannot. |
| 17 | How to hand off context, memory, and project state. |
| 18 | The work outlives the operator. |

**Section 4 — CTA**

`#0B1426` background, white text. Pull quote:
> "You + an AI engineer + this team = the new minimum viable founder."

"Ready to build?" with `mailto:{firstname}@{clientdomain}.com`.

---

**`website/src/app/about/page.tsx`** — Stub: "About {Business Name}" / "Coming soon."

**`website/src/app/contact/page.tsx`** — Stub: "Get in touch" / `mailto:{firstname}@{clientdomain}.com`

### 10g — Write project CLAUDE.md

At project root (`~/code-projects/{project-slug}/CLAUDE.md`):

```bash
cat > CLAUDE.md << 'EOF'
# {Business Name} — Project Instructions

## Stack
- Website: Next.js 16 App Router + Tailwind + shadcn (`website/`)
- Database: Supabase
- Deployment: Vercel (auto-deploy on `git push origin main`)
- Email: Resend

## Folder structure
```
{project-slug}/
├── agents/              ← Project-specific agent context and skills
│   └── {agent}/
│       ├── context/     ← persona.md, workflow files
│       └── skills/      ← project-specific skills
├── content/
│   ├── topics/          ← One folder per post: brief.md → blog.md
│   └── content-calendar/
├── docs/
│   ├── architecture/
│   │   ├── templates/   ← Reusable doc templates
│   │   └── workflows/   ← System workflow diagrams and specs
│   ├── brand/           ← Palette, voice, visual identity
│   ├── engineering/
│   │   ├── changes/     ← Change records
│   │   └── prompts/     ← Setup and bootstrap prompts
│   ├── features/        ← Per-feature proposals and design docs
│   ├── plans/           ← Project and feature plans (one file per plan)
│   ├── product/         ← Vision, epics, phased timeline
│   ├── qa/              ← QA plan and regression reports
│   └── archive/         ← Historical and superseded material
├── emails/drafts/       ← Email drafts before sending
├── resources/           ← Design system, brand assets
├── standup/
│   ├── individual/      ← Per-person daily check-ins
│   └── briefings/       ← Compiled daily briefings (YYYY-MM/YYYY-MM-DD.md)
├── website/             ← Next.js app root
│   └── src/app/         ← Pages and components
├── working_files/       ← Git-ignored scratch space
└── .claude/             ← Project-level agents, skills, rules
```

## Content pipeline
1. Add `brief.md` to `content/topics/{slug}/` to queue a post
2. Writer writes `blog.md` on Monday
3. Designer generates hero image on Tuesday
4. Web Publisher builds and stages the page on Wednesday
5. Owner runs `git push origin main` to deploy

## Publishing
Never push directly. All deploys via `git push origin main` → Vercel CI/CD.
Never commit `.env.local` or any secrets.
EOF
```

### 10h — Write .gitignore at project root

```bash
cat > .gitignore << 'EOF'
# Dependencies
website/node_modules/

# Build output
website/.next/
website/out/

# Secrets
website/.env.local
website/.env
.env
.env.local

# Scratch space
working_files/

# System
.DS_Store
EOF
```

### 10i — Initialize git and push to GitHub

```bash
cd ~/code-projects/{project-slug}
git init
git checkout -b main
git add agents/ content/ docs/ emails/ resources/ standup/ .claude/ \
        website/src/ website/public/ website/package.json website/package-lock.json \
        website/tailwind.config.ts website/tsconfig.json website/next.config.ts \
        website/components.json website/AGENTS.md \
        CLAUDE.md vercel.json .gitignore
git commit -m "init: {Client Name} — project scaffold + Infinite Leverage site"
gh repo create {project-slug} --public --source=. --remote=origin --push
```

### 10j — Import to Vercel and deploy

Output this and wait for confirmation before continuing:

```
▲  VERCEL IMPORT

1. Go to https://vercel.com/new
2. Find {project-slug} and click Import
3. On the Configure Project screen:
   - Framework Preset: Next.js (auto-detected — correct)
   - Root Directory: "website" (set automatically via vercel.json — do NOT change)
   - Skip environment variables for now
4. Click Deploy

The first deploy takes ~1 minute.
Once it shows "Congratulations!", the site is live.

Reply "done" when it's live.
```

Wait for "done". Note the live URL as `{project-slug}-live-url`.

Verify: confirm the hero, agenda, protocols, and CTA sections all render correctly.

---

## Step 11 — Final git commit and push

```bash
cd ~/code-projects/{project-slug}
git status
git push origin main
```

Confirm Vercel auto-deploys from the push (check Vercel dashboard for deployment status).

---

## P1 complete — what you have now

- [ ] GitHub CLI authenticated as operator account
- [ ] `~/.claude/settings.local.json` with permissions + Supabase MCP
- [ ] `~/.claude/agents/`, `~/.claude/skills/`, `~/.claude/rules/` created
- [ ] `~/.claude/CLAUDE.md` written
- [ ] `~/.claude/rules/global-engineering.md` written
- [ ] `~/.claude/.env` written with all API keys
- [ ] Global skills installed: `daily-checkin`, `create-routines`, `skill-creator`
- [ ] `~/code-projects/{project-slug}/` created with full mahjong-tarot-style folder structure
- [ ] `website/` scaffolded with Next.js 16 + shadcn inside the project root
- [ ] Client website live: Hero + Infinite Leverage Agenda + 18 Protocols + CTA
- [ ] `{project-slug}` repo on GitHub
- [ ] Live URL confirmed on Vercel

**Next**: [P2 — Agent Team](p2-agent-team.md)
