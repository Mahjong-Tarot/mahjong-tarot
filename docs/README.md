# The Mahjong Tarot — Documentation Index

**Project:** The Mahjong Tarot (mahjongtarot.com)
**Stack:** Next.js (Pages Router) · React · Supabase · Vercel
**Practitioner:** Bill Hajdu
**Owner:** Dave Hajdu
**Last updated:** 2026-04-28

> **Visual dashboard:** [`project-status.html`](./project-status.html) — open in a browser for a navigable view of the headline docs.

---

## Product

High-level product vision, ten thematic epics, status dashboard, and the phased roadmap. Start with `product.md`.

| Document | Contents |
|---|---|
| [Product](./product/product.md) | **Step-back vision (Dan Shipper frame).** Audience, the wedge, twelve-month shape, three load-bearing assumptions, the next 90 days. |
| [Product Overview](./product/00-product-overview.md) | One-page exec brief — audience, JTBD, wedge, the two metrics. |
| [Product Timeline](./product/01-product-timeline.md) | Six-phase roadmap with goals and validation gates per phase. |
| [Epics](./product/epics.md) | **Ten thematic epics.** Each with thesis, bundle, mechanism, success criterion. |
| [Epic Status](./product/epic-status.md) | **At-a-glance dashboard** — pipeline glyphs, % estimate, open/closed bug counts per epic. |
| [Progress Checklist](./product/progress-checklist.md) | Trackable checklist for the next 90 days (Bets 1–3 from `product.md` §9). |
| [Phase 1 — Wedge](./product/phase-01-wedge.md) | Almanac on home page, "Find a Good Day" search, D7 measurement 🔄 |
| [Phase 2 — Founder Cohort](./product/phase-02-founder-cohort.md) | 100 paying founders, paid acquisition test, founder feedback channel |
| [Phase 3 — Voice Engine](./product/phase-03-voice-engine.md) | Voice doc, daily content pipeline, blind taste rig, contractor handoff |
| [Phase 4 — Personal Layer](./product/phase-04-personal-layer.md) | Pillar engine, personalised daily reading, "one thing to ask" prompt |
| [Phase 5 — Readings Depth](./product/phase-05-readings-depth.md) | Purple Star, Three Blessings, Compatibility |
| [Phase 6 — Book + 1-on-1](./product/phase-06-book-and-practice.md) | Digital book reader, in-product 1-on-1 booking, share-loop maturation |

---

## Architecture

System design, data, and workflow documents.

| Document | Contents |
|---|---|
| [Architecture Index](./architecture/README.md) | Map of plans, workflows, readings data, and templates |
| [`architecture/plans/`](./architecture/plans/) | Build plans — admin CRM, auto-publishing, AI agents, bootstrap |
| [`architecture/workflows/`](./architecture/workflows/) | Agent workflow diagrams and walkthroughs |
| [`architecture/readings/`](./architecture/readings/) | Almanac encoder, lunar-calendar lookups, score and day-officer rules |
| [`architecture/templates/`](./architecture/templates/) | CLAUDE.md templates, settings templates, bootstrap prompts |

---

## Engineering

Operational engineering material — sprint handoffs, change records, gap analyses, setup prompts.

| Document | Contents |
|---|---|
| [Engineering Index](./engineering/README.md) | Conventions for changes, sprints, prompts, gap analyses |
| [`engineering/changes/`](./engineering/changes/) | Per-change subfolders (PLAN, CHANGELOG, QA_REPORT, EXEC_SUMMARY) — first change pending |
| [`engineering/sprints/`](./engineering/sprints/) | Sprint handoffs — first handoff pending |
| [`engineering/prompts/`](./engineering/prompts/) | Setup prompts (PM agent, daily check-in skill, triggers) |

---

## Features

Per-feature proposals and design docs. Folder convention is `features/<slug>/feature-proposal.md` first; `system-design.md` and `database-design.md` follow once approved.

| Document | Contents |
|---|---|
| [Features Index](./features/README.md) | Convention, active features (none yet) |

---

## QA

Quality plan, regression reports, and test findings.

| Document | Contents |
|---|---|
| [QA Plan](./qa/qa-plan.md) | **Forever QA plan** — 8-tier pyramid, voice review, reference-chart audit, cold-reader walkthroughs, strategy revisit cadence |
| _Regression reports_ | First report pending; convention is `qa/YYYY-MM-DD-qa-report.md` |

---

## Brand

Brand assets — palette, voice, imagery library.

| Document | Contents |
|---|---|
| [Brand Index](./brand/README.md) | Palette, logo notes, voice principles, image-library pointer |

The voice doc (`brand/voice.md`) is a Phase 3 deliverable.

---

## Archive

Historical and superseded material. Kept for reference; do not rely on without re-checking against current docs.

| Folder | Contents |
|---|---|
| [`archive/architecture-obsolete/`](./archive/architecture-obsolete/) | Older architecture and prompt drafts, replaced by current `architecture/` content |
| [`archive/marketing/`](./archive/marketing/) | Legacy customer lists, OCA spreadsheets, customer email exports, quote-background PNG library |

---

## How to use this index

- New to the project? Read [`product/product.md`](./product/product.md), then [`product/01-product-timeline.md`](./product/01-product-timeline.md), then come back here.
- Looking for current status? Open [`project-status.html`](./project-status.html) in a browser, or read [`product/epic-status.md`](./product/epic-status.md).
- Starting work on a feature? Read [`features/README.md`](./features/README.md) for the convention before creating files.
- Adding architecture material? Read [`architecture/README.md`](./architecture/README.md) — and ask whether it's really architecture vs. a feature design.
