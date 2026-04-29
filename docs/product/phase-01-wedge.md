# Phase 1 — Wedge

**Window:** May 2026
**Status:** 🔄 In flight
**Validation gate:** D7 almanac return rate ≥ 20% (kill-switch if lower)

---

## Goal

Prove the almanac is a wedge, not a niche. Make today's almanac the front door of the product, get ≥ 500 unique users into the "Find a Good Day" search, and report a real D7 return number for the first time.

If D7 is below 20% by the end of May, **stop and re-examine** the thesis before doing anything else. Do not start Phase 2 until the gate passes.

---

## Why this phase exists

Per [`product.md`](./product.md) §9, Bet 1 is "wedge is provable." Without this, every later phase is built on a hope. This phase is the cheapest way to falsify assumption #2 (almanac is a wedge).

---

## Workstreams

### W1.1 — Home page leads with the almanac

- Move Bill's bio below the fold
- Top of page: today's date, day-officer, score, one-paragraph reading
- Yesterday/tomorrow chevrons for casual browsing
- Mobile layout reviewed on three devices

**Owner:** web-developer agent
**Definition of done:** Logged-out home page renders today's almanac above the fold on iPhone 13, Pixel 7, and a 1280-wide laptop.

---

### W1.2 — "Find a Good Day" search

- Free-text query box with three example prompts
- Result page with explanation of why those days score well
- OG image generator for share-able artifacts

**Owner:** web-developer agent + writer (for explanation copy)
**Definition of done:** ≥ 500 unique users have hit the search by 2026-06-01; ≥ 10% of result pages are shared (download, link copy, or screenshot detected via OG fetch).

---

### W1.3 — D7 return measurement

- Analytics event for `/dashboard/almanac` first visit
- Cohort definition: any user whose first visit was in week N
- Report card: D7 = % of week-N cohort returning ≥ 3 times in week N+1

**Owner:** Dave Hajdu
**Definition of done:** Weekly Friday report lands in Lark with the latest D7 number and trend.

---

## What's explicitly out of scope this phase

- Birth-data capture (Phase 4)
- Personal-layer readings (Phase 5)
- Founder pricing tier (Phase 2 — overlaps but separate)
- Book integration (Phase 6)

If a feature would fit in any of those phases, it is not Phase 1 work.

---

## Risks

- Almanac data through Feb 2032 is in DB but the lunar-2026 portion has gaps. Audit before launch.
- Voice for the daily reading is not yet codified (Phase 3 work). Bill writes the first 30 days personally to set the tone.
- "Find a Good Day" sharing relies on OG image generation — needs Vercel build budget review.

---

## Exit criteria → Phase 2

- D7 return rate ≥ 20% (target 35%; gate is 20%)
- ≥ 500 unique search users
- Founder-tier wiring drafted and reviewed (so Phase 2 can move on day one)
