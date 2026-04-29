# CLAUDE.md Setup Guide
## For the 1-Person Company Framework — Executive Edition

> **Who this is for:** A solo operator or small executive team running projects with a team of AI agents. No coding background required for the concepts. Some file editing is needed for setup — instructions are step-by-step.

---

## What is CLAUDE.md?

CLAUDE.md is a plain text file that tells Claude Code how to behave — what rules to follow, how the project is structured, and what it is and isn't allowed to do. Think of it as your standing instructions to a senior staff member who reads their briefing notes at the start of every shift.

Claude reads every CLAUDE.md file it can find before each session. It cannot enforce rules the way a computer program enforces rules — it uses judgment, like a person following a policy manual. The more specific your instructions, the more reliably Claude follows them.

**Key principle:** CLAUDE.md is not code. It is a briefing document. Write it the way you would write instructions for a smart, capable contractor who needs to understand your standards before touching your work.

---

## The Four Levels of Memory

Claude Code loads CLAUDE.md files from four locations, each with a different scope. More specific locations take precedence over broader ones when there is a conflict.

```
Level 1 — Global (all projects, your machine only)
  ~/.claude/CLAUDE.md
  ~/.claude/rules/*.md

Level 2 — Project (shared with the team via git)
  <project-root>/CLAUDE.md
  <project-root>/.claude/rules/*.md

Level 3 — Local override (your machine only, not committed)
  <project-root>/CLAUDE.local.md

Level 4 — Managed policy (organisation-wide, set by IT)
  /Library/Application Support/ClaudeCode/CLAUDE.md  ← macOS
```

For a 1-person company, you will use Levels 1, 2, and 3. Level 4 is for larger organisations.

---

## Level 1 — Global Setup (`~/.claude/CLAUDE.md`)

### What goes here

Rules that apply to **every project on your machine**, regardless of what you are working on. These are your personal non-negotiable engineering standards.

Examples of what belongs here:
- Git discipline (never force-push, never commit without instruction)
- Deployment discipline (no direct CLI deploys, CI/CD only)
- Security rules (never commit secrets, always confirm destructive operations)
- Tool preferences (use Supabase MCP tools, not raw curl)
- Continuous improvement trigger (invoke `/capture-learning` when a solution is validated)

### What does NOT go here
- Anything project-specific (folder paths, style guides, agent names)
- Anything that changes project to project (workflows, categories, page structures)

### How to set it up

**Step 1.** Open Terminal.

**Step 2.** Run this command to open the global CLAUDE.md in a text editor:
```bash
open -e ~/.claude/CLAUDE.md
```
If the file does not exist yet, this creates it.

**Step 3.** Copy the content from this project's `.claude/rules/global-engineering.md` into `~/.claude/CLAUDE.md` as your starting point. This file contains the pre-validated global rules for this framework.

**Step 4.** Save the file. Claude will pick it up automatically at the next session start.

### Alternative: use `~/.claude/rules/` instead

For cleaner organisation, you can split global rules by topic into individual files under `~/.claude/rules/`. Each `.md` file in that folder loads automatically for every project.

```
~/.claude/rules/
├── global-engineering.md    ← Git, deployment, secrets, destructive ops
├── global-tools.md          ← MCP preferences, CLI rules
└── global-improvement.md    ← Capture-learning rule
```

To create this structure, run:
```bash
mkdir -p ~/.claude/rules
cp <project-root>/.claude/rules/global-engineering.md ~/.claude/rules/global-engineering.md
```

---

## Level 2 — Project Setup (`./CLAUDE.md`)

### What goes here

Instructions that are **specific to this project**, shared with everyone who works on it (committed to git). This is the largest and most important file.

A well-structured project CLAUDE.md has five sections:

| Section | Purpose |
|---|---|
| **Role** | One paragraph: what Claude is here to do for this project |
| **Does / Does not** | Explicit boundaries — what Claude will and won't do |
| **Folder structure** | Where everything lives, annotated |
| **Workflow** | Step-by-step process Claude follows for the main task |
| **Error handling + Quality checklist** | What to do when things go wrong; final checks before commit |

