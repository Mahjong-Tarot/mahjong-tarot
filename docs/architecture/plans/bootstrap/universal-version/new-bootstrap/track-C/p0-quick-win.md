# Track C — P0: Quick Win

> **Who runs this**: You, on your own laptop
> **Machine state**: Your existing machine — may have some tools already
> **End state**: A Next.js project on GitHub with your name on it. Takes ~30 minutes.

---

## Why P0 ends with a live repo

Most setup guides bury the payoff. You install things for an hour and have nothing to show for it.

This is different. By the end of P0 you will have a real website project on GitHub — your business name, your design, your repo. Everything in P1 and P2 builds on top of it. The hard part is already done.

---

## Step 1 — Create a GitHub account

If you already have one, skip to Step 2.

1. Go to `github.com` → **Sign up**
2. Use your business email if you have one, or your personal email
3. Choose a username — lowercase, hyphens OK (e.g. `janesmith` or `jane-smith-co`)
4. Complete email verification

> **Keep this tab open** — you'll come back to it in Step 5.

---

## Step 2 — Install Homebrew

Homebrew is the package manager for Mac. It installs everything else.

Open **Terminal** (search "Terminal" in Spotlight) and paste:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

The installer will ask for your Mac login password (normal — nothing is shown as you type, just press Enter).

After it finishes, follow the printed instructions to add Homebrew to your PATH. They look like this — copy and run both lines exactly as shown:

```bash
# These two lines will be printed for you — copy them from YOUR terminal output
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Verify:
```bash
brew --version
```
You should see `Homebrew 4.x.x`.

---

## Step 3 — Install git, gh CLI, and Node

```bash
brew install git gh node
```

This takes a few minutes. When it finishes:

```bash
git --version && gh --version && node --version
```

All three should print version numbers.

---

## Step 4 — Authenticate with GitHub

```bash
gh auth login
```

Answer the prompts:
- **Where do you use GitHub?** → `GitHub.com`
- **Protocol?** → `HTTPS`
- **Authenticate with browser?** → Yes

Your browser will open. Log in with the GitHub account from Step 1. Come back to Terminal when it says you're done.

Verify:
```bash
gh auth status
```
It should show your GitHub username.

---

## Step 5 — Create your project folder

All your code projects will live in one place:

```bash
mkdir -p ~/code-projects
cd ~/code-projects
```

---

## Step 6 — Scaffold your Next.js project

Replace `{your-project-slug}` with your business name in lowercase with hyphens (e.g. `jane-smith-co`).

```bash
npx create-next-app@16 {your-project-slug}-website \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*" \
  --agents-md \
  --disable-git \
  --yes
cd {your-project-slug}-website
```

When it finishes you'll have a complete Next.js 16 project with TypeScript, Tailwind, and App Router.

---

## Step 7 — Write your CLAUDE.md

This file tells Claude Code who you are and how your project works. Every time you open Claude Code, it reads this file first.

```bash
cat > CLAUDE.md << 'EOF'
# {Your Business Name} — Project Instructions

## Stack
- Next.js 16, App Router, TypeScript
- Tailwind CSS + shadcn/ui
- Fonts: Inter Tight (sans), JetBrains Mono (mono) via next/font
- Backend: Supabase

## File structure
- `src/app/` — all pages and routes
- `src/components/` — shared React components
- `src/lib/` — utilities, Supabase client
- `public/` — static assets

## Next.js 16 notes
- Use `proxy.ts` (not `middleware.ts`) for auth gates and redirects
- Default to Server Components; add `'use client'` only where interactivity is needed
- Use `next/font` for fonts — never `<link>` tags
- Use `next/image` for all images — never `<img>`

## Engineering rules
- Never commit `.env` files, API keys, or credentials
- Never use `git add .` or `git add -A` — stage files explicitly by name
- Never force-push to `main`
- All deployments through `git push` → Vercel CI/CD only

## Content queue
Add a `brief.md` to any `content/topics/{slug}/` folder to queue a post.

