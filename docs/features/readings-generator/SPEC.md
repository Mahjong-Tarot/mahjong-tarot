# Readings Generator — Stakeholder Spec

**Status:** Draft v0.2 — for stakeholder review
**Date:** 2026-05-20
**Author:** Yon (with Claude)
**For:** Dave Hajdu, Bill Hajdu

> **What changed in v0.2:** scope clarified to two distinct purposes
> (practitioner prep tool *and* paid customer-facing reading product).
> Pricing and Stripe integration moved from "deferred" to "in scope".
> Customer-facing request flow added. Data model adjusted.

---

## TL;DR

A new feature inside the portal that serves **two distinct purposes**:

1. **Practitioner prep tool** — Bill creates a reading to prepare
   for a meeting (or use mid-meeting as a structured notepad).
   Lives entirely inside the portal. Not sent to a customer.
2. **Paid on-demand reading product** — a customer requests and
   pays for a written reading without booking a live session.
   Bill (or an admin) writes it inside the same portal interface
   and sends it by email when ready.

Both purposes share the same data model and reading-creation UI.
What differs is the **entry point**, **billing**, and **lifecycle**.

---

## 1. Why we need it

Today's portal works beautifully for **scheduled session → polished
report**. But two big gaps:

### Gap A — Bill has no prep workspace

Before a session, Bill has to dig through paper notes, generate a
chart manually, and ad-hoc-write talking points. During a session
he has nowhere clean to take live notes. After, his prep notes are
lost.

A purpose-built **prep view** — chart auto-generated from the client's
birth data, blank notes area, references to past sessions — saves him
time and makes every session sharper.

### Gap B — No way to sell a written reading

Right now, the only paid offering is a **live reading session**
(`/book-a-reading` at $49 / $69 / $129 by duration). There's no way
for a customer to say "I'd like Bill to write me a Bazi snapshot
without a call" and pay for it.

This is a real product category — many practitioners offer it
because it's high-margin (no scheduled time, async delivery) and
removes the calendar friction. Some customers prefer reading + reflect
over a live call.

Adding it requires:
- A public **request form** with pricing
- **Stripe Payment Link** for payment capture
- A **work queue** for Bill / admins inside the portal
- The same reading-creation UI as the prep tool, just delivered
  to the customer when done

---

## 2. The two purposes — side by side

| | **Purpose A — Prep tool** | **Purpose B — Paid product** |
|---|---|---|
| Who initiates | Bill (or admin on his behalf) | Customer (via public form) |
| Billing | None | Stripe Payment Link, paid upfront |
| Recipient | Existing client (the person Bill is meeting) | The paying customer (likely new — promote to client on payment) |
| Lifecycle | `draft` → `archived` (Bill done with it) | `paid` → `in_progress` → `sent` |
| Delivery | Never sent. Stays in portal. | Emailed when ready. SLA: 5 business days. |
| Reference | Bill opens during prep + live meeting | Customer receives email, can request follow-up |
| Subscription CTA | No — internal doc | Yes — every sent reading drives subscription conversion |

Same underlying **reading-creation UI**. Different metadata, lifecycle, and entry point.

---

## 3. User stories

### Bill (practitioner)

1. **Pre-session prep**: 5 minutes before a call with Sarah, Bill
   opens her client profile, clicks **+ Prep for next session**,
   gets a page with her Bazi chart + Zi Wei palaces + last 3
   sessions' themes auto-populated. Adds bullet notes on what to
   bring up. Saves.
2. **Mid-session note-taking**: during the call, Bill switches
   to meeting mode (full-screen view of his prep doc). Takes
   live notes inside it. The chart stays visible as reference.
3. **Paid-product work queue**: every morning, Bill sees a list
   of paid reading requests in the portal — name, type, paid-on
   date, due-by date. Opens one, writes it, clicks Send. Customer
   receives the polished reading + Stripe receipt.

### Admin (Dave / Yon)

1. **Manage incoming requests**: see every paid reading request,
   reassign / nudge / refund as needed.
2. **Convert leads with samplers** (Phase 2 feature) — send free
   short sampler readings to warm leads. Marked as `comped`.