### Rules for writing it

1. **Keep it under 200 lines.** Longer files consume more of Claude's context window and reduce how reliably it follows instructions. If it grows beyond 200 lines, move detail into `context/` files and point to them.

2. **Use bullet points and headers.** Claude scans structure the same way a person does — a wall of prose is harder to follow than organised sections.

3. **Be specific and imperative.** Write `"Run npm test before committing"` not `"Make sure things work"`. Write `"Never use git add -A"` not `"Be careful with staging."` Vague instructions get followed vaguely.

4. **Don't duplicate global rules.** If a rule is already in `~/.claude/CLAUDE.md` or `.claude/rules/global-engineering.md`, do not repeat it here. Duplication creates conflicts.

5. **Point to `context/` for project-specific detail.** Style guide, blog categories, image settings, and agent personas do not belong in CLAUDE.md. Store them in `context/` and write: `"See context/web-style-guide.md for the canonical list."`

6. **Use HTML comments for maintainer notes.** Comments wrapped in `<!-- -->` are stripped from Claude's context automatically — they cost zero tokens. Use them to leave notes for your future self or teammates without bloating the file.

### How to set it up

**Step 1.** Copy the template from `architecture/templates/CLAUDE.template.md` to your new project root.

**Step 2.** Replace every `<PLACEHOLDER>` using the reference table at the bottom of the template.

**Step 3.** Create the `context/` files the template points to:
- `context/web-style-guide.md` — fonts, colours, component anatomy, content categories
- `context/web-dev-guide.md` — React patterns, naming conventions
- `context/publishing-guide.md` — image optimisation settings, Pillow workflow

**Step 4.** Set up your agent folders using the structure in the template's Agent Structure section.

**Step 5.** Commit `CLAUDE.md` to git. This is a shared team document.

---

## Level 3 — Local Override (`./CLAUDE.local.md`)

### What goes here

**Your personal, machine-specific notes for this project.** This file is never committed — add it to `.gitignore`.

Use it for:
- Your local server URL (`http://localhost:3001` instead of the standard port)
- Your preferred test data or seed commands
- Notes you want Claude to remember just for your machine
- Temporary instructions during a sprint ("ignore the blog index this week, I'm refactoring it")

### How to set it up

**Step 1.** Create the file:
```bash
touch <project-root>/CLAUDE.local.md
```

**Step 2.** Add it to `.gitignore`:
```
CLAUDE.local.md
```

**Step 3.** Write your personal notes in plain markdown. Claude appends this file after the project CLAUDE.md in every session, so your notes always take precedence over the shared instructions at the same level.

---

## Level 2 Extension — Rules Files (`.claude/rules/`)

For large projects, topic-specific rules can be extracted from CLAUDE.md into individual files under `.claude/rules/`. Each file loads automatically. This keeps the main CLAUDE.md short while still giving Claude all the detail it needs.

You can also scope rules to specific file paths:

```markdown
---
paths:
  - "website/pages/**/*.jsx"
---

Always use next/image for images, never raw <img> tags.
Run `npm run build` after any page changes to check for errors.
```

This rule only activates when Claude is working with `.jsx` files under `website/pages/`.

For global rules you want across all projects, symlink from your project into `~/.claude/rules/`:
```bash
ln -s ~/.claude/rules/global-engineering.md .claude/rules/global-engineering.md
```

---

## The `design/` Folder — Ideas Under Review

A common mistake is putting proposed ideas and approved reference material in the same folder. This causes agents to treat unreviewed plans as authoritative instructions.

Use this lifecycle:

```
New idea
  ↓
design/          Write it here first. Claude does not read this automatically.
  ↓  Human reviews and approves
context/         Move it here. Claude reads this before every task.
  ↓  Superseded by newer version
design/archive/  Move old versions here. Never delete.
```

**`design/` sub-folders:**

| Folder | Content |
|---|---|
| `design/system/` | Architecture diagrams, data models, infrastructure plans |
| `design/features/` | Feature proposals, epics under review |
| `design/agents/` | Proposed new agents, skill designs |
| `design/archive/` | Superseded designs — keep for reference |

