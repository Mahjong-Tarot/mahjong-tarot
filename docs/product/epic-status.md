# The Mahjong Tarot — Epic Status Dashboard

**Last updated:** 2026-05-07
**Phase in flight:** Phase 1 — Wedge

At-a-glance status for each epic. Update this file whenever a workstream opens, ships, or stalls.

Status glyphs: 🔄 in flight · ✅ done · ⏳ partially done · ☐ planned · 🛑 paused

---

## At a glance

| Epic | Status | % done (est) | Open bugs | Notes |
|---|---|---|---|---|
| [E1 · Daily Almanac](./epics.md#e1--daily-almanac) | 🔄 | 85% | 0 | **2026-05-07:** Home page leads with today's almanac above the fold (PR #158); data through Feb 2032 live. Remaining: reading copy in voice; "Why this score?" expandable. |
| [E2 · Find a Good Day](./epics.md#e2--find-a-good-day) | 🔄 | 80% | 0 | **2026-05-07:** Full feature shipped (PR #160) — search index, activity/date result page, `explainScore` helper. Remaining: share card; .ics download. |
| [E3 · Personal Pillar Layer](./epics.md#e3--personal-pillar-layer) | ☐ | 5% | 0 | Birth-data capture spec drafted; pillar engine not started |
| [E4 · Readings Catalogue](./epics.md#e4--readings-catalogue) | ☐ | 0% | 0 | Phase 5 |
| [E5 · Voice & Content Engine](./epics.md#e5--voice--content-engine) | 🔄 | 70% | 0 | Pipeline active; Kentucky Derby post + 6 images shipped; Brevo email agent skills landed (PR #170). Remaining: voice doc; daily almanac copy pipeline; blind taste rig. |
| [E6 · Founder Cohort & Subscription](./epics.md#e6--founder-cohort--subscription) | ☐ | 10% | 0 | Stripe wiring exists from earlier project; no founder tier yet |
| [E7 · Book Integration](./epics.md#e7--book-integration) | ☐ | 0% | 0 | Phase 6 |
| [E8 · 1-on-1 Practice Layer](./epics.md#e8--1-on-1-practice-layer) | ☐ | 5% | 0 | Bill's existing practice runs outside the product today |
| [E9 · Share & Acquisition Loop](./epics.md#e9--share--acquisition-loop) | ☐ | 5% | 0 | Paid test budget allocated for May 2026 |
| [E10 · Member Dashboard](./epics.md#e10--member-dashboard) | 🔄 | 70% | 0 | **2026-05-07:** Horoscope-first restructure shipped (PRs #167/168); all major sections rendering. Remaining: three-stack layout; notification rules; recent-readings rail. |

Percent-done is an order-of-magnitude estimate (closer to 0/25/50/75/100 than to 47%). Use it to decide where attention goes, not to plan capacity.

---

## Drilldown

### E1 · Daily Almanac — 🔄 85%

**What's done:** ~2,000 days of almanac data live in `public.almanac_days` through Feb 2032. Encoder pipeline (`docs/architecture/readings/daily-horoscopes/encoding/`) generates per-lunar-year SQL files. Day-officer, score, and pillar fields all populated.

**What's done (updated 2026-05-07, PR #158):** Home page now leads with today's almanac above the fold.

**What's missing:** One-paragraph reading copy in Bill's voice. "Why this score?" expandable panel. D7 return-rate instrumentation.

**Definition of done:** Logged-out home page shows today's almanac above the fold; reading copy passes voice review; D7 return rate ≥ 35%.

---

### E2 · Find a Good Day — 🔄 80%

**What's done:** **2026-05-07 (PR #160):** Full feature shipped — search index at `/find-a-good-day`, activity/date result page, `explainScore` helper.

**What's missing:** Share-able OG card. Calendar download (.ics).

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

### E5 · Voice & Content Engine — 🔄 70%

**What's done:** writer / designer / web-developer / mahjong-studio agent pipeline live. Topic bundles flow through to published blog posts. Generate-image skill producing hero + social images per post. **2026-05-05 to 2026-05-07:** "Kentucky Derby Fire Horse Year" post (PR #186); 6 hero + social images (PR #188); Brevo email agent skills (PR #170) — campaign draft, subscriber import, OCA reactivation sequence.

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

### E10 · Member Dashboard — 🔄 70%

**What's done:** `/dashboard` restructured horoscope-first (PRs #167/168) — Today → Month → Year → Pillars → Purple Star. MemberNav + design-token consistency pass. BaZi profile, compatibility calculator, Inner Circle, Three Blessings, and Purple Star all rendering. CI fix for daily horoscope workflow (PR #180).

**What's missing:** Three-stack layout (almanac → personal → one-prompt) at the top. Notification rules. Recent-readings rail. Streak indicator.

**Definition of done:** ≥ 50% of paid members visit dashboard ≥ 5 days/week by Q4 2026.

---

## How to update this file

When an epic moves status (☐ → 🔄 → ⏳ → ✅), update the row in the table and the drilldown section. Do not delete drilldown sections for completed epics — leave them with the closing date so we keep institutional memory.
