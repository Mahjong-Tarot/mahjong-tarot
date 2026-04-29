# Phase 2 — Founder Cohort

**Window:** May–July 2026 (overlaps with Phase 1)
**Status:** ☐ Planned
**Validation gate:** May $2k paid test achieves CTR ≥ 1.5% and conversion ≥ 0.5% (kill-switch if both lower)

---

## Goal

100 paying founder members at $49.50 by 2026-07-01. Each one has used the almanac search ≥ 3 times and completed ≥ 1 personal reading. Each has an email address Bill can write to monthly.

The founder cohort is **not a revenue line**. It is the source of every product decision for the next 12 months.

---

## Why this phase exists

Per [`product.md`](./product.md) §7 assumption #1, the audience may exist but not be reachable at price. The May $2k Meta + Reddit test falsifies (or doesn't) that assumption. Per §9 Bet 2, founder count is the trailing measure of fit.

---

## Workstreams

### W2.1 — Founder pricing tier

- Stripe price for $49.50 monthly (or $495 annual — TBD with Bill)
- Visible-on-the-site founder pricing component with countdown to "first 100" close
- Webhook handling for new subscriptions, idempotent

**Owner:** web-developer agent
**Definition of done:** A new signup at $49.50 is reflected as a `founder` row in Supabase within 30 seconds of payment.

---

### W2.2 — Founder onboarding flow

- Birth-data capture (DOB, time, place — time optional)
- Routes the new founder to their first personal reading immediately
- Welcome email from Bill (one-paragraph, hand-written tone)

**Owner:** web-developer agent + writer (for welcome email)
**Definition of done:** New founder receives welcome email within 5 minutes of signup; first reading completion rate ≥ 70% within 14 days.

---

### W2.3 — Paid acquisition test

- $2k budget split Meta / Reddit / one-shot newsletter sponsorship
- Three creative variants per channel
- Tracking pixels and event-level attribution

**Owner:** Dave Hajdu
**Definition of done:** Test concludes by 2026-05-31 with CTR and conversion numbers reported in Lark.

---

### W2.4 — Founder-only feedback channel

- Monthly founder letter from Bill (Resend → segmented list)
- Open-ended Typeform survey, monthly cadence
- Direct reply-to address Bill personally reads

**Owner:** writer agent + Bill
**Definition of done:** First founder letter ships within 2 weeks of cohort cap closing.

---

## What's explicitly out of scope this phase

- Public/non-founder pricing tiers (Phase 3+)
- Compatibility readings (Phase 5)
- Book integration (Phase 6)

---

## Risks

- Stripe webhook reliability — single source of truth for `founder` status; needs idempotency.
- Founder pricing creates a perceived "ceiling" once filled — narrative around pricing post-100 is a Phase 3 conversation.
- Bill's personal involvement in founder letters — Phase 3 will codify the voice so contractors can write subsequent letters.

---

## Exit criteria → Phase 3 / Phase 4

- 100 founders converted with email + birth data
- Paid acquisition test result documented
- Funnel from `/find-a-good-day` → signup → reading completion measured end-to-end
