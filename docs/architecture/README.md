# Architecture — Index

System design, data, and workflow documents. Move-overs from the old `documents/architecture/` and `architecture/` folders are listed below; new design docs live alongside.

---

## Plans

| Document | Purpose |
|---|---|
| [admin-crm-plan.md](./plans/admin-crm-plan.md) | Admin CRM build plan |
| [crm-design-doc.md](./plans/crm-design-doc.md) | CRM data model and surface design |
| [auto-publishing-architecture.md](./plans/auto-publishing-architecture.md) | Writer → designer → web-developer publish pipeline |
| [ai-agent-build-plan.docx](./plans/ai-agent-build-plan.docx) | AI agent build sequencing |
| [schedule-agents.md](./plans/schedule-agents.md) | Scheduled-task / cron agent design |
| [writer-agent-review.md](./plans/writer-agent-review.md) | Review of writer agent output quality |
| [bootstrap/INDEX.md](./plans/bootstrap/INDEX.md) | Local-environment bootstrap guides |

---

## Workflows

Diagrams and walkthroughs of how agents collaborate.

| Document | Purpose |
|---|---|
| [daily-standup-workflow.md](./workflows/daily-standup-workflow.md) | Daily check-in compile flow |
| [project-manager-workflow.html](./workflows/project-manager-workflow.html) | PM agent workflow diagram |
| [pm-workflow-diagram.html](./workflows/pm-workflow-diagram.html) | PM workflow visual |
| [org-chart.html](./workflows/org-chart.html) | Agent org chart |
| [image-designer-workflow.html](./workflows/image-designer-workflow.html) | Image generation pipeline |
| [writer-workflow.md](./workflows/writer-workflow.md) | Writer agent workflow |

---

## Readings — domain & data

Source-of-truth data for the almanac and reading engines.

- [`readings/daily-horoscopes/`](./readings/daily-horoscopes/) — almanac encoder, lunar calendar lookups, score rules, day-officer mapping
- [`readings/daily-horoscopes/encoding/`](./readings/daily-horoscopes/encoding/) — Python pipeline (`generate_almanac.py`, `pillars.py`, `signals.py`, `prose.py`)
- Reference Excel sources: `Almanac_Data.xlsx`, `[OCA] Yearly Horoscope 2011.xlsx`, `horoscope-Matrix.xls`, `horoscopeKeywords.xls`

The encoder generates JSON and SQL seed files for `public.almanac_days`. Per-lunar-year SQL files are split to ~540–590 KB to stay under the Supabase SQL Editor 1 MB limit.

---

## Templates

| Document | Purpose |
|---|---|
| [CLAUDE.template.md](./templates/CLAUDE.template.md) | Template for new project CLAUDE.md files |
| [claude-md-bootstrap.prompt.md](./templates/claude-md-bootstrap.prompt.md) | Prompt for bootstrapping a new CLAUDE.md |
| [settings.local.template.json](./templates/settings.local.template.json) | Local Claude settings template |

---

## What lives elsewhere

- **Operational engineering notes** (sprint handoffs, scope notes, change records) live in [`../engineering/`](../engineering/)
- **Per-feature design docs** live in [`../features/<feature>/`](../features/)
- **Product strategy and roadmap** live in [`../product/`](../product/)
- **Archived / superseded design** lives in [`../archive/`](../archive/) including `architecture-obsolete/`

If you are about to write a new architecture doc, ask first: is it really architecture, or is it a feature design? Feature designs go under `features/<feature>/system-design.md`.