3. **Track revenue** — see paid-readings revenue alongside
   subscription revenue on a dashboard (future).

### Customer (recipient)

1. Visits `mahjongtarot.com/readings` (public page), sees the
   menu of available written readings + prices.
2. Picks "Bazi snapshot — $39". Enters their birth info + email.
3. Pays via Stripe Payment Link.
4. Receives a confirmation email: "Bill will send your reading
   within 5 business days."
5. ~3 days later, receives the polished reading by email with a
   subscription CTA.
6. Optionally replies, books a follow-up live session, or subscribes.

---

## 4. Scope

### In scope for v1

**Practitioner-side (Purpose A):**

- New page **`/portal/readings`** — list of every reading the user can see (prep + paid)
- **`/portal/readings/new`** — create a prep reading manually
- **`/portal/readings/[id]`** — detail / editor / send
- **Meeting mode** — full-screen distraction-free editor
- Reading-creation supports **4 types**: Bazi snapshot · Zi Wei summary · Mahjong tile draw · Custom (free-form)
- Auto-generated **chart data** from birth info using existing `iztro` + `lunar-typescript` libraries
- Quick-create entry points from **client profile**, **session**, and (admin only) **conversions dashboard**
- Astrologer + admin can both access. No member access.

**Customer-side (Purpose B):**

- New public page **`/readings`** — menu of written reading products with prices
- New public page **`/readings/request`** — form to request + pay for a reading
- **Stripe Payment Links** for each reading type (managed in Stripe dashboard, URL stored in env / DB)
- On payment webhook → reading row created with `status='paid'`, customer is auto-promoted to a client record (if not already one), email confirmation sent
- Portal users see paid readings in their dashboard with a clear "Paid · due by X" badge
- When Bill clicks **Send to customer**, status flips to `sent`, customer gets the reading

**Cross-cutting:**

- Email template — reuses the existing report email template + reading-type badge + chart preview block
- All deliveries via Resend (already wired)
- Revenue + send timestamps logged for future reporting

### Out of scope for v1 (deferred to v2)

- **AI auto-drafting** of the reading body. Manual write only.
- **PDF export.** Email-only delivery.
- **Customer-facing reading archive** on the site (separate from email receipt).
- **Auto-scheduled readings** ("send Sarah a birthday reading every year").
- **Bundled pricing** (3-reading packs, etc.).
- **Multi-language.**
- **Sampler / comped reading flow** for admin lead-nurture (Phase 2, after v1 ships and we know what works).
- **Refunds inside the portal** — handled via Stripe dashboard for v1.

---

## 5. Page-by-page UX

### 5.1 Customer-side

#### `/readings` (public)

Menu page — list of available written readings with prices.
Same visual style as the existing `/book-a-reading` page.

