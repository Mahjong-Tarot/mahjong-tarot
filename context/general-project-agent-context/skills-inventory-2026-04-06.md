# Complete Skills Inventory — April 6, 2026

## PM Agent Skills (Built & Tested Today)

These 7 skills form the Project Manager agent's core toolkit. All are fully documented with SKILL.md files, test cases, and 100% assertion pass rate.

| # | Skill | Purpose | Status |
|---|-------|---------|--------|
| 1 | **Daily Stand-up** | Collect check-ins, enforce 10 AM deadline, summarize, assign tasks | ✅ Built & tested |
| 2 | **Status Report** | Generate weekly RAG (Red/Amber/Green) status snapshot | ✅ Built & tested |
| 3 | **Blocker Triage** | Scan for stuck work, rank by severity, escalate if >48h old | ✅ Built & tested |
| 4 | **RAID Log** | Track Risks, Assumptions, Issues, Dependencies | ✅ Built & tested |
| 5 | **Release Monitor** | Check Vercel deployments, report what shipped and failures | ✅ Built & tested |
| 6 | **Retrospective** | Facilitate Start/Stop/Continue retro, log action items | ✅ Built & tested |
| 7 | **Scope Change Assessment** | Evaluate scope requests, identify trade-offs, make clear recommendation | ✅ Built & tested |

**Storage**: `agents/project manager/context/skills/[skill-name]/SKILL.md`

---

## Cowork Built-in Skills (Available)

| Skill | Purpose | When to use |
|-------|---------|------------|
| **schedule** | Create scheduled tasks (recurring or one-time) | Setting up the PM agent's morning/EOD triggers, 5-min ping loops |
| **xlsx** | Create, edit, read spreadsheets (.xlsx, .csv, .tsv) | Financial tracking, capacity planning, burndown data tables |
| **pdf** | Create, merge, split, extract from PDFs | Generating reports, archiving project docs, contract management |
| **pptx** | Create, edit, read presentations (.pptx) | Executive briefings, sprint reviews, stakeholder decks |
| **docx** | Create, edit, read Word documents (.docx) | Formal documentation, proposals, project charters |
| **skill-creator** | Create or optimize new skills and run evals | Extending the PM agent with new capabilities, improving existing skills |

---

## Infrastructure & Configuration Skills (Discussed/Explored)

These are capabilities or patterns we explored today — some tools not fully available in the sandbox, but solutions identified for local/CI use.

| # | Skill | Purpose | Status | Notes |
|---|-------|---------|--------|-------|
| 1 | **Git Management** | Commit, branch, merge, conflict resolution, lock recovery | ✅ Documented | Works via Bash; sandbox constraints noted; use `git` CLI directly |
| 2 | **GitHub Integration** | Create/manage issues, PRs, projects, workflows via CLI or API | ⚠️ Explored | `gh` CLI works; PyGithub available; network proxy limits in sandbox |
| 3 | **Project Documentation** | CLAUDE.md conventions, agent folder structure, context organization | ✅ Complete | Established patterns in `/context`, `/agents` folders |
| 4 | **Repository Maintenance** | .gitignore, OS file cleanup, branch hygiene, commit discipline | ✅ Complete | Rules in CLAUDE.md; .DS_Store removed; workflow established |

**Note**: These are not "skills" in the Cowork sense (not .SKILL.md files), but documented *patterns* and *capabilities* the team uses during development.

---

## Guidance & Reference Documents (Created Today)

| Document | Purpose | Location |
|----------|---------|----------|
| **Agent Creation Guideline** | 6-stage framework for building autonomous agents | `context/agent-creation-guideline.md` |
| **Agent Trigger Prompt** | Fill-in-the-blanks prompt to create a new agent in one pass | `context/agent-trigger-prompt.md` |
| **PM Workflow Diagram** | Mermaid HTML workflow showing daily stand-up cycle | `context/project-manager-workflow.html` |
| **PM Agent Persona** | Full persona including identity, behaviors, daily workflow, tools | `agents/project manager/context/persona.md` |
| **Skills Inventory** | This file — index of all skills built and available today | `context/skills-inventory-2026-04-06.md` |

---

## Summary by Category

### Built & Ready (7 PM Agent Skills)
- All have SKILL.md files
- All have eval test cases
- All passed 100% of assertions
- Can be invoked immediately when agent is live

### Available in Cowork (6 Built-in Skills)
- schedule, xlsx, pdf, pptx, docx, skill-creator
- Use these to extend the PM agent or build new capabilities

### Infrastructure Patterns (4 Documented)
- Git, GitHub, documentation, repository maintenance
- Not formal "skills" but core team practices
- Documented in CLAUDE.md and persona

### Guidance & Frameworks (5 Reference Docs)
- Reusable guideline + trigger prompt for future agents
- PM agent fully documented and diagraded
- Ready to apply to Designer, Web Developer, Writer agents

---

## Next Steps (Not Done Today)

To bring the PM agent fully online:
1. **Connect Gmail MCP** — enables morning reminders, pings, EOD notifications
2. **Set up Scheduled Tasks** — 9 AM morning trigger, 10 AM deadline check, 5-min ping loop, 5 PM EOD
3. **Spawn the PM agent** — load persona.md + skills, activate the daily workflow
4. **Define Dave/Jan communication** — decide how they trigger "update my check-in" (Slack, direct file edit, etc.)

To scale to other agent roles:
1. Use the **Agent Trigger Prompt** to brief the next agent role (Designer, Web Dev, etc.)
2. Claude generates workflow, persona, skills, and evals in one pass
3. Run eval tests and iterate until 100% pass rate
4. Deploy the agent

