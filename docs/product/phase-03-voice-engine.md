# Phase 3 — Voice Engine

**Window:** May–August 2026 (parallel with Phases 1 and 2)
**Status:** ☐ Planned
**Validation gate:** Blind taste test ≥ 50/50 by 2026-08-01 (kill-switch if not)

---

## Goal

A reproducible voice. By 2026-08-01, daily horoscope content has been live for 90 consecutive days, Bill personally writes ≤ 20% of shipped daily content, and a blind taste test (10 paragraphs, 5 by Bill, 5 by the system) is at least 50/50 indistinguishable to a member.

---

## Why this phase exists

Per [`product.md`](./product.md) §7 assumption #3, "Bill scales as a brand without being the bottleneck." This is the most existentially dangerous of the three assumptions because content quality is what the audience signed up for. If we cannot reproduce Bill's voice, we cannot scale.

---

## Workstreams

### W3.1 — Written voice doc

- Voice principles: probabilistic framing, intelligent, no em-dashes, no hedging, no occult vocabulary unless required, no exclamation points
- Three before/after examples per principle
- A "voice clinic" — five paragraphs that violate principles, with corrected versions

**Owner:** Bill + writer agent
**Definition of done:** Voice doc lives at `docs/brand/voice.md`; reviewed and signed off by Bill.

---

### W3.2 — Daily horoscope content pipeline

- Topic generation cadence: every Sunday for the coming week (12 signs × 7 days = 84 paragraphs)
- writer agent generates from voice doc + day-pillar data + sign chart
- designer + web-developer agents publish via existing pipeline (`mahjong-studio`)
- Bill reviews ≤ 1 hour/week

**Owner:** writer / designer / web-developer agents (existing pipeline)
**Definition of done:** 84 paragraphs ship every Monday for 12 consecutive weeks without Bill's intervention beyond review.

---

### W3.3 — Blind taste test rig

- A page (member-only) that shows 10 unlabelled paragraphs (5 Bill, 5 system, randomised)
- Reader picks "human" or "machine" for each
- Aggregate accuracy reported to Bill weekly

**Owner:** web-developer agent
**Definition of done:** First weekly report ≥ 50/50 (random-chance equivalent); sustained for 4 consecutive weeks.

---

### W3.4 — Contractor handoff

- A single "if Bill steps away for a month, who writes?" plan
- Contractor brief that points only at the voice doc
- One-week trial run with content reviewed against the voice doc (not against "Bill would say it this way")

**Owner:** Dave Hajdu
**Definition of done:** Contractor's first week passes voice review without Bill's input.

---

## What's explicitly out of scope this phase

- Open-ended AI chatbot (never)
- Long-form content (essays, book chapters) — Phase 6
- Generated reading interpretations for personal readings — Phase 5

---

## Risks

- Voice drift over 90 days — second-half paragraphs creep toward generic horoscope tone. Mitigation: weekly blind taste test catches drift early.
- Bill becomes the bottleneck for review — if review is the new write, we have not solved the problem. Phase 3 succeeds when review is < 1 hour/week.

---

## Exit criteria → Phase 4

- Blind taste ≥ 50/50 sustained 4 weeks
- 90 days of daily content shipped on schedule
- Voice doc signed off and externally usable
- Contractor trial passed
