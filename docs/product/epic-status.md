# The Mahjong Tarot — Epic Status Dashboard

**Last updated:** 2026-04-29
**Phase in flight:** Phase 1 — Wedge

At-a-glance status for each epic. Update this file whenever a workstream opens, ships, or stalls.

Status glyphs: 🔄 in flight · ✅ done · ⏳ partially done · ☐ planned · 🛑 paused

---

## At a glance

| Epic | Status | % done (est) | Open bugs | Notes |
|---|---|---|---|---|
| [E1 · Daily Almanac](./epics.md#e1--daily-almanac) | ⏳ | 75% | 0 | Home page now leads with today's almanac (PR #158); voice review and D7 measurement still pending |
| [E2 · Find a Good Day](./epics.md#e2--find-a-good-day) | ⏳ | 75% | 0 | Public `/find-a-good-day` pages live with explanation copy, share buttons, and analytics (PR #160); OG image and `.ics` still missing |
| [E3 · Personal Pillar Layer](./epics.md#e3--personal-pillar-layer) | ☐ | 5% | 0 | Birth-data capture spec drafted; pillar engine not started |
| [E4 · Readings Catalogue](./epics.md#e4--readings-catalogue) | ☐ | 0% | 0 | Phase 5 |
| [E5 · Voice & Content Engine](./epics.md#e5--voice--content-engine) | 🔄 | 50% | 0 | Writer/designer/web-developer pipeline live; voice doc not written |
| [E6 · Founder Cohort & Subscription](./epics.md#e6--founder-cohort--subscription) | ☐ | 10% | 0 | Stripe wiring exists from earlier project; no founder tier yet |
| [E7 · Book Integration](./epics.md#e7--book-integration) | ☐ | 0% | 0 | Phase 6 |
| [E8 · 1-on-1 Practice Layer](./epics.md#e8--1-on-1-practice-layer) | ☐ | 5% | 0 | Bill's existing practice runs outside the product today |
| [E9 · Share & Acquisition Loop](./epics.md#e9--share--acquisition-loop) | ☐ | 5% | 0 | Paid test budget allocated for May 2026 |
| [E10 · Member Dashboard](./epics.md#e10--member-dashboard) | ⏳ | 30% | 0 | Dashboard route exists; layout does not yet match the 12-month shape |

Percent-done is an order-of-magnitude estimate (closer to 0/25/50/75/100 than to 47%). Use it to decide where attention goes, not to plan capacity.

---

## Drilldown

### E1 · Daily Almanac — ⏳ 75%

**What's done:** ~2,000 days of almanac data live in `public.almanac_days` through Feb 2032. Encoder pipeline (`docs/architecture/readings/daily-horoscopes/encoding/`) generates per-lunar-year SQL files. Day-officer, score, and pillar fields all populated. Home page now leads with today's almanac above the fold (`feat(home): lead with today's almanac (E1)` — PR #158). "Why this score?" expandable lives in `AlmanacView`.

**What's missing:** One-paragraph daily reading copy is not yet in our voice (depends on E5 voice doc). D7 return rate measurement and report card not yet wired (W1.3).

**Definition of done:** Logged-out home page shows today's almanac above the fold; reading copy passes voice review; D7 return rate ≥ 35%.

---

### E2 · Find a Good Day — ⏳ 75%

**What's done:** Public, indexable `/find-a-good-day` index page and `/find-a-good-day/<activity-slug>/<YYYY-MM-DD>` server-rendered result pages (ISR `revalidate: 86400`). Search UI extracted to a shared `components/AlmanacSearch.jsx` so the dashboard members view and the public marketing view share one source of truth. Result pages render a deterministic 3-to-5 sentence "why this date scores the way it does" explanation built in voice via `lib/explainScore.js`. Share affordances (Copy link, native Web Share API, X intent) plus three Vercel Analytics events feeding the wedge funnel: `e2_search_submitted`, `e2_result_viewed`, `e2_share_clicked` (PR #160).

**What's missing:** OG image generator for share previews (Block 4 stretch — deferred pending Vercel build budget review per `phase-01-wedge.md`). `.ics` calendar download. Free-text NLP step for prose-to-activity mapping. Pre-built top-N pages (e.g. `/find-a-good-day/get-married` redirecting to top-scoring date in the next 365 days). Filter by birth-pillar harmony (E3 dependency). Measurement of the success-criteria thresholds (≥ 500 unique users, ≥ 10% share rate) — depends on the May acquisition test.

**Definition of done:** ≥ 500 unique users hit the search by 2026-06-01; ≥ 10% of result pages are shared.

---

### E3 · Personal Pillar Layer — ☐ 5%

**What's done:** Spec for birth-data capture form drafted. Lunar-calendar lookup table exists in encoder data.

**What's missing:** Everything user-facing. Pillar computation engine. Integration with dashboard.

**Definition of done:** ≥ 60% of paid users have completed birth-data capture by phase 4 close.

---

### E4 · Readings Catalogue — ☐ 0%

Not started. Phase 5.

---

### E5 · Voice & Content Engine — 🔄 50%

**What's done:** writer / designer / web-developer / mahjong-studio agent pipeline is live and shipping content. Topic bundles in `content/topics/` flow through to published blog posts.

**What's missing:** Written voice doc that any contractor could write to. Daily horoscope content pipeline (currently we only ship blog posts, not daily almanac copy). Blind taste test rig.

**Definition of done:** Bill writes ≤ 20% of shipped daily content for 90 days running; blind taste ≥ 50/50.

---

### E6 · Founder Cohort & Subscription — ☐ 10%

**What's done:** Stripe SDK and webhook scaffolding (carried over from earlier project setup).

**What's missing:** Founder pricing tier. Onboarding that captures birth data + first reading. Founder-only email/feedback channels.

**Definition of done:** 100 founders converted by 2026-07-01; each has used the almanac search ≥ 3 times and completed ≥ 1 personal reading.

---

### E7 · Book Integration — ☐ 0%

Not started. Phase 6.

---

### E8 · 1-on-1 Practice Layer — ☐ 5%

**What's done:** Bill runs his practice today via email and Calendly outside the product.

**What's missing:** In-product booking, pre-session brief generation, cohort summary for Bill.

**Definition of done:** Bill's session prep drops from ~30 min to ≤ 10 min; session NPS ≥ 70.

---

### E9 · Share & Acquisition Loop — ☐ 5%

**What's done:** $2k paid-acquisition test budget allocated for May 2026.

**What's missing:** OG image generator, branded share cards, referral mechanic.

**Definition of done:** May test campaign achieves CTR ≥ 1.5% / conversion ≥ 0.5%; share loop ≥ 30% of paid signups by Q4 2026.

---

### E10 · Member Dashboard — ⏳ 30%

**What's done:** `/dashboard` route exists with placeholder content.

**What's missing:** Three-stack layout (almanac → personal → one-prompt). Notification rules. Recent-readings rail. Streak indicator.

**Definition of done:** ≥ 50% of paid members visit dashboard ≥ 5 days/week by Q4 2026.

---

## How to update this file

When an epic moves status (☐ → 🔄 → ⏳ → ✅), update the row in the table and the drilldown section. Do not delete drilldown sections for completed epics — leave them with the closing date so we keep institutional memory.
