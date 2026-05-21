# Readings Generator — Stakeholder Spec

**Status:** Draft v0.1 — for stakeholder review
**Date:** 2026-05-20
**Author:** Yon (with Claude)
**For:** Dave Hajdu, Bill Hajdu

---

## TL;DR

A new page inside the portal where Bill or an admin can produce a reading
for **any customer** — existing client or one-off lead — and either keep
it on screen during a live call or email it directly to the recipient.

Today's portal flow assumes a scheduled session → recording → report.
This new feature unblocks every reading that *doesn't* fit that
shape: live calls Bill takes off-the-cuff, sampler readings for
prospects, gift readings for existing subscribers, ad-hoc requests
that come in by DM or email.

---

## 1. Why we need it

The current portal works beautifully for the "scheduled-session → polished
report" flow. But practice realities don't always fit:

1. **Bill takes a lot of calls off-the-cuff.** A friend, a referral, a
   curious DM — no session is scheduled, but Bill still wants a chart
   + structured talking points in front of him.
2. **Admins want a conversion lever that doesn't require Bill's calendar.**
   A short "sampler" reading sent to a warm lead is a high-leverage way
   to turn someone into a paying client. We can't ask Bill to record
   a session for every lead.
3. **Existing subscribers deserve delight.** A birthday reading, a
   year-ahead snapshot at New Year, a "what's this week look like" —
   small, frequent, automated-ish touches that strengthen the
   subscription.
4. **The system already has the charting libraries** (`iztro` for Zi Wei
   Dou Shu, `lunar-typescript` for Bazi/Four Pillars). They're powering
   the public horoscope pages. Reusing them for practitioner-facing
   readings is essentially free.

---

## 2. User stories

### Bill (practitioner)

1. *Mid-call*, Bill wants to pull up an existing client's chart, see
   their current Big Limit, and have a clean place to jot live notes.
2. *Pre-call*, Bill wants 5 minutes of structured prep — what's
   coming up in this client's Bazi this year, what's loud in their
   Zi Wei right now, last 3 sessions' themes.
3. *Post-call*, when a person reaches out wanting a quick reading
   without scheduling, Bill wants to put their birth info in,
   write a short reading, send it, done.

### Dave / Yon (operators)

1. As a follow-up to a "warm lead" identified in the Conversions
   dashboard, send the lead a free sampler reading — 200–400 words,
   chart-based — to convert them.
2. For an active subscriber, send a "year-ahead" reading on their
   birthday or at lunar new year — relationship maintenance.
3. Track which readings have been sent to whom, when, and whether
   they led to a session or subscription.

### Customer (recipient)

1. Receives a beautifully-formatted email reading.
2. Sees a clear next step at the bottom — book a full session, or
   subscribe for ongoing readings.

---

## 3. Scope

### In scope for v1

- New page **`/portal/readings`** (list of past readings) and
  **`/portal/readings/new`** (create a reading)
- Astrologer + admin can both access. No member access.
- Recipient picker: either an **existing client** (search the
  clients table) **or** a **one-off person** (enter name +
  email inline, no client record created unless Bill chooses)
