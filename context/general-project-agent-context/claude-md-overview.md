# CLAUDE.md Framework — Overview
## How Memory, Rules, and Agents Work Together

> High-level reference for executives. No code required to understand this diagram.

---

```mermaid
flowchart TD

  %% ─── HUMANS ──────────────────────────────────────────────
  subgraph HUMANS["👤 Humans"]
    EX["Executive"]
    DEV["Engineer"]
  end

  %% ─── MEMORY ──────────────────────────────────────────────
  subgraph MEMORY["🧠 Memory — loaded top to bottom each session"]
    G["~/.claude/rules/\nGlobal rules\nAll projects"]
    P["./CLAUDE.md\nProject rules\nShared via git"]
    L["./CLAUDE.local.md\nPersonal overrides\nYour machine only"]
    G --> P --> L
  end

  %% ─── AGENTS ──────────────────────────────────────────────
  subgraph AGENTS["🤖 AI Agents"]
    PM["Product Manager"]
    PJM["Project Manager"]
    WD["Web Developer"]
    WR["Writer"]
  end

  %% ─── SKILLS ──────────────────────────────────────────────
  subgraph SKILLS["⚡ Skills"]
    BP["build-page"]
    GI["generate-image"]
    CL["capture-learning"]
  end

  %% ─── SINGLE NODES ────────────────────────────────────────
  CTX["📁 context/\nApproved reference files"]
  DESIGN["💡 design/\nProposals under review"]
  CONTENT["📄 Content\nIdea → Draft → Publish"]

  %% ─── CONNECTIONS ─────────────────────────────────────────
  HUMANS   -->|"trigger"| AGENTS
  MEMORY   -->|"loads at session start"| AGENTS
  DESIGN   -->|"approved → promoted"| CTX
  AGENTS   -->|"read before acting"| CTX
  CTX      -->|"guides output"| CONTENT
  AGENTS   -->|"invoke"| SKILLS
  BP & GI  -->|"drive"| CONTENT
  AGENTS   -->|"stage for review"| CONTENT
  CL       -->|"appends rule"| MEMORY

  %% ─── STYLES ──────────────────────────────────────────────
  classDef global   fill:#1B1F3B,color:#FAF8F4,stroke:#C9A84C
  classDef project  fill:#2d3561,color:#FAF8F4,stroke:#C9A84C
  classDef local    fill:#3d4a7a,color:#FAF8F4,stroke:#C9A84C
  classDef agent    fill:#C0392B,color:#FAF8F4,stroke:#8e1a0e
  classDef skill    fill:#7d1d10,color:#FAF8F4,stroke:#C0392B
  classDef human    fill:#C9A84C,color:#1B1F3B,stroke:#8a6e2a
  classDef ctx      fill:#2a5c3a,color:#FAF8F4,stroke:#4a9e6a
  classDef design   fill:#4a3a2a,color:#FAF8F4,stroke:#8a6a4a
  classDef content  fill:#1a3a4a,color:#FAF8F4,stroke:#4a8aaa

  class G global
  class P project
  class L local
  class PM,PJM,WD,WR agent
  class BP,GI,CL skill
  class EX,DEV human
  class CTX ctx
  class DESIGN design
  class CONTENT content
```

---

## Reading the Diagram

### Three zones to understand

**Memory layers (top-left blue)** — Claude reads these files automatically at the start of every session, in order from global to local. Think of them as nested briefing documents: the outer layer sets universal rules, the middle layer sets project rules, the inner layer sets your personal notes.

**Agents (red)** — Each agent is a specialist. The Product Manager handles ideas and strategy. The Project Manager handles delivery and risk. The Web Developer turns approved drafts into web pages. The Writer produces blog content. No agent acts without reading its own persona first.

**Content lifecycle (bottom-centre)** — An idea becomes a draft in `content/`, gets human review, is built into a page by the Web Developer agent, and is published to the website. The publish log records every step.

### The two most important flows

**Design → Context promotion:** New ideas and proposals go into `design/` first. They are not instructions — they are proposals. Only after human approval do they move into `context/`, where agents treat them as authoritative reference material. This prevents unreviewed plans from accidentally becoming agent behaviour.

**Continuous improvement loop:** When you confirm that a solution worked ("yes, perfect"), Claude automatically captures that as a new rule in CLAUDE.md. The rule is shown to you before it is written. Over time, the system gets smarter without you having to manually maintain it.

---

## The Golden Rule

> **`context/` = approved and active. `design/` = proposed and under review.**
>
> Nothing enters `context/` until a human has approved it.
> Nothing that is approved stays in `design/`.

---

*Overview version: 1.0 — Based on Mahjong Tarot project structure.*
