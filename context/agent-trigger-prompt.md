# Agent Role — One-Pass Trigger Prompt

Copy and fill in the bracketed fields. Hand to Claude to produce the complete agent package in one pass.

---

```
Create a complete agent role package for a [ROLE NAME] agent.

TEAM CONTEXT
- Team members: [list names, types (human/AI), emails if known]
- Project: [brief description]
- Working directory / repo: [path or URL]

ROLE PURPOSE
[One paragraph: what does this agent own? What problem does it solve for the team?]

WORKFLOW
The agent runs on a [daily / weekly / event-driven] cycle. Key phases:
1. [Trigger / time] → [action]
2. [Trigger / time] → [action]
3. [Trigger / time] → [action]
[Add as many phases as needed. Include any deadlines, retry loops, or escalation paths.]

TOOL STACK
Connected and available now: [list tools — e.g. Vercel MCP, git CLI, File tools, Scheduled Tasks MCP]
Needs connection (include fallback behaviour): [list tools + what to do if unavailable]
Not available (use alternative): [list gaps + alternative approach]

DATA STRUCTURE
[Describe what files the agent reads and writes. Include naming conventions and formats. Example:]
- standup/[name].md — daily check-in per person, overwritten each day, must start with "date: YYYY-MM-DD"
- reports/YYYY-MM.md — monthly cumulative log, appended daily
- context/RAID.md — risk log, updated weekly

SKILLS NEEDED
List the discrete capabilities this agent needs. For each, give a trigger phrase and the expected outcome:
1. [Skill name] — trigger: "[phrase]" — outcome: [what it produces]
2. [Skill name] — trigger: "[phrase]" — outcome: [what it produces]
[...]

DOMAIN FRAMEWORK (optional)
[Name any established framework to draw behavioral rules from — e.g. PMBOK 7, Agile Scrum, IDEO Design Thinking, Shape Up. If a blueprint document exists, provide its path.]

CONSTRAINTS
- [Any hard limits — e.g. "no GitHub Projects, use git CLI only", "Gmail not connected", "team is 2 people, keep process lightweight"]

---

Produce the following in one pass, saving all files to agents/[role]/context/:

1. [role]-workflow.html — a Mermaid-based HTML workflow diagram covering all triggers, decision points, loops, and fallbacks

2. persona.md — the full agent persona including:
   - Identity & purpose, team table, core behaviors (from framework if provided),
     daily workflow with fallbacks, communication standards and escalation rules,
     canonical artifacts table, data locations table, tools & MCPs table,
     skills index pointing to context/skills/, KPIs, scheduled tasks table

3. context/skills/[skill-name]/SKILL.md — one file per skill, each containing:
   - Frontmatter (name + trigger description), purpose, numbered steps,
     explicit file paths, output format, edge cases

4. context/skills/evals/evals.json — one test case per skill with:
   - Realistic prompt, expected output description, 3–5 objective assertions

Apply the agent creation guideline at context/agent-creation-guideline.md throughout.
Every notification must have a fallback. Every file path must be explicit.
No critical path should depend on a disconnected tool without a defined fallback.
```
