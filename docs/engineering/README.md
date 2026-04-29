# Engineering — Index

Operational engineering material: sprint handoffs, change records, gap analyses, and bootstrap prompts.

---

## Changes

Each significant change delivered via a `dev-loop`-style workflow produces a dated subfolder under [`changes/`](./changes/) containing:

- `PLAN.md` — what we set out to build and why
- `CHANGELOG.md` — what actually shipped
- `QA_REPORT.md` — how we verified it
- `EXECUTIVE_SUMMARY.md` — one-paragraph what-and-why for stakeholders

Convention: `changes/YYYY-MM-DD-short-slug/`. Place a `.gitkeep` in `changes/` while empty.

---

## Sprints

| Document | Purpose |
|---|---|
| _(none yet — first sprint handoff will appear here)_ | |

Each sprint produces a handoff doc named `sprints/YYYY-MM-DD-handoff.md` summarising what shipped, what was blocked, and recommended next steps.

---

## Prompts

Setup and bootstrap prompts that have been used to scaffold agents and skills.

| Document | Purpose |
|---|---|
| [01-setup-project-manager.md](./prompts/01-setup-project-manager.md) | Initial PM agent setup |
| [02-setup-daily-checkin-skill.md](./prompts/02-setup-daily-checkin-skill.md) | Daily check-in skill setup |
| [03-setup-triggers.md](./prompts/03-setup-triggers.md) | Trigger / hook setup |

These are historical artifacts. Update them when we re-run the corresponding setup; do not delete them.

---

## Gap analyses

Periodic comparisons of intended state vs. actual state. Each analysis produces an action list and a dated note.

| Document | Purpose |
|---|---|
| _(none yet)_ | |

Convention: `YYYY-MM-DD-gap-analysis.md`.

---

## What lives elsewhere

- Architecture and system design → [`../architecture/`](../architecture/)
- Product strategy and roadmap → [`../product/`](../product/)
- Per-feature proposals → [`../features/`](../features/)
- QA plan and regression reports → [`../qa/`](../qa/)
