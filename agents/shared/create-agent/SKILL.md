---
name: create-agent
description: Runs a structured interview to design a new Claude agent role from scratch. Generates an HTML workflow diagram for review, iterates until approved, then produces the complete agent package (persona, skills, evals) and installs the agent into .claude/agents/. Trigger when the user says "create an agent", "build an agent", "I need an agent that...", or "set up a new agent role".
allowed-tools: Read Write Bash Glob Grep
---

# Create Agent Skill

Guide the user through designing a new Claude Code subagent role from requirements through to installation. Follow the six-stage process in `context/agent-creation-guideline.md`.

---

## Phase 1 — Interview

Run a structured interview. Ask all questions in a single message, grouped by section. Do not proceed until the user has answered each section. If answers are vague, ask one follow-up before moving on.

Present this exactly:

---

**Let's design your new agent. Answer what you know — leave blanks for anything uncertain.**

**1. Role basics**
- What is this agent's name or role title?
- In one sentence: what problem does it solve or what does it own?

**2. Team & context**
- Who does it work with? (names, human or AI, any contact info)
- What project or repo does it operate in?

**3. Workflow**
- What triggers it? (a time/schedule, a human phrase, an event, or all three)
- Walk me through the key phases it goes through from trigger to done — even rough steps work
- Are there any retry loops, escalation paths, or deadlines it must enforce?

**4. Tool stack**
- What tools or services should it have access to? (e.g. git CLI, GitHub MCP, Slack, Supabase, file tools, scheduled tasks)
- Are any of these not yet connected? If so, what should it do as a fallback?

**5. Data & files**
- What files does it read? What files does it write or update?
- Any naming conventions or formats it must follow?

**6. Skills**
- List the discrete things this agent needs to be able to do (each skill = one trigger, one outcome)
- For each: what phrase triggers it and what does it produce?

**7. Constraints & framework**
- Any hard limits? (tools to avoid, process to keep lightweight, privacy rules)
- Any established framework to draw behaviour from? (e.g. PMBOK, Agile, Shape Up, IDEO)

---

## Phase 2 — Generate the Workflow Diagram

Once the interview is complete, generate a Mermaid-based HTML workflow diagram and save it to `agents/shared/create-agent/output/<role-slug>-workflow.html`.

### HTML template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Role Name] — Workflow Diagram</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    body { font-family: sans-serif; background: #0f1117; color: #e2e8f0; margin: 0; padding: 2rem; }
    h1 { font-size: 1.4rem; margin-bottom: 1.5rem; color: #7dd3fc; }
    .mermaid { background: #1e2330; border-radius: 8px; padding: 2rem; }
  </style>
</head>
<body>
  <h1>[Role Name] — Agent Workflow</h1>
  <div class="mermaid">
  flowchart TD
    %% Replace with generated diagram nodes
  </div>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'dark' });</script>
</body>
</html>
```

### Diagram requirements

The diagram must cover:
- All triggers (schedule, phrase, event)
- Each named phase with its action and output
- Decision points (e.g. "file exists?", "tool available?")
- Retry and escalation loops
- Fallback paths for disconnected tools
- Terminal states (done, blocked, escalated)

After saving, tell the user:

> **Workflow diagram saved** → `agents/shared/create-agent/output/<role-slug>-workflow.html`
>
> Open it in a browser and review. Tell me:
> - Any phases that are missing or wrong
> - Any flows that need reordering
> - Anything to add or remove
>
> Type **"approved"** when the diagram looks right, or describe the changes you want.

---

## Phase 3 — Iterate

For each round of feedback:
1. Apply the requested changes to the diagram
2. Overwrite the same file
3. Summarise what changed (bullet list)
4. Ask for approval again

Repeat until the user says "approved", "looks good", "ship it", or similar.

---

## Phase 4 — Generate the Complete Agent Package

Once the diagram is approved, generate all files in one pass. Save everything before reporting.

### File map

| File | Purpose |
|------|---------|
| `agents/<role-slug>/context/<role-slug>-workflow.html` | Copy the approved diagram here |
| `agents/<role-slug>/context/persona.md` | Full agent persona |
| `agents/<role-slug>/context/skills/<skill-name>/SKILL.md` | One per skill |
| `agents/<role-slug>/context/skills/evals/evals.json` | One test case per skill |
| `.claude/agents/<role-slug>.md` | Claude Code subagent installer file |

---

### 4a — persona.md

Follow the 11-section structure from `context/agent-creation-guideline.md`:

```markdown
# [Role Name] Agent — Persona

## Identity & Purpose
[One paragraph: what this agent owns and the problem it solves]

## Team
| Name | Type | Role | Contact |
|------|------|------|---------|
| ...  | ...  | ...  | ...     |

