# The Mahjong Tarot — Epic Status Dashboard

**Last updated:** 2026-04-28
**Phase in flight:** Phase 1 — Wedge

At-a-glance status for each epic. Update this file whenever a workstream opens, ships, or stalls.

Status glyphs: 🔄 in flight · ✅ done · ⏳ partially done · ☐ planned · 🛑 paused

---

## At a glance

| Epic | Status | % done (est) | Open bugs | Notes |
|---|---|---|---|---|
| [E1 · Daily Almanac](./epics.md#e1--daily-almanac) | ⏳ | 60% | 0 | Almanac data through Feb 2032 in DB; home page does not yet lead with it |
| [E2 · Find a Good Day](./epics.md#e2--find-a-good-day) | ⏳ | 40% | 0 | Search prototype exists; share-able artifact missing |
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

### E1 · Daily Almanac — ⏳ 60%

**What's done:** ~2,000 days of almanac data live in `public.almanac_days` through Feb 2032. Encoder pipeline (`docs/architecture/readings/daily-horoscopes/encoding/`) generates per-lunar-year SQL files. Day-officer, score, and pillar fields all populated.

**What's missing:** Home page does not lead with today's almanac (currently leads with Bill's bio). One-paragraph reading copy is not yet in our voice. "Why this score?" expandable does not exist.

**Definition of done:** Logged-out home page shows today's almanac above the fold; reading copy passes voice review; D7 return rate ≥ 35%.

---

### E2 · Find a Good Day — ⏳ 40%

**What's done:** Free-text query → activity-rule mapping prototype exists. Date scoring algorithm runs in development.

**What's missing:** Share-able artifact (OG image / screenshot card). Calendar download (.ics). Result page polish.

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
