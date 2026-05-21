# Live Consultation Prep — Stakeholder Spec

**Status:** Draft v0.3 — for stakeholder review
**Date:** 2026-05-20
**Author:** Yon (with Claude)
**For:** Dave Hajdu, Bill Hajdu

> **What changed in v0.3:** scope collapsed back to a single purpose
> — an internal prep tool for live Zoom consultations. No customer-
> facing pages, no payments, no new reading content. Just aggregate
> the readings the site already computes for that customer into one
> view so Bill walks into every call armed with the data.

---

## TL;DR

A new page inside the portal that gives Bill (or an admin assisting
him) a **single dossier per client** — all the readings the site
already produces, computed for that client's birth data, on one
screen, ready to reference during a live Zoom Mahjong Mirror
consultation.

- No new content types
- No customer-facing pages
- No payments / Stripe
- No new third-party services
- Reuses every reading library the site already ships

Bill goes into the call armed. That's it.

---

## 1. Why we need it

Right now, when Bill takes a live Zoom call for a Mahjong Mirror
reading, he has to:

1. Open the Bazi calculator separately and re-enter the client's
   birth info
2. Pull up the day's almanac in another browser tab
3. Look up the client's horoscope sign manually
4. Run the Zi Wei chart on a different tool
5. Keep a paper notebook nearby for live notes

**Result**: he's flipping between five surfaces during the call,
each requiring re-entering birth data. That's friction, error-prone,
and unprofessional during a paid consultation.

What he needs is **one button** on the client's profile: **"Prep for
consultation"** → opens a single page with everything the site
already computes for that client, organised for live reference.

---

## 2. What the site already computes

The website already has libraries that produce structured readings
from birth data. We're not adding any new readings — we're just
surfacing the ones we have:

| Library | What it produces | Currently used on |
|---|---|---|
| `lib/bazi.js` | Four Pillars chart, element tally, dominant element | `/profile`, `/dashboard` |
| `lib/purpleStar.js` | Zi Wei Dou Shu chart (12 palaces, Big Limit, stars) | `/dashboard` |
| `lib/almanac.js` | Chinese almanac for any date (lucky/unlucky activities, gods, branches) | `/almanac/[date]` |
| `lib/horoscopes.js` | Daily horoscope by sign | `/horoscopes/[date]` |
| `lib/three-blessings.js` | Three Blessings reading | `/dashboard/three-blessings` |
| Find-a-good-day | Activity-based date matching | `/find-a-good-day/...` |

All of these run today. The prep tool pulls them together for one
specific client + date.

---

## 3. Scope

### In scope for v1

- New page **`/portal/clients/[id]/prep`** — the dossier view for
  one client
- Quick-entry button **"Prep for consultation"** on:
  - The client profile page (`/portal/clients/[id]`)
  - Each upcoming session row on the `/portal` dashboard
- The page displays, for that client + chosen consultation date:
  - **Bazi snapshot** — pillars table, element balance, dominant
    element, current Big Limit
  - **Zi Wei summary** — 12-palace map with the loudest stars in
    the current Big Limit highlighted
  - **Today's almanac** — for the meeting date — auspicious /
    inauspicious activities, day/branch info
  - **Daily horoscope** — for the client's zodiac sign, on the
    meeting date
  - **Three Blessings** — if applicable to their chart
  - **Last 3 sessions** — date, prep notes, post-call notes (so
    Bill remembers context from prior conversations)
  - **Live notes area** — free-form markdown editor for jotting
    during the call. Auto-saves every 5 seconds. Persisted on
    the session record so Bill can come back to it.
- **Meeting mode** toggle — collapses everything but the chart
  references + live notes into a full-screen layout for screen-
  sharing or split-screen during the call
- Accessible to **astrologer** and **admin** roles only

### Out of scope for v1

- Any customer-facing page or email
- Any Stripe / payment / paid reading product
- Any AI-drafted content
- PDF export
- Multi-client comparison views
- Forecasting beyond what `lib/horoscopes.js` already does
- New reading types beyond what the site already has

These are all good ideas. None of them are blocking the live-call
prep need today.

---