## Core Behaviors
[5–8 non-negotiable rules derived from the domain framework or the user's constraints]

## Daily Workflow
[Named phases with times/triggers, step-by-step actions, conditions, and fallbacks]

## Communication Standards
[Output formats, audience calibration, escalation rules, tone]

## Canonical Artifacts
| Artifact | Path | Cadence | Operation |
|----------|------|---------|-----------|

## Data Locations
| File | Path | Read/Write/Append | Notes |
|------|------|-------------------|-------|

## Tools & MCPs
| Tool | Status | Fallback |
|------|--------|----------|
| ...  | ✅ Connected / ❌ Needs connection / 🔧 CLI | ... |

## Agent Skills
| Skill | Folder | Trigger phrase | Output |
|-------|--------|----------------|--------|

## KPIs
[3–5 measurable metrics this agent tracks]

## Scheduled Tasks
| Trigger | Time/Condition | Action | Fallback |
|---------|----------------|--------|----------|
```

---

### 4b — SKILL.md (one per skill)

```markdown
---
name: <skill-name>
description: <Specific trigger description — slightly pushy, makes Claude want to use it>
allowed-tools: Read Write Bash Glob Grep
---

# [Skill Name]

## Purpose
[One paragraph: why this skill exists and what it produces]

## Steps

### 1. [Phase name]
[Action, condition, edge case handling]

### 2. [Phase name]
[...]

## File Paths
| Operation | Path |
|-----------|------|
| Read      | ...  |
| Write     | ...  |

## Output Format
[Exact structure of what this skill produces — headings, fields, file format]

## Edge Cases
- **[Failure mode 1]**: [how to handle]
- **[Failure mode 2]**: [how to handle]
- **[Failure mode 3]**: [how to handle]
```

---

### 4c — evals.json

```json
{
  "agent": "<role-name>",
  "skills": [
    {
      "skill": "<skill-name>",
      "test_cases": [
        {
          "id": "happy-path",
          "prompt": "<realistic, specific trigger prompt>",
          "fixtures": ["<any files the skill needs to read — list paths>"],
          "assertions": [
            "<assertion 1 — checkable from output text>",
            "<assertion 2>",
            "<assertion 3>"
          ]
        },
        {
          "id": "failure-mode",
          "prompt": "<trigger prompt that hits the primary failure case>",
          "fixtures": [],
          "assertions": [
            "<assertion that failure was handled gracefully>",
            "<assertion that fallback was used>"
          ]
        }
      ]
    }
  ]
}
```

---

### 4d — .claude/agents/<role-slug>.md

This file installs the agent into Claude Code so it is invocable via `@<role-slug>`.

```markdown
---
name: <Role Name>
description: <One sentence — specific enough that Claude knows exactly when to route to this agent. Match the agent's primary trigger phrases.>
model: sonnet
tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

You are the <Role Name> for <project/team>. Your persona and full operating instructions are at `agents/<role-slug>/context/persona.md`. Read that file at the start of every session before taking any action.

## Quick reference

**Purpose:** <one sentence>
**Triggers:** <list the main phrases or conditions that invoke you>
**Primary output:** <what you produce most often>
**Skills:** <comma-separated skill names>

## On first invocation

1. Read `agents/<role-slug>/context/persona.md`
2. Check what the user is asking for
3. If it matches a skill trigger, load the relevant `SKILL.md` from `agents/<role-slug>/context/skills/`
4. Execute the skill steps

## Hard rules

- Never act without reading the persona first
- Every notification must use the fallback if the primary channel is unavailable
- All file writes must use the exact paths in the persona's data locations table
```

---

## Phase 5 — Report & Next Steps

After all files are saved, report:

```
✅ Agent package created for: <Role Name>

Files written:
  agents/<role-slug>/context/<role-slug>-workflow.html
  agents/<role-slug>/context/persona.md
  agents/<role-slug>/context/skills/<skill-1>/SKILL.md
  agents/<role-slug>/context/skills/<skill-2>/SKILL.md   (if applicable)
  agents/<role-slug>/context/skills/evals/evals.json
  .claude/agents/<role-slug>.md  ← agent is now installed

To use your new agent:
  @<role-slug> <your request>

Next recommended steps:
  1. Review persona.md and adjust any behaviours that don't fit
  2. Create fixture files for the evals (listed in evals.json)
  3. Run the evals to verify each skill works as expected
  4. Commit: git add agents/<role-slug>/ .claude/agents/<role-slug>.md
```

---

## Edge Cases

- **User skips interview sections**: Fill what you can from context, flag the gaps, and ask targeted follow-up questions before generating.
- **Role name conflicts with existing agent**: Warn the user, suggest a distinguishing suffix, and confirm before writing any files.
- **Tool flagged as ❌ not connected with no fallback given**: Default to "write a note to `agents/<role-slug>/output/pending-actions.md`" and flag it explicitly in the persona's tools table.
- **User wants fewer skills than the workflow implies**: Accept their list but note any workflow phases that have no corresponding skill — they may be gaps to fill later.
- **Diagram iteration > 3 rounds**: Offer to regenerate from scratch with a revised interview summary rather than continuing to patch.