- **Reading types** (start with 4, easy to add more later):
  - **Bazi snapshot** — Four Pillars from birth data, current
    Big Limit, dominant element, year-ahead notes
  - **Zi Wei summary** — current Big Limit palaces with the
    loudest signals from `iztro`
  - **Mahjong tile draw** — random 3- or 6-tile pull with
    interpretive notes (Bill's signature offering)
  - **Custom reading** — free-form. No template, just a text
    editor. Useful when the standard types don't fit.
- **Two delivery modes** per reading:
  - **In-meeting view** — clean, on-screen, edit-as-you-go,
    persisted in case the tab crashes
  - **Send by email** — same beautiful template as session
    reports, with subscription CTA at the bottom
- **Storage**: every generated reading saved as a row in a new
  `readings` table (distinct from `reports`, which stays
  session-bound). Searchable + filterable per client.
- **Provenance**: every reading shows who generated it, when, and
  whether it was sent.

### Out of scope for v1 (deferred)

- **AI auto-drafting** of the reading body. Bill drafts in his
  Claude.ai Project (Max-plan subscription), pastes in. Same
  policy as the session-report flow.
- **PDF export.** Email-only delivery in v1.
- **Customer-facing reading archive.** Customers receive readings
  by email only.
- **Stripe payments.** A reading is free or part of a subscription
  — no per-reading paywall yet.
- **Auto-scheduled readings.** No "send Sarah a year-ahead on her
  birthday every year" yet. v2.
- **Multi-language.** English-only for v1.
- **A/B testing the CTA.** v2 when we have volume.

---

## 4. Page-by-page UX

### 4.1 `/portal/readings` — list view

Sits in the portal nav between **Clients** and (admin-only) **Conversions**.

A simple table of every reading the user can see, with:

| Column | Meaning |
|---|---|
| Title | Short title — defaults to "{type} for {recipient}" |
| Recipient | Client name (with subscription icon) or ad-hoc email |
| Type | Bazi / Zi Wei / Mahjong / Custom |
| Generated | When + by whom |
| Status | Draft / Sent (with sent date if sent) |
| Actions | Open · Send · Duplicate · Delete |

Filters: status (Draft / Sent / All), type, recipient (search).
Sort: most recent first by default.

Big primary **+ New reading** button at the top right.

### 4.2 `/portal/readings/new` — create flow

**Step 1 — Who is this for?**

A single picker with two modes:

- **Existing client** — search-as-you-type field that resolves to
  clients in the `clients` table. Selecting one prefills name,
  email, birthday, birth_time, birth_place, gender.
- **One-off person** — toggle to manual entry. Enter name (required),
  email (optional unless sending), birthday, birth_time, birth_place,
  gender. Bill can later promote the one-off into a real client
  with a single click ("Save as client").

**Step 2 — Reading type**

A radio-card selector:

- ◐ **Bazi snapshot** — 4 pillars, current Big Limit, element
  balance, year-ahead. Birth date required, time recommended.
- ☯ **Zi Wei summary** — palace map, loud signals in current Big
  Limit. Requires birth date + time + place.
- 🀙 **Mahjong tile draw** — pick spread (3 tiles / 6 tiles /
  custom), system draws random tiles, Bill writes the reading.
  No birth data required.
- ✎ **Custom reading** — free-form text. No template, no auto-
  generated chart data. Use when the situation doesn't fit a
  standard type.

**Step 3 — Generate**

System computes the structured chart data using the existing libs
(`iztro`, `lunar-typescript`) and shows it inline so Bill can see
what he's working with. The reading body itself stays empty —
Bill fills it in.

**Step 4 — Write the reading**

A markdown editor (same component as the report-page body field).
Left side: editor. Right side: a small "context" panel showing
the structured chart data so Bill can reference while writing.

Three buttons at the bottom:

- **Save draft** — persists to `readings` table with status='draft'
- **Open in meeting mode** — full-screen, distraction-free editor
  for live calls
- **Send to recipient** — confirm dialog → email goes via Resend
  using the same template as session reports, status='sent'

### 4.3 `/portal/readings/[id]` — reading detail

Looks almost identical to `/portal/reports/[id]` today. Sections:

1. Recipient context (read-only)
2. Chart data (if applicable to the reading type)
3. Reading body (markdown editor)
4. Send block (Send / Send again, sent metadata)

A small "← Back to readings" link in the header.

### 4.4 "Meeting mode"

Full-viewport editor — no nav, no margins, just the markdown
text area + a tiny floating toolbar with **Save** and **Exit
meeting mode**. Use case: Bill on a video call, screen-sharing
this view, taking notes live while talking.

The same data, just a different rendering of the same row.

---

## 5. Email template

Reuse the existing `buildEmailHtml` from
`pages/api/portal/reports/send.js`. Two small additions:

- **Reading type badge** under the title — "Bazi snapshot",
  "Zi Wei summary", etc.
- **Chart preview block** (optional) above the reading body for
  Bazi / Zi Wei readings — small visual table of pillars or
  palaces. Skip for Mahjong / Custom.

CTA stays the same: "Explore The Mahjong Mirror →" linking to
`mahjongtarot.com/the-mahjong-mirror` (will swap to the
subscribe landing page when that ships in v2).

---

## 6. Data model

### New table: `public.readings`

```
id                   uuid primary key
created_at           timestamptz default now()
updated_at           timestamptz default now()
generated_by         uuid references auth.users(id)
client_id            uuid nullable, references clients(id) on delete set null
adhoc_recipient      jsonb nullable        — { name, email, birthday, birth_time, birth_place, gender }
reading_type         text not null         — 'bazi' | 'ziwei' | 'mahjong' | 'custom'
title                text
body_markdown        text
chart_data           jsonb                  — structured output from iztro/lunar-typescript
session_id           uuid nullable, references sessions(id) on delete set null
status               text not null default 'draft'   — 'draft' | 'sent'
sent_at              timestamptz nullable
sent_to_email        text nullable
email_message_id     text nullable
```

**Either** `client_id` **or** `adhoc_recipient` must be set (CHECK
constraint). `session_id` is optional and links a reading to a
specific session if it was used during one.

### RLS

Mirror the `reports` policy: portal users (astrologer + admin)
have full access. Members get no access.

### Migration

`020_readings.sql` — single migration, additive only.

---

## 7. Integration with existing flows

### From a client profile

A new **+ New reading** link on `/portal/clients/[id]` next to
**+ Schedule session**. Launches the readings/new page with the
client pre-selected.

### From a session

Each session row gets an extra **+ Reading** action alongside the
existing **Open report** button. Creates a reading linked to that
session via `session_id`. Useful when Bill wants to send a
follow-up sampler reading after a session that's already had its
formal report.

### From the Conversions dashboard

Each row gets a **+ Reading** quick action alongside the existing
**Send note** button. Useful for admin-driven sampler sends to
warm leads.

---

## 8. Open questions for stakeholders

1. **Chart visualisation in the email**: do we want a visual chart
   block (small SVG / table) inside the email, or text-only?
   Visual is more impressive but takes longer to build and may
   break in older email clients. Default proposal: text-only in
   v1; visual in v2.
2. **Tile randomness for Mahjong**: should the tile draw be
   server-side (auditable) or client-side (instant)? Default
   proposal: server-side via a `/api/portal/readings/draw-tiles`
   endpoint so the draw is recorded and reproducible.
3. **"Promote one-off to client"**: when Bill enters a one-off
   recipient, should we auto-create a client record on send? Or
   keep it as an opt-in button? Default proposal: explicit
   button — Bill decides.
4. **Reading templates / prompt library**: should we ship a
   library of Bill's standard reading templates (e.g. "Career
   transition Bazi") that pre-fill the body? Worth it if Bill
   has repeatable structures. Default proposal: v2 feature —
   start blank in v1, see what patterns emerge.
5. **Free vs paid**: do subscribers get unlimited readings, and
   non-subscribers get one free sampler? Or are readings always
   manual / un-metered? Default proposal: un-metered for v1.
   Pricing decisions wait for Stripe + subscription product
   shape to settle.
6. **AI assist re-visit**: the current "no Anthropic API in
   prod" policy makes sense for full session reports (long
   form, infrequent). For short sampler readings (200–400 words),
   is it worth revisiting? A free-tier provider (Google Gemini
   Flash) could draft a reading in 1 second. Default proposal:
   still no in v1; revisit after we see real volume.