## 4. The dossier page in detail

### Route

`/portal/clients/[id]/prep` — accepts an optional `?date=YYYY-MM-DD`
query param. Defaults to today.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ← Sarah Chen   |   Prep for consultation on May 23, 2026    │
│                                          [Meeting mode →]    │
├─────────────────────────────────────────────────────────────┤
│ Birth: 1989-03-14 · 07:22 · San Francisco, CA · F · age 37  │
├──────────────────────┬──────────────────────────────────────┤
│ ░ Bazi snapshot       │ ░ Zi Wei summary                     │
│   [4 pillars]         │   [12 palaces, current Big Limit]    │
│   Element: Wood (5)   │   Loud stars: Hua Lu in Career…      │
│   Big Limit: Travel   │                                       │
├──────────────────────┴──────────────────────────────────────┤
│ ░ Today's almanac (May 23, 2026)                              │
│   Auspicious: marriage, travel, moving · Avoid: surgery       │
├─────────────────────────────────────────────────────────────┤
│ ░ Daily horoscope — Pisces                                    │
│   "A quietly transformative day…"                             │
├─────────────────────────────────────────────────────────────┤
│ ░ Last sessions                                               │
│   May 5  — "Career transition follow-up"                      │
│   Apr 18 — "Initial NYC move conversation"                    │
├─────────────────────────────────────────────────────────────┤
│ ░ Live notes                                                  │
│   [markdown editor, full-width, auto-saves]                   │
└─────────────────────────────────────────────────────────────┘
```

Each section is its own card. Bill can scroll through during prep.
During the call, he toggles **Meeting mode** for a tighter layout
focused on the chart cards + live notes.

### Date picker

A small date control in the header lets Bill change the consultation
date (relevant for the almanac and horoscope sections). Default:
today. If launched from a scheduled session, defaults to that
session's date.

### Live notes — persistence

Bill's notes auto-save to a new column on `public.sessions`:
**`prep_notes_live` (text, nullable)**. When launched from a
specific session, notes go to that session row. When launched
from a client profile without a session context, notes go to the
**most recent upcoming session for that client** (or get
discarded if there isn't one).

Existing `prep_notes` (pre-call) and `post_call_notes` stay as
they are.

---

## 5. Data model

### One migration: `020_session_prep_notes.sql`

```sql
alter table public.sessions
  add column if not exists prep_notes_live text;