## Automated publishing (Mon–Wed)
1. Monday 9am    — Writer writes the post
2. Tuesday 9am   — Designer generates the hero image
3. Wednesday 9am — Web Publisher stages the commit
4. You run `git push origin main` to go live
EOF
```

---

## Step 8 — Install shadcn

```bash
npx shadcn@latest init --defaults
```

This adds the shadcn component library (New York style, Zinc base, CSS variables).

---

## Step 9 — Set up fonts and design tokens

**`src/app/layout.tsx`** — replace the font import section with:

```tsx
import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  title: '{Your Business Name}',
  description: 'Infinite Leverage — AI-powered business.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**`tailwind.config.ts`** — add font families:

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

**`src/app/globals.css`** — replace entirely:

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

---

## Step 10 — Build your home page

Replace `src/app/page.tsx` with your landing page. This is a real page — not a placeholder.

It has four sections:

**Section 1 — Hero** (dark background `#0B1426`, white text)
- Your first name in a massive headline: `Hello, {First Name}.`
- Your business name below in muted text
- "AI team is online" badge (green dot + JetBrains Mono text)

**Section 2 — Infinite Leverage Agenda** (cream `#F2EDE3` background)
- Heading: "The Infinite Leverage Agenda"
- Five tracks as a numbered ruled list:

| # | Track | What it covers |
|---|-------|----------------|
| 01 | Mindset | Humans are the orchestrator. AI is the CMS. Structure beats novelty. |
| 02 | Infrastructure | GitHub · Vercel · Supabase. Three tools. Ship anything. |
| 03 | Building | Design systems, automated workflows, admin tools that run without you. |
| 04 | Team and Ops | The right roles, epic planning, a PM agent that knows what you shipped. |
| 05 | Continuity | What AI can test. How to hand off context. The work outlives you. |

**Section 3 — 18 Protocols** (white background)
- Heading: "18 Protocols. One operating system."
- Two-column grid on desktop, single column on mobile
- Each protocol as a ruled row: blue monospace number + protocol text

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

**Section 4 — CTA** (dark `#0B1426` background)
- Pull quote: "You + an AI engineer + this team = the new minimum viable founder."
- "Ready to build?" → mailto link to your email

Add two stub pages:
- `src/app/about/page.tsx` — "About {Business Name}" / "Coming soon."
- `src/app/contact/page.tsx` — "Get in touch" / your email link

---

## Step 11 — vercel.json

```bash
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "rootDirectory": "."
}
EOF
```

---

## Step 12 — .gitignore

```bash
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.claude/settings.local.json
node_modules/
.next/
working_files/
*.psd
*.ai
*.mov
*.mp4
EOF
```

---

## Step 13 — git init, commit, and push to GitHub

```bash
git init
git checkout -b main
git add src/ public/ package.json package-lock.json tailwind.config.ts tsconfig.json next.config.ts components.json vercel.json .gitignore CLAUDE.md AGENTS.md
git commit -m "init: {Your Business Name} — Infinite Leverage site"
```

Now push to GitHub:

```bash
gh repo create {your-project-slug}-website --public --source=. --remote=origin --push
```

When it finishes, open the link it prints — you'll see your repo on GitHub.

---

## P0 complete — what you have now

- [ ] GitHub account created and authenticated
- [ ] Homebrew, git, gh CLI, Node all installed
- [ ] `~/code-projects/{your-project-slug}-website/` created
- [ ] Next.js 16 project scaffolded (TypeScript, Tailwind, App Router, shadcn)
- [ ] Fonts configured (Inter Tight + JetBrains Mono via `next/font`)
- [ ] Infinite Leverage design tokens in globals.css
- [ ] CLAUDE.md written with Next.js 16 stack context
- [ ] Home page with Hero + Agenda + 18 Protocols + CTA
- [ ] Repo live on GitHub: `github.com/{your-username}/{your-project-slug}-website`

**That's a real project. Not a tutorial. Not a template. Yours.**

**Next**: [P1 — Machine Setup](p1-machine-setup.md)
