# Plan — Lead → Customer conversion (HubSpot-style)

**Status:** drafting → building
**Branch:** `feat/deals-and-lifecycle`
**Author:** Dave, with Mark Roberge's design heuristics applied by Claude
**Last updated:** 2026-05-23

## The user request

> If I manually change a lead to "Won" it should ask me for the amount and then set the people type attribute to customer.

## Current state (verified in Supabase)

- `people` table has **no lifecycle/type/status attribute**. Just identity + contact data.
- `inquiries.status` is the sales-pipeline value. Allowed: `new_lead | contacted | discovery_call | proposal | won | lost | archived`. The `/admin/inquiries` kanban lets you drag a card to "Won", which calls the RPC `update_inquiry_status` and silently flips the field.
- `inquiries.type` describes how it arrived (`contact | newsletter | booking | reading | consultation | general`) — **not** a customer lifecycle.
- `leads` table is the email-nurture queue (1,244 active subscribers). Status is `active | completed | unsubscribed | converted`. Not used as a sales pipeline.
- No `deals` / opportunities table exists. Paid bookings live in `public.bookings`; paid subscriptions in `public.member_subscriptions`. Both write themselves via Stripe webhook. Nothing represents an offline / manual sale.

So today, marking an inquiry "Won" loses two things: the **amount** and the **fact that the person is now a customer**.

## Design — what Mark Roberge would say

1. **Lifecycle lives on the person, not on inquiries.** Every person gets one canonical lifecycle stage; the system moves them between stages based on events.
2. **A "Won" event is a Deal, not a status change.** When a rep marks Won, they're creating a permanent revenue record. That record is a `deals` row. The inquiry-status flip is a side effect of the deal closing.
3. **The rep never edits lifecycle by hand.** It's derived from the events: `Mark Won` → person becomes `customer`. `Stripe checkout completes` → person becomes `customer`. The lifecycle field is read-only in the UI.

## Scope of this PR (smallest viable cut)

The smallest thing that delivers what Dave asked for + lays the foundation:

1. **Schema**
   - `people.lifecycle_stage` text, check (`'subscriber','lead','mql','sql','opportunity','customer','evangelist'`), default `'lead'`.
   - New `public.deals` table — see schema below.
   - One-time backfill: anyone with a paid booking or active subscription → `customer`. Everyone else with an inquiry → `lead`. Anyone only in `leads` table (newsletter signups) → `subscriber`. Default for the rest → `lead`.
2. **Server endpoint** `POST /api/admin/inquiries/mark-won`
   - Body: `{ inquiry_id, amount_cents, currency?, close_date?, notes? }`
   - Admin-only.
   - Transaction:
     1. Look up the inquiry → must have `person_id`.
     2. Insert into `deals` (`amount_cents`, `person_id`, `inquiry_id`, `source='inquiry'`, `won_at=now()`).
     3. Update `inquiries.status = 'won'`.
     4. Update `people.lifecycle_stage = 'customer'` (only if not already `customer` or `evangelist`).
   - Returns the new deal id.
3. **UI** on `/admin/inquiries`
   - Intercept the existing `update_inquiry_status` flow when the target status is `'won'`.
   - Open a modal: amount (required), currency (default USD), close date (default today), notes (optional).
   - On confirm, call `/api/admin/inquiries/mark-won` instead of the raw RPC. Update the local state on success.
   - Other status flips (e.g. `contacted → discovery_call`) keep using the existing RPC unchanged.

## Schema — `public.deals`

```sql
create table public.deals (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  person_id       uuid references public.people(id) on delete set null,
  inquiry_id      uuid references public.inquiries(id) on delete set null,
  amount_cents    integer not null check (amount_cents >= 0),
  currency        text not null default 'usd',
  source          text not null,                       -- 'inquiry' | 'stripe' | 'manual'
  notes           text,
  close_date      date,
  won_at          timestamptz,
  lost_at         timestamptz,
  status          text not null default 'won'
                  check (status in ('open','won','lost','refunded')),
  owner_id        uuid references auth.users(id) on delete set null,
  -- optional links to existing records for Stripe-paid deals (filled by
  -- a follow-up PR; harmless to have nullable now)
  booking_id              uuid,
  member_subscription_id  uuid,
  stripe_payment_intent_id text
);

create index deals_person_id_idx on public.deals(person_id);
create index deals_inquiry_id_idx on public.deals(inquiry_id);
create index deals_status_idx    on public.deals(status);
create index deals_won_at_idx    on public.deals(won_at);

alter table public.deals enable row level security;
-- Admins read all, write all. No public/staff access in v1.
create policy "Admin all on deals"
  on public.deals
  for all
  using (public.is_admin())
  with check (public.is_admin());
```

## Out of scope (follow-ups)

- **Stripe webhook → auto-create Deal**. When a paid booking or subscription lands, write a `deals` row + bump `people.lifecycle_stage` to `customer`. No rep input. Needs the booking-funnel webhook to know how to find or create the matching `people` row (currently it writes to `bookings.email` only).
- **Showing a customer's deals on `/admin/people/[id]`**. The lifecycle stage chip + deals timeline. Today the people page exists but doesn't show deals.
- **Reporting / dashboards**: revenue by source, time-in-stage, LTV. Builds on top of `deals`.
- **Lost reason** — capture why a deal didn't close. Add a `lost_reason` enum later.
- **Stage transitions log** — an `events` table that records every `lifecycle_stage` change. Lets us measure stage-to-stage conversion.

## Risks / things to watch

- **Inquiries without a `person_id`** would block "Mark Won". From the 22 inquiry rows today, all should have a `person_id` (set by #265 backfill) — verified before shipping.
- **Re-running the mark-won action** could create duplicate deals. The endpoint should be idempotent on `(inquiry_id, status='won')`: if a Won deal already exists for this inquiry, return that one.
- **Lifecycle backfill quality** — getting "lead" vs "subscriber" wrong is low-impact. The lifecycle field is informational until reporting builds on top of it.
- **People without a lifecycle_stage after backfill**: shouldn't happen (column has a default), but a verify query after migration confirms.

## Verification (before requesting test plan in PR)

```sql
-- Every person has a lifecycle_stage:
select count(*) from public.people where lifecycle_stage is null;  -- expect 0

-- Anyone with a paid booking is a customer:
select count(*) from public.people p
join public.bookings b on b.email = p.email
where b.status = 'paid' and p.lifecycle_stage <> 'customer';      -- expect 0

-- The deals table has the expected indexes/RLS:
select count(*) from pg_policies where tablename = 'deals';        -- expect 1
```

## Definition of done

- Migration applied to Supabase
- `npm run build` clean
- On `/admin/inquiries`, dragging or selecting a card to "Won" opens the amount modal
- Submitting the modal: a `deals` row exists; inquiry.status='won'; person.lifecycle_stage='customer'
- PR open against `main`, build green, manual smoke confirmed
