# Phase 4 — Personal Layer

**Window:** August 2026 – Q1 2027
**Status:** ☐ Planned
**Validation gate:** Phases 1–3 must have passed their gates; D7 ≥ 30% sustained

---

## Goal

Personalised daily readings on the dashboard. By Q1 2027 close, a logged-in user lands on a single-screen dashboard showing today's almanac, her own day computed from her chart, and one prompt the system has noticed about her week.

This is the phase where the product becomes worth $49.50/month.

---

## Why this phase exists

Per [`product.md`](./product.md) §5, the 12-month shape is "almanac + personal layer + one thing to ask." Phases 1–3 build the almanac; Phase 4 builds the personal layer that justifies the subscription.

---

## Workstreams

### W4.1 — Pillar computation engine

- Year, month, day pillar computation from DOB (lunar conversion handled)
- Hour pillar if time provided; gracefully omitted if not
- Year-conflict / harmony flags against the current year (Fire Horse → next year)

**Owner:** TBD — likely a Python or TypeScript service co-located with `lib/almanac/`
**Definition of done:** Pillar values for a known seed user match the validated reference output (we have a reference set in `docs/architecture/readings/`).

---

### W4.2 — Personalised daily reading

- "Your day" copy generated from (today's pillars × user's pillars)
- Three tones depending on conflict/harmony: tailwind / neutral / friction
- Falls back to the impersonal almanac copy if pillar data missing

**Owner:** writer agent (with pillar inputs from W4.1)
**Definition of done:** Personalised copy ships for ≥ 95% of paid users with completed birth data; voice doc compliance verified.

---

### W4.3 — "One thing to ask" prompt

- A single weekly prompt surfaced on the dashboard
- Examples: "You haven't done a Three Blessings reading this season — it's a good day for it." / "Your year-conflict starts next month; here's how to think about it."
- Rule-based generation (not LLM open-ended) so we can audit and edit

**Owner:** product owner + writer
**Definition of done:** Prompt fires for ≥ 80% of weekly active users; clicked-through ≥ 25%.

---

### W4.4 — Dashboard layout v2

- Three-stack: almanac top → personal middle → one-prompt bottom
- Recent-readings rail
- Subtle vocabulary-learned counter (how many words they've encountered in the system)

**Owner:** designer + web-developer agents
**Definition of done:** ≥ 50% of paid members visit the dashboard ≥ 5 days/week.

---

## What's explicitly out of scope this phase

- Compatibility readings (Phase 5)
- Mobile native app (out of scope indefinitely; PWA-only)
- Open-ended chat with the system (never)

---

## Risks

- Pillar computation correctness — a wrong year-pillar undermines trust permanently. Validation against a known reference set (Bill's own clients' charts) is non-negotiable.
- "One thing to ask" feels gimmicky if rules are too generic — Bill must hand-author the rule library for the first 6 months.

---

## Exit criteria → Phase 5

- ≥ 60% of paid users have birth data captured
- Pillar engine validated against ≥ 50 reference charts
- Personalised reading shipping daily for ≥ 4 weeks
- Dashboard layout v2 live and meeting return-rate target
