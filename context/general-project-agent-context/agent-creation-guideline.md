# Agent Role Creation Guideline
> Abstracted from the PM agent build · April 2026

---

## Overview

Creating an agent role is a six-stage process: **define → research → design → build → test → refine**. Each stage has a clear output that feeds the next. The goal is an agent that is self-contained, tool-aware, and independently verifiable.

---

## Stage 1 — Define the Workflow

Before writing any instructions, map what the agent actually does.

**Output: a workflow diagram** (`context/<role>-workflow.html`)

Key questions to answer in the diagram:
- What triggers the agent? (schedule, human phrase, event)
- What does it read? What does it write?
- What decisions does it make?
- Where are the loops? (retry, escalation, deadline enforcement)
- Who are the humans it interacts with and how?

**Principle:** If you can't draw it, you can't instruct it. The diagram is not optional — it surfaces ambiguity before it becomes a broken prompt.

---

## Stage 2 — Research the Tool Stack

Check what's actually available before designing around tools that don't exist.

**Output: a verified tool inventory**

Steps:
1. Search the MCP registry for every service the workflow touches (messaging, task management, storage, deployment, email, scheduling)
2. Classify each tool: ✅ Connected now / ❌ Needs connection / 🔧 Available via CLI
3. For every ❌ tool, define a **fallback** — what the agent does when that tool is unavailable (write a file, log a note, skip gracefully)
4. For tools with no MCP and no CLI, flag as a blocker or a human dependency

**Principle:** Design for the tool stack you have, not the one you want. Every critical path needs a fallback.

---

## Stage 3 — Design the Data Structure

Define where everything lives before writing the persona.

**Output: a file/folder map with read/write/append operations per path**

Rules:
- Fixed, predictable paths — the agent should never search for files
- One file per purpose — don't conflate check-ins, reports, and logs
- Daily transient files (overwritten each day) vs. cumulative files (appended over time) — decide explicitly
- Every file that could be missing needs a creation path
- File format matters — include the exact schema the agent expects to read and write

**Principle:** Token efficiency lives in the data structure. An agent that knows exactly where to look reads faster and fails less.

---

## Stage 4 — Write the Persona

The persona is the agent's operating manual. It lives at `agents/<role>/context/persona.md`.

**Output: `context/persona.md`**

Required sections:

| Section | Purpose |
|---------|---------|
| **Identity & Purpose** | What the agent owns. One paragraph. |
| **Team** | Who it works with, their file paths and contact info |
| **Core Behaviors** | Non-negotiable rules derived from a framework (PMBOK, Agile, etc.) |
| **Daily Workflow** | Step-by-step — named phases with times, conditions, and fallbacks |
| **Communication Standards** | Output formats, audience calibration, escalation rules |
| **Canonical Artifacts** | What the agent maintains, where, at what cadence |
| **Data Locations** | Full path table with operation type per file |
| **Tools & MCPs** | ✅ available / ❌ needs connection / ⚠️ open decision |
| **Agent Skills** | Skill names, folder paths, trigger phrases, tools used |
| **KPIs** | Metrics the agent tracks by default |
| **Scheduled Tasks** | Triggers, times, actions, fallbacks |

**Principles:**
- The persona describes *who the agent is and what it owns* — not how to execute each skill
- Skill execution logic goes in `SKILL.md` files, not the persona
- Every communication action (notify, ping, remind) needs both a primary channel and a fallback
- Reference external domain blueprints where they exist — don't reinvent PM, design, or engineering best practices from scratch

---

## Stage 5 — Write the Skills

Each skill is a self-contained execution unit. Skills live at `agents/<role>/context/skills/<skill-name>/SKILL.md`.

**Output: one `SKILL.md` per skill**

Each SKILL.md must contain:
- **Frontmatter**: `name` and `description` (the description is the trigger — make it specific and slightly pushy)
- **Purpose**: one paragraph on why this skill exists
- **Step-by-step**: numbered phases the agent follows, with conditions and edge cases
- **File paths**: explicit paths for every read and write operation
- **Output format**: the exact structure of what the skill produces
- **Edge cases**: at least 2–3 named failure modes and how to handle them

**Skill design rules:**
- One skill = one trigger = one outcome. Don't bundle.
- If a skill writes to a file, name the file and format explicitly
- If a skill sends a notification, include the fallback path
- Skills should be executable without access to the persona — they're self-contained

---

## Stage 6 — Test with Evals

Verify each skill independently before declaring the agent ready.

**Output: `context/skills/evals/evals.json` + graded results**

Steps:
1. Write one test case per skill in `evals.json` — use realistic, specific prompts (not abstract descriptions)
2. For each test case, define 3–5 objective assertions (checkable by reading the output)
3. Create fixture files for any data the skill needs to read
4. Spawn eval agents in parallel (one per skill, with skill vs. without skill baseline)
5. Grade each output against its assertions
6. Generate the eval viewer for human review before drawing conclusions
7. Note any assertion that always passes regardless of skill — it's not discriminating

**Test case design rules:**
- Cover the happy path AND the primary failure mode (e.g., missing file, past deadline, tool unavailable)
- Assertions must be verifiable from the output text — not "did it feel right"
- If a skill produces a file, check the file content, not just the response

---

## Folder Structure

```
agents/<role>/
├── context/
│   ├── persona.md              ← stages 3–4
│   ├── <role>-workflow.html    ← stage 1
│   └── skills/
│       ├── <skill-1>/SKILL.md  ← stage 5
│       ├── <skill-2>/SKILL.md
│       └── evals/
│           └── evals.json      ← stage 6
└── output/                     ← agent writes deliverables here
```

---

## Quality Checklist

Before an agent role is considered complete:

- [ ] Workflow diagram exists and covers all triggers, loops, and decision points
- [ ] Every tool is classified (connected / needs connection / CLI fallback)
- [ ] Every notification has a fallback
- [ ] Data locations table is complete with operation types
- [ ] Persona covers all 11 required sections
- [ ] Every skill has a SKILL.md with trigger description, steps, file paths, and edge cases
- [ ] All skills have eval test cases with objective assertions
- [ ] Evals have been run and results reviewed
- [ ] No critical path depends on a tool that is ❌ not connected without a fallback

---

## One-Pass Trigger Prompt

See `context/agent-trigger-prompt.md` for the condensed prompt to create a new agent role in one pass.
