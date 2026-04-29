# The Mahjong Tarot — Forever QA Plan

**Last updated:** 2026-04-28

A web-app testing plan organised as a tiered pyramid. Tier 1 runs on every commit; Tier 8 runs at most quarterly.

For the validation gates that decide whether a phase ships, see [`../product/01-product-timeline.md`](../product/01-product-timeline.md).

---

## Why QA is different for this product

This is a content-first product whose value lives in the voice of the daily reading, the correctness of pillar computations, and the trustworthiness of the almanac. A bug that ships a wrong day-officer or a paragraph that breaks voice does more damage than a bug that crashes a page. Standard web-app QA catches the second; this plan exists to catch the first.

---

## The pyramid

| Tier | What it covers | Cadence | Who runs it |
|---|---|---|---|
| 1 — Build & types | TypeScript, ESLint, build success | Every commit | CI |
| 2 — Unit | Pure-function tests (pillar math, day-officer rules, score rules) | Every commit | CI |
| 3 — Integration | Server actions, Supabase reads/writes, Stripe webhook | Every PR | CI |
| 4 — End-to-end smoke | Playwright run of golden paths (home → almanac → search → result) | Every PR | CI |
| 5 — Voice review | Sample of last week's daily content vs. voice doc | Weekly | Bill (≤ 30 min) |
| 6 — Reference-chart audit | Pillar engine outputs vs. Bill's hand-constructed reference set | Each release in Phase 4+ | Bill |
| 7 — Cold reader walkthrough | Someone who has never seen the product walks through onboarding | Once per sprint | Founder cohort volunteer |
| 8 — Strategy revisit | Re-read `product.md` against actual usage | Quarterly | Dave + Bill |

---

## Tier 1 — Build & types

**Trigger:** every commit.

- `pnpm build` (or `npm run build` in the website workspace)
- `pnpm lint`
- TypeScript `noEmit` check

If Tier 1 fails, no PR merges. No exceptions.

---

## Tier 2 — Unit tests

**Trigger:** every commit.

Cover the pure-function layer:

- `lib/almanac/day-officer.ts` rules
- `lib/almanac/score.ts` for known reference dates
- `lib/pillars/*.ts` (Phase 4 onward)
- Activity-rule mapping for "Find a Good Day"

Tests live in `website/__tests__/` mirroring the lib structure. Use Vitest.

---

## Tier 3 — Integration

**Trigger:** every PR.

- Stripe webhook signature verification (replay a known test event)
- Supabase reads/writes via the test schema
- Server actions return typed result objects (no thrown errors)

---

## Tier 4 — End-to-end smoke

**Trigger:** every PR.

Playwright suite covering:

1. Home → today's almanac visible above the fold
2. Home → "Find a Good Day" search → result page renders
3. (Phase 2+) Sign up → Stripe checkout → birth-data capture → first reading
4. (Phase 4+) Logged-in dashboard renders three-stack layout

Lives in `website/tests/e2e/`. Uses the `webapp-testing` skill for browser orchestration.

---

## Tier 5 — Voice review

**Trigger:** weekly (Friday).

Bill reads a sample of the last week's daily content (10 paragraphs randomised across signs and dates) against the voice doc. He flags any paragraph that feels "off" with a one-word reason: *generic / hedging / em-dash / occult / overclaim*.

The blind taste test rig (Phase 3 W3.3) reports the latest score in the same review.

---

## Tier 6 — Reference-chart audit

**Trigger:** every release that touches the pillar engine (Phase 4 onward).

Bill maintains a reference set of ≥ 50 hand-constructed charts. Each release runs the engine against the full set and reports:

- Charts where output differs from reference
- For each diff, whether the reference is wrong, the engine is wrong, or there is a tie-breaking convention to document

A release that produces > 1 unexplained diff does not ship.

---

## Tier 7 — Cold reader walkthrough

**Trigger:** once per sprint (every 2 weeks).

A founder-cohort volunteer (rotated) walks through a defined flow cold while Dave watches. The volunteer narrates what they think is happening, what they expect next, and where they get confused.

Defined flows by phase:

- Phase 1: home → "Find a Good Day" → screenshot result
- Phase 2: signup → first reading
- Phase 4: dashboard → personal layer interpretation
- Phase 5: complete a Compatibility reading

Findings are written to `docs/qa/cold-reader-YYYY-MM-DD.md` and triaged in the next planning session.

---

## Tier 8 — Strategy revisit

**Trigger:** quarterly.

Re-read [`../product/product.md`](../product/product.md) cold. Ask three questions:

1. Is the bet still the bet?
2. Are the two metrics (D7 return, M6 paid retention) still the right ones?
3. Has the audience definition shifted? Should it?

If any answer is "no" or "I'm not sure," halt all forward work for one week and re-write the strategy doc.

---

## Quality gates

Before any PR merges:

- [ ] Tier 1 passes (CI)
- [ ] Tier 2 passes (CI)
- [ ] Tier 3 passes (CI)
- [ ] Tier 4 passes (CI)
- [ ] PR description names the epic + workstream the change belongs to
- [ ] No PII in client-side state, URLs, or logs (per `.claude/rules/global-engineering.md`)
- [ ] No hard-coded secrets or API keys

Before any release in Phase 4+:

- [ ] Tier 5 latest week reviewed
- [ ] Tier 6 reference-chart audit passes if the engine was touched
- [ ] Tier 7 latest cold-reader walkthrough findings triaged

---

## Regression reports

Each significant manual QA pass produces a dated report at `docs/qa/YYYY-MM-DD-qa-report.md`. The first such report sets the format; subsequent reports follow it.