---

## 9. Build plan (eng estimate, separate doc)

The implementation plan with file-by-file changes and PR sequencing
lives at `IMPLEMENTATION-PLAN.md` in this folder (drafted after
spec sign-off). High-level shape:

| PR | Scope | Estimate |
|---|---|---|
| 1 | Migration `020_readings.sql` + `lib/readings.js` + `/api/portal/readings/update` and `/.../send` API routes | ~2 hours |
| 2 | `/portal/readings` list page + nav link | ~1.5 hours |
| 3 | `/portal/readings/new` create flow (recipient picker, type selector, generate, write) | ~3 hours |
| 4 | `/portal/readings/[id]` detail page + meeting mode | ~2 hours |
| 5 | Integration with clients/sessions/conversions (the "+ Reading" quick actions) | ~1 hour |

Total v1: roughly **9–10 hours of focused engineering**, splittable across 5 PRs.

---

## 10. Success criteria

After v1 ships, we'll know it's working if:

1. **Bill uses it during at least one live call** within the
   first week (meeting mode usage event)
2. **Admin sends at least one sampler reading** to a warm
   lead per week
3. **At least 25% of sampler readings result in a follow-up
   action** — booking, reply, or subscription within 30 days

Track via the existing `readings.status` + send timestamps. No
new analytics infrastructure needed.

---

## 11. Risks / mitigations

| Risk | Mitigation |
|---|---|
| Bill doesn't adopt because writing readings on a small editor isn't his style | Meeting mode = full screen. Plus: he can keep using Claude.ai Project and paste in. |
| Sampler readings cannibalise paid sessions ("I got a free one, why pay?") | Length + depth cap on samplers. Send CTA every time. Watch conversion rate after 4 weeks. |
| `iztro` library has bugs or surprising outputs | Already in production for horoscopes; risk is low. Show structured data alongside the reading so Bill can sanity-check before sending. |
| Email rendering breaks in unusual clients | Same template as report email, which has been tested. Add reading-specific blocks defensively. |
| Spam / abuse if admin role is compromised | Existing RLS + `requireAdminApi` covers it. No new attack surface. |

---

## 12. Out-of-scope notes for stakeholders

- This feature **does not replace** the existing session-report
  flow. Session reports are still the right shape for paid
  scheduled readings. The readings generator is for everything
  else.
- This feature **does not change** Bill's recording / transcript
  workflow. Manual paste stays.
- This feature **does not add** any new third-party services or
  paid APIs.

---

**Questions, edits, or sign-off → reply to this doc or message Yon directly.**

*Next step after sign-off: I'll draft `IMPLEMENTATION-PLAN.md` and we
start with PR 1.*