```

That's it. No new tables, no new RLS policies (existing session
policies cover this).

---

## 6. Tech approach

### Reuse existing libraries

The page imports and calls:
- `calculatePillars()` from `lib/bazi.js`
- `tallyElements()`, `dominantElement()` from `lib/bazi.js`
- Whatever the Zi Wei + horoscope libs expose

All of this runs **client-side** in the browser. No new API routes
needed. No new server-side computation. The libraries already
support being called directly from React components (they do today
on `/dashboard`).

### Save endpoint for live notes

Reuses the existing `/api/portal/sessions/update` endpoint
(already shipping in PR #237). Just add `prep_notes_live` to the
whitelist of allowed fields. One-line change.

### Files to create / modify

| File | Change |
|---|---|
| `website/supabase/020_session_prep_notes.sql` | New migration |
| `website/pages/portal/clients/[id]/prep.jsx` | New page |
| `website/components/BaziSnapshotCard.jsx` | New — Bazi card |
| `website/components/ZiWeiSnapshotCard.jsx` | New — Zi Wei card |
| `website/components/AlmanacSnapshotCard.jsx` | New — almanac card |
| `website/components/HoroscopeSnapshotCard.jsx` | New — horoscope card |
| `website/components/RecentSessionsCard.jsx` | New — last 3 sessions list |
| `website/components/LiveNotesEditor.jsx` | New — markdown editor + auto-save |
| `website/styles/PortalPrep.module.css` | New |
| `website/pages/portal/clients/[id].jsx` | Add "Prep for consultation" button |
| `website/components/SessionsList.jsx` | Add "Prep" link on session cards |
| `website/pages/api/portal/sessions/update.js` | Add `prep_notes_live` to whitelist |

Total: 1 migration, 9 new files, 3 modifications.

---

## 7. Build plan (eng estimate)

| PR | Scope | Estimate |
|---|---|---|
| 1 | Migration + `prep_notes_live` whitelist + page scaffold (`/portal/clients/[id]/prep`) with empty cards | ~1 hr |
| 2 | BaziSnapshotCard + ZiWeiSnapshotCard (reusing existing libs) | ~1.5 hr |
| 3 | AlmanacSnapshotCard + HoroscopeSnapshotCard + date picker | ~1.5 hr |
| 4 | RecentSessionsCard + LiveNotesEditor with auto-save | ~1.5 hr |
| 5 | Quick-entry buttons from client profile + session cards + meeting mode | ~1 hr |

**Total: ~6–7 hours**. Splittable across 5 PRs. Each PR ships an
incrementally useful subset, so Bill can start using it after PR 1
even with empty cards.

---

## 8. Open questions for stakeholders

These need answers, but none of them are blocking — sensible
defaults exist for all:

1. **Default date for the dossier** — should it be today's date,
   or the date of the next upcoming session for that client?
   - Default proposal: **upcoming session's date** if any
     exists, otherwise today.
2. **Which Zi Wei detail to surface** — full 12-palace chart is
   visually busy. Show all 12, or just the 3–4 highlighted as
   "loud" for the current Big Limit?
   - Default proposal: **show all 12 in a small grid**,
     visually highlight the loud ones.
3. **Live notes during meeting mode** — should the auto-save
   interval be tighter (1s) for live calls so nothing is ever
   lost?
   - Default proposal: **5s auto-save** is fine for most cases;
     add a manual **Save** button as a backup.
4. **Three Blessings card** — always show, or only when chart
   has applicable signals?
   - Default proposal: **always show** — pulls visual weight
     even when there's not a strong signal.
5. **Mobile view** — does Bill ever do this on a phone (e.g.
   prepping in transit before opening the laptop)? Or
   desktop-only?
   - Default proposal: **desktop-primary**, mobile is best-effort
     readable but no special layout work.

---

## 9. Success criteria

After v1 ships:

- Bill opens **the prep page for at least one of every two upcoming
  sessions** in the first two weeks
- Bill uses **meeting mode at least once per week**
- **Zero re-entry of birth data** across multiple tools during a
  live session (this is the qualitative measure — ask Bill in
  retrospective)

---

## 10. Risks / mitigations

| Risk | Mitigation |
|---|---|
| Bill prefers his existing paper / scattered-tab workflow | Make the prep page genuinely faster + show real value. If after 2 weeks he's not using it, retire it cheaply. |
| Reading libraries don't output exactly the data the page needs | They already power the public site; we're just rearranging existing output. Low risk. |
| Auto-save during a live call fights Bill's typing | Use idle-debounce (only save once typing pauses 1s), not interval-based. |
| Bill's clients ask for a copy of the chart afterwards | Out of scope for v1 — but trivially addable later (PDF export, or "email this dossier" button). |

---

## 11. What this feature does NOT change

- The **scheduled session → transcript paste → polished report → send email** flow stays exactly as it is.
- No new customer-facing pages, no public site changes.
- No new external services, no new paid APIs, no Stripe.
- No changes to billing, subscriptions, or pricing.

---

## 12. Future ideas (explicitly out of v1)

Captured here so they aren't lost — none committed:

- **Email the dossier to the client** before / after the call as a
  professional artifact
- **PDF export** of the dossier
- **Multi-client comparison** (compatibility readings, family
  readings)
- **Customer-facing version** of this dossier as a paid product
  (this is the v0.2 "paid reading" spec — preserved in git
  history if we want to revisit)
- **AI-assisted talking points** generated from the chart data
- **Voice-to-text live note capture** during the Zoom call
- **Auto-templates** Bill writes himself — preset prompt formats

---

**Sign-off requested from:** Dave Hajdu + Bill Hajdu

**Next step after sign-off**: I draft a small file-level plan and
ship PR 1 (migration + page scaffold). Bill can start using even
the skeletal version immediately while I add cards in subsequent PRs.
