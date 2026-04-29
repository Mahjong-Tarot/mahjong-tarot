# Phase 5 — Readings Depth

**Window:** Q1–Q2 2027
**Status:** ☐ Planned
**Validation gate:** Phase 4 personal layer live and meeting return-rate target

---

## Goal

The readings catalogue. By Q2 2027 close, paid members have access to Purple Star (Zi Wei Dou Shu), Three Blessings, and Compatibility readings, and ≥ 70% have completed at least one within 14 days of signup.

Readings turn the daily ritual into *occasions*. They are what someone returns for monthly, not daily.

---

## Why this phase exists

Per [`product.md`](./product.md) §5, "she goes deeper because the system gradually unlocks her own chart." The personal layer (Phase 4) is the daily layer; the readings catalogue is the deeper layer. Without it, the product plateaus.

---

## Workstreams

### W5.1 — Purple Star (Zi Wei Dou Shu) reading

- Chart construction from birth data
- 12-palace interpretation engine
- Member-facing reading with chart visualisation and palace-by-palace narrative
- Static reference content explaining Purple Star to a curious newcomer

**Owner:** Bill (subject expert) + web-developer agent
**Definition of done:** Generated Purple Star matches Bill's hand-constructed reading for ≥ 95% of test charts.

---

### W5.2 — Three Blessings reading

- Inputs: birth data + question framing
- Output: a three-card-style structured reading (Heaven / Earth / Person)
- Generated narrative passes voice review

**Owner:** Bill + writer agent
**Definition of done:** First 50 Three Blessings readings shipped with ≥ 4-star average rating (1-5 in-product).

---

### W5.3 — Compatibility reading

- Two charts side-by-side
- Highlights of harmony and friction with explicit framing ("this is information, not prediction")
- Share-able artifact — branded card with anonymised summary

**Owner:** Bill + writer agent + designer agent
**Definition of done:** ≥ 30% of paid members share a compatibility result.

---

### W5.4 — "What this reading is and is not" copy

- A single short-essay written by Bill that lives on every reading page
- Sets the framing: probabilistic, not predictive; structural, not personal

**Owner:** Bill
**Definition of done:** Live on Purple Star, Three Blessings, and Compatibility pages.

---

## What's explicitly out of scope this phase

- Tarot card readings (different vocabulary, not our audience)
- AI-generated free-form readings (never)
- Subscription tier with reading-by-reading purchase (out of scope indefinitely; readings are bundled)

---

## Risks

- Purple Star is a deep system — a wrong palace assignment damages credibility permanently. Validation against Bill's hand-constructed reference charts is essential.
- Compatibility readings can drift toward "are we right for each other?" predictive framing. The §5.4 copy is the guardrail.

---

## Exit criteria → Phase 6

- All three readings shipping
- ≥ 70% of paid members have completed ≥ 1 reading within 14 days of signup
- Reading-led NPS ≥ 60
