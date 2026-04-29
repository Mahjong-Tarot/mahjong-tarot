# The Mahjong Tarot — Progress Checklist

**Last updated:** 2026-04-28

A flat checklist of everything we have committed to ship in the next 90 days. Mirrors [`product.md`](./product.md) §9 but in trackable form. Update by ticking boxes — do not delete unticked items.

---

## Bet 1 — Wedge is provable (by 2026-06-01)

- [ ] Home page leads with today's almanac (not Bill's bio)
- [ ] Almanac search has been hit by ≥ 500 unique users
- [ ] D7 return rate is being measured and reported
- [ ] Decision recorded: continue / pause / re-examine, based on D7 number

---

## Bet 2 — Founder cohort is real (by 2026-07-01)

- [ ] Founder pricing tier ($49.50) is live in Stripe and on the site
- [ ] Onboarding captures birth data and routes to first reading
- [ ] 100 paying founder members converted
- [ ] Each founder has used almanac search ≥ 3 times
- [ ] Each founder has completed ≥ 1 personal reading
- [ ] Founder-only monthly email channel set up; first letter shipped

---

## Bet 3 — The voice is reproducible (by 2026-08-01)

- [ ] Voice doc written and reviewed by Bill
- [ ] Daily horoscope content has been live for 90 consecutive days
- [ ] Bill personally writes ≤ 20% of shipped daily content
- [ ] Blind taste test rig is built (10 paragraphs, mixed Bill/system)
- [ ] First blind taste test run; result ≥ 50/50

---

## Validation tests (kill-switch criteria from product.md §7)

These are the failure conditions that pause everything for a re-examination. Tick the box only if we observe the failure.

- [ ] **#1 audience reachability fails** — May $2k paid test returns CTR < 1.5% or conversion < 0.5%
- [ ] **#2 wedge fails** — by month 3 of phase 1, almanac cohort never opens any other reading
- [ ] **#3 voice fails** — content quality drops within two weeks of Bill stopping personal writing

If any box above is ticked, all unticked work above pauses until the team reconvenes on the assumption.

---

## Quality gates (every release)

- [ ] No regressions on home/dashboard/almanac flows
- [ ] No regressions on the publish pipeline (writer → designer → web-developer → git)
- [ ] No PII in client-side state, URLs, or logs (per `.claude/rules/global-engineering.md`)
- [ ] Build is clean, no TypeScript errors

---

## How to use this file

The product owner ticks boxes. AI agents do not tick boxes — they propose ticks via PR description. Untick if rolling back.

When the 90-day window closes (2026-08-01), archive this file under `docs/archive/` and start a fresh checklist for the next 90 days.
