# Quick Reading Email Tool — Spec

**Status:** v0.5 — locked, ready to build
**Date:** 2026-05-20
**Author:** Yon (with Claude)
**For:** Dave Hajdu, Bill Hajdu

> **What changed in v0.5:** the two micro-decisions are answered:
> Chinese zodiac is primary (Western shown alongside),
> astrologer can override the consultation date (defaults to today).
> Spec is now locked for build.

---

## TL;DR

A single page inside the portal where Bill (or an admin) types in
a person's name + birth info, hits **Email**, and the readings the
site computes for that birth data land in his inbox (or any address
he specifies). That's it.

---

## 1. What it is

One page. One form. Two buttons.

```
┌────────────────────────────────────────────────────┐
│ Generate a reading                                  │
├────────────────────────────────────────────────────┤
│ Customer name        [ Sarah Chen          ]        │
│ Date of birth        [ 1989-03-14         ]         │
│ Time of birth        [ 07:22  ]  (optional)         │
│ Place of birth       [ San Francisco, CA  ] (opt)   │
│ Gender               [ Female ▾ ]  (optional)       │
│ Consultation date    [ 2026-05-20 ]  (default today)│
├────────────────────────────────────────────────────┤
│  [ Email to me ]    [ Email to another address ]    │
└────────────────────────────────────────────────────┘
```

**Email to me** → sends to the signed-in user's email address.
**Email to another address** → reveals an email input, sends there.

That's the entire UI.

---

## 2. What goes in the email

The same readings the public site already computes from a birth
date, rendered as one HTML email:

- **Bazi snapshot** — the 4 pillars, element tally, dominant
  element (from `lib/bazi.js`)
- **Zi Wei summary** — 12-palace chart (from `lib/purpleStar.js`)
- **Three Blessings** — if applicable (from `lib/three-blessings.js`)
- **Almanac for the consultation date** — auspicious / inauspicious
  activities (from `lib/almanac.js`)
- **Daily horoscope** — **Chinese zodiac (primary)** + Western
  zodiac, both shown side-by-side, for the consultation date
  (from `lib/horoscopes.js`)

All in one email, branded the same as the existing Mahjong Tarot
report emails. Bill reads it in his inbox, references during a
Zoom call, or forwards to whoever.

---

## 3. Scope

### In scope

- New page **`/portal/quick-reading`** with the form
- New API route **`/api/portal/quick-reading`**:
  1. Authenticates the caller (astrologer or admin)
  2. Validates the input
  3. Computes the readings server-side using the existing libraries
  4. Builds an HTML email with all sections
  5. Sends via Resend (already wired)
  6. Returns success
- A nav link or quick-action button on `/portal` so Bill can find it
- Email rendering uses the existing email template structure

### Out of scope

- Saving anything to the database (no new tables, no migrations)
- Client picker / linking to existing clients
- Public-facing pages
- Payments / Stripe
- PDF export
- Multi-recipient
- Scheduling future sends
- Anything else

---

## 4. Data model

**None.** Nothing is persisted. The form values are sent to the API,
the email goes out, and that's the end of it.

If we later want to log sends (for billing or analytics), one new
table or one new column. Not in v1.

---

## 5. Tech approach

### Server-side computation

The readings libraries (`bazi.js`, `purpleStar.js`, `almanac.js`,
`horoscopes.js`, `three-blessings.js`) currently run in the
browser. For the email, we want them to run **server-side** inside
the Next.js API route so we can build the HTML email body.

Two options for each library:
- **A**: It already works in Node (no DOM dependencies) → import and run directly.
- **B**: It has DOM / browser dependencies → call a tiny client-side helper that runs the computation, then POST the structured result to the email endpoint.

Default: import server-side. Drop to client-side computation if any lib doesn't behave.

### Email template

Reuse `buildEmailHtml()` pattern from
`pages/api/portal/reports/send.js`. New helper `buildQuickReadingEmail()`
that lays out the chart sections in cards inside the same shell.

### Files

| File | Status |
|---|---|
| `website/pages/portal/quick-reading.jsx` | New — the form |
| `website/pages/api/portal/quick-reading.js` | New — auth, compute, email |
| `website/lib/quickReading.js` | New — small wrapper that calls each lib and returns a structured object |
| `website/components/PortalNav.jsx` | Modified — add "Quick reading" link |
| `website/styles/PortalQuickReading.module.css` | New — minimal styling |

5 files. No migrations.

---

## 6. Build estimate

**One PR. ~2–3 hours of engineering.**

- ~30 min: form page + nav link
- ~45 min: API route + auth + Resend wiring
- ~60 min: server-side calls to each reading lib + HTML builder
- ~30 min: styling + smoke test

Ships same day as sign-off.

---

## 7. Locked decisions

1. **Horoscope**: show **Chinese zodiac as primary, Western
   alongside**. Both in the email.
2. **Consultation date**: form defaults to **today**, but
   astrologer can change it. Almanac and horoscope sections
   recompute for the chosen date.

---

## 8. Success criteria

- Bill emails himself a reading **at least once for every Mahjong
  Mirror call** in the first 2 weeks
- The email is **usable as-is during the call** without Bill
  flipping to other tabs

---

## 9. What this feature does NOT change

- The scheduled session → report → send flow stays as it is
- The `/profile` page, `/portal/clients`, `/portal/admin/conversions` —
  all unchanged
- No new external services

---

**Sign-off requested from:** Dave Hajdu + Bill Hajdu

**Next step after sign-off**: I write the PR. ~2–3 hours, single
commit, single merge, ship same day.