---

## The Agent Structure Pattern

Every agent in this framework follows the same contract. Understanding this pattern lets you add new agents without breaking existing ones.

```
agents/<agent-name>/
├── context/
│   ├── persona.md          ← Who the agent is, what it does, team roster, KPIs
│   ├── style-guide.md      ← Visual and code standards for this agent's outputs
│   ├── file-conventions.md ← Naming rules and output paths
│   └── skills/
│       └── <skill-name>/
│           └── SKILL.md   ← Step-by-step instructions for one specific task
└── output/                 ← All outputs stage here before human review
```

The sub-agent stub in `.claude/agents/<name>.md` (the file that triggers the agent) must:
1. Reference the persona file: `"Read agents/<name>/context/persona.md at the start of every session"`
2. List the hard rules that cannot be overridden
3. Define explicit trigger phrases so agents don't fire on ambiguous requests

---

## The `capture-learning` Workflow

Whenever Claude solves a problem that gets your explicit approval, it should record that solution as a rule so it doesn't repeat the same mistake. This is the continuous improvement loop.

How it works:
1. You confirm a solution works ("yes, that's right", "perfect", build passes)
2. Claude automatically invokes the `/capture-learning` skill
3. The skill shows you the exact rule it plans to write and asks for confirmation
4. On confirmation, it appends the rule to the correct CLAUDE.md section
5. Universal rules go to the `[GLOBAL]` block for later promotion to `~/.claude/rules/`
6. Project-specific rules go to the project section

You never need to remember to do this — it is triggered by your approval signal.

---

## Maintenance Cadence

| Frequency | Action |
|---|---|
| Every session | Run `/memory` to verify which CLAUDE.md files are loaded |
| Weekly | Review `context/` for anything that should move to `design/` or be deleted |
| Monthly | Check CLAUDE.md line count — if over 200, extract detail to `context/` or rules files |
| On each validated fix | `/capture-learning` runs automatically |
| On team change | Update agent persona files and sub-agent stubs in `.claude/agents/` |
| On project structure change | Update CLAUDE.md folder structure section and CLAUDE.template.md |

---

## Common Mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Putting project detail in `~/.claude/CLAUDE.md` | Rules bleed into unrelated projects | Move to project CLAUDE.md |
| Duplicating global rules in project CLAUDE.md | Conflicts if they diverge; wastes context tokens | Delete the duplicate, trust the global rule |
| Putting proposed ideas in `context/` | Claude treats unreviewed plans as instructions | Move to `design/` until approved |
| Writing vague instructions | Claude interprets them inconsistently | Rewrite as specific imperatives |
| Letting CLAUDE.md grow past 200 lines | Reduced adherence, higher token cost | Extract to `context/` files, use `@import` or rules files |
| Not committing CLAUDE.md | New team members / agents start without context | Always commit the project CLAUDE.md |
| Committing `CLAUDE.local.md` | Personal overrides affect teammates | Add to `.gitignore` |

---

## Quick-Start Checklist for a New Project

- [ ] Copy `architecture/templates/CLAUDE.template.md` to new project root as `CLAUDE.md`
- [ ] Replace all `<PLACEHOLDERS>` in CLAUDE.md
- [ ] Create `context/web-style-guide.md`, `context/web-dev-guide.md`, `context/publishing-guide.md`
- [ ] Create `design/system/`, `design/features/`, `design/agents/`, `design/archive/`
- [ ] Create `.claude/rules/` and copy `global-engineering.md` from this project
- [ ] Promote `.claude/rules/global-engineering.md` to `~/.claude/rules/` on your machine
- [ ] Create `CLAUDE.local.md` and add it to `.gitignore`
- [ ] Add agent folders for any agents needed (web-developer, writer, pm, pjm)
- [ ] Create `.claude/agents/<name>.md` stubs for each agent
- [ ] Run `/memory` in Claude Code to verify all files load correctly
- [ ] Commit `CLAUDE.md` and `.claude/` to git

---

*Guide version: 1.0 — Based on Mahjong Tarot project structure. Update when the framework evolves.*