Each card:
- Reading name (e.g. "Bazi Snapshot")
- Price ($39 / $59 / $89 — TBC)
- 2–3 sentence description ("A written interpretation of your
  Four Pillars and current Big Limit. Delivered within 5 business
  days.")
- Sample length ("~600 words" / "~1200 words")
- **Request →** button → `/readings/request?type=bazi`

#### `/readings/request`

A simple form:
- Pre-filled reading type from the URL param
- **Your name**
- **Your email**
- **Birthday** (date)
- **Birth time** (optional)
- **Birth place** (optional)
- **Anything you'd like Bill to focus on?** (free text)
- **Pay & request** button → redirects to the corresponding Stripe Payment Link with the request_id passed as `client_reference_id`

#### `/readings/thank-you`

Stripe redirect-on-success page:
- "Thanks, Bill will send your reading within 5 business days."
- A link to subscribe (subscription product, TBD) for ongoing readings
- Order confirmation (reading_id + amount paid)

### 5.2 Practitioner / admin side

#### `/portal/readings` — list view

A table of every reading the user can see, with a **Status** column
that's the primary signal:

- ✎ **Draft** — prep reading, never sent
- 💵 **Paid · due by {date}** — customer paid, work outstanding
- 🔄 **In progress** — Bill has started writing
- ✉ **Sent** — delivered to recipient

Columns: Title · Recipient (with subscription icon) · Type · Status · Generated/paid date · Actions.

Filters at the top:
- **Tab** — All / Prep (drafts) / Paid queue / Sent
- **Search** by recipient name
- **Sort** — most urgent (paid + closest due date) / recent / alphabetical

Big primary actions:
- **+ New prep reading** (any portal user)
- **View paid queue** (jumps to filter)

#### `/portal/readings/new` (prep flow)

Manual create — used when Bill makes a prep doc himself.

**Step 1 — Recipient**: existing client (search) or one-off person.
**Step 2 — Reading type**: Bazi / Zi Wei / Mahjong / Custom.
**Step 3 — System fetches chart data** from `iztro` / `lunar-typescript`
based on birth info.
**Step 4 — Editor**: markdown body + chart-reference panel.
**Save draft** → status `draft`.

This is the prep flow only — there's no "Send to customer" button
unless Bill explicitly upgrades the draft to a sendable reading
(useful in rare cases).

#### `/portal/readings/[id]` (detail / editor)

Same view for prep + paid readings — the **status** differs and
the **action buttons** differ.

Sections:
1. **Header** — title + status badge + (if paid) "Paid {date} · Due {date}"
2. **Recipient context** — client info, birth info, last sessions
3. **Chart data** — auto-rendered tables / lists for the chosen reading type
4. **Body editor** — markdown
5. **Action footer**:
   - Prep: **Save draft** · **Archive**
   - Paid: **Save** · **Send to customer** (confirm)
   - Sent: **Send again** (with confirm)

#### Meeting mode

Click **Open in meeting mode** from any reading detail page → full-viewport editor with chart sidebar. Same data, distraction-free rendering. Save button floats. Exit returns to detail page.

#### `/portal/readings/paid-queue` (or filter on the list)

A focused view for whoever is on duty — same table, filtered to `paid` and `in_progress`, sorted by closest due date.

---

## 6. Email template

Reuse the existing `buildEmailHtml`. Three additions for the paid-product case:

- **Reading type badge** under the title
- **Chart preview block** above the body (optional per type)
- **Order receipt footer** — "Order #abc123 · paid $39 on 2026-05-15"

CTA: **"Explore The Mahjong Mirror →"** for v1; will swap to subscribe-landing-page when that ships.

---

## 7. Data model

### Table: `public.readings`

```
id                   uuid primary key
created_at           timestamptz default now()
updated_at           timestamptz default now()
generated_by         uuid references auth.users(id)    -- who's writing it
client_id            uuid nullable references clients(id) on delete set null
adhoc_recipient      jsonb nullable                    -- { name, email, birthday, birth_time, birth_place, gender, focus }
reading_type         text not null check (reading_type in ('bazi','ziwei','mahjong','custom'))
purpose              text not null default 'prep' check (purpose in ('prep','paid','comped'))
title                text
body_markdown        text
chart_data           jsonb
session_id           uuid nullable references sessions(id) on delete set null
status               text not null default 'draft'
                       check (status in ('draft','paid','in_progress','sent','archived','refunded'))

-- Paid-product fields (NULL for purpose='prep')
price_cents          int nullable
stripe_session_id    text nullable        -- Stripe Checkout Session id
stripe_payment_id    text nullable        -- Stripe PaymentIntent id
paid_at              timestamptz nullable
due_by               timestamptz nullable -- paid_at + 5 business days
focus_request        text nullable        -- the "anything Bill should focus on?" field

-- Delivery
sent_at              timestamptz nullable
sent_to_email        text nullable
email_message_id     text nullable
```

**CHECK constraint**: either `client_id` OR `adhoc_recipient` is set.

**Lifecycle by purpose**:
- `purpose='prep'`: `draft` → `archived`
- `purpose='paid'`: `paid` → `in_progress` → `sent` (or `refunded`)
- `purpose='comped'`: `draft` → `sent` (no payment)

### Table: `public.reading_products` (small lookup table)

```
slug         text primary key   -- 'bazi-snapshot', 'ziwei-summary', etc.
display_name text not null
description  text
reading_type text not null check (reading_type in ('bazi','ziwei','mahjong','custom'))
price_cents  int not null
stripe_payment_link_url text not null
sample_length text                -- '~600 words'
sla_days     int default 5
is_active    boolean default true
```

This lets the public `/readings` page render its menu from the DB, and admins flip products on/off without a deploy.

### RLS

- `readings`: portal users (astrologer + admin) have full access; members get no access. End customers receive their reading by email only (no in-site read access in v1).
- `reading_products`: public read access (used by the public menu); only admin can write.

### Migrations

- `020_readings.sql` — both tables + RLS in one migration

---

## 8. Stripe integration (the new piece)

### Approach: Stripe Payment Links + webhook

Lowest-friction option. **No Stripe Checkout custom flow, no Stripe Elements UI** in v1. Each reading product has its own pre-configured Stripe Payment Link.

**Flow**:
1. Customer fills `/readings/request` form
2. We POST to `/api/readings/intent` → creates a `readings` row with `status='paid' pending`, returns the Stripe Payment Link URL with `client_reference_id = reading.id`
3. Customer is redirected to Stripe-hosted checkout
4. On success, Stripe redirects to `/readings/thank-you`
5. Stripe webhook (`checkout.session.completed`) hits `/api/webhooks/stripe` → marks the `readings` row as paid, stores `paid_at` + `stripe_*` IDs, sends customer the "Bill will send your reading within 5 business days" email
6. Portal users see the new paid reading in their queue

**Why Payment Links (vs full Checkout)**:
- Stripe dashboard manages all pricing changes — no deploys
- No frontend Stripe code in our app
- Refunds happen in Stripe dashboard
- All compliance (3DS, EU VAT, etc.) handled by Stripe

**Required env vars**:
- `STRIPE_WEBHOOK_SECRET` — for verifying webhook signatures

**No** `STRIPE_SECRET_KEY` needed in v1 — we don't talk to the Stripe API directly, only receive webhooks.

---

## 9. Integration with existing flows

### From a client profile

New **+ New reading** action next to **+ Schedule session** — launches the prep flow with that client pre-selected.

### From a session

Each session row gets a **+ Prep reading** button (alongside the existing **Open report**). Creates a prep reading linked via `session_id`.

### From the conversions dashboard

(Phase 2) — admin can comp a sampler reading from any row.

### From `/book-a-reading`

The existing live-session booking page gets an added "Or request a written reading →" footer linking to `/readings`. Cross-sell.

---

## 10. Open questions for stakeholders

These need answers before final v1 lock:

1. **Pricing** — what should the written readings cost?
   - Default proposal: **Bazi $39 / Zi Wei $59 / Mahjong $49 / Custom $89**.
   - Aim is "less than a live session" so customers see the trade-off (live = personal but pricier; written = cheaper but async).
2. **SLA** — 5 business days reasonable? Or shorter/longer?
   - Default proposal: **5 business days**. Conservative — Bill can over-deliver.
3. **Refund policy** — what triggers a refund?
   - Default proposal: full refund if not delivered within 10 business days (we missed our SLA badly), 50% if delivered late but completed. No-questions-asked refund within 24 hrs of order.
4. **One-off vs client record** — when a customer pays for a reading and they're not already a client, do we **auto-create a client record** for them?
   - Default proposal: **yes** — auto-promote on payment. Saves Bill data-entry. They become a `subscription_status='none'` client.
5. **Free sampler tier** — should we offer ONE free short reading as a conversion bait (e.g. "Free 1-card Mahjong draw")?
   - Default proposal: **no in v1** — keep it simple and paid-only first. Add comped/free flow in v2 if data supports it.
6. **AI assist re-visit** — is it worth using a free-tier LLM (Gemini Flash) to draft the reading body for Bill's review?
   - Default proposal: **no in v1** — manual writing. Revisit after we see real volume + Bill's actual time per reading.
7. **Stripe account ownership** — whose Stripe account holds the payment links and receives payouts? Bill's existing one? A new one? Mahjong Tarot business entity?
   - **This is the only blocking question** — can't ship the paid flow until this is decided + payment links exist.

---

## 11. Build plan (eng estimate)

| PR | Scope | Estimate |
|---|---|---|
| 1 | Migration `020_readings.sql` (both tables, RLS) + `lib/readings.js` library helpers + API routes `/api/portal/readings/update`, `/.../send` | ~2 hrs |
| 2 | `/portal/readings` list view + nav link (+ Prep filter) | ~1.5 hrs |
| 3 | `/portal/readings/new` prep flow + `/portal/readings/[id]` detail/editor + meeting mode | ~3.5 hrs |
| 4 | Quick-create hooks from client profile + session row + nav | ~1 hr |
| 5 | Public `/readings` menu + `/readings/request` form + `/api/readings/intent` | ~2 hrs |
| 6 | Stripe webhook handler (`/api/webhooks/stripe`) + paid-queue UI + "Send to customer" send flow | ~2.5 hrs |
| 7 | Seed `reading_products` rows + Stripe Payment Links created in Stripe dashboard + email confirmation templates | ~1 hr (mostly ops) |

**Total v1: ~13–14 hours of focused engineering**, splittable across 7 PRs.

PRs 1–4 are the practitioner prep tool. **That's the half we could ship first** while Stripe ownership (Question 7) gets resolved. PRs 5–7 are the paid product.

---

## 12. Success criteria

### Practitioner prep tool (after PR 4 ships)

- Bill creates a prep reading for **at least 1 in 3 upcoming sessions** within the first 2 weeks
- Bill uses **meeting mode during at least one live session** in the first week

### Paid reading product (after PR 7 ships)

- **At least 2 paid reading orders per week** within first month
- Average **time from paid to sent**: under 3 business days (so we beat our 5-day SLA)
- **At least 25% of paid readings result in a follow-up action** (booking, subscription, reply) within 30 days
- **Zero refund-for-SLA-miss events** in first quarter

Track all via the existing `readings.status` + timestamps. No new analytics infrastructure needed.

---

## 13. Risks / mitigations

| Risk | Mitigation |
|---|---|
| Bill doesn't keep up with the paid queue, SLA breaches accumulate | Make `paid` readings impossible to miss — they sit at the top of `/portal` until handled. Admin can reassign or refund easily. |
| Bill's reading style on paid product feels rushed vs his live work | Default tier at $39 sets a price-appropriate expectation; we can encourage Bill to do longer pieces by raising the price after volume proves out. |
| Customers complain about wait time | Set conservative SLA (5 days), over-communicate (confirmation email + "Bill is working on it" mid-flight email if it's been 3+ days). |
| Stripe fees eat into the small price points | At $39 with ~3% Stripe fees = ~$1.20 per reading lost. Acceptable. |
| Spam / fake orders | Stripe Payment Link inherently filters this (must complete payment). |
| Refund disputes / chargebacks | Stripe handles via dashboard. Low risk at this price point and volume. |
| Customers paying for a reading expect a live call | Clear product copy on `/readings`: "written reading, no call included. For live readings see /book-a-reading." |

---

## 14. What this feature does NOT change

- The **scheduled session → report** flow stays exactly as it is today.
- Bill's **transcript paste + Claude.ai Project** workflow stays.
- The **subscription product** (Stripe subscription, separate from this) is its own thing — readings can be a great cross-sell into a subscription, but we don't bundle them in v1.
- No changes to the **`requirePortalUser` / `requireAdmin`** auth model.
- No new external services beyond Stripe (which is the one new dependency).

---

## 15. Phasing recommendation

Suggest splitting v1 into **two ship dates** to de-risk the Stripe piece:

### v1a — Practitioner prep tool (PRs 1–4)

- 100% engineering, no external dependencies
- Bill gets value immediately
- ~7–8 hours of work
- **Ship within 1 week of spec sign-off**

### v1b — Paid reading product (PRs 5–7)

- Requires Stripe account setup (Question 7) + Stripe Payment Links created
- Requires public-page design pass
- ~6 hours of engineering after the Stripe ops piece is done
- **Ship as soon as Stripe is live + we've done a test purchase**

---

**Sign-off requested from:** Dave Hajdu + Bill Hajdu

**Next step after sign-off**: I draft `IMPLEMENTATION-PLAN.md` in this folder, map each PR to specific files / migrations / API contracts, then start with PR 1 (practitioner prep tool).
