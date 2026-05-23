-- ============================================================
-- 030_deals_and_lifecycle.sql — deals table + people lifecycle
-- ============================================================
-- HubSpot-style: lifecycle stage lives on the person; deals are
-- their own table; closing a deal is an event that promotes the
-- person rather than a column on the inquiry.
--
-- Apply each `--` section separately when running through Supabase's
-- Management API (which prepares statements eagerly and can't see a
-- column added earlier in the same script). The CLI invocation that
-- shipped this migration applied statements individually.
-- ============================================================

-- ─── 1. people.lifecycle_stage ────────────────────────────────
alter table public.people
  add column if not exists lifecycle_stage text not null default 'lead'
    check (lifecycle_stage in (
      'subscriber', 'lead', 'mql', 'sql', 'opportunity',
      'customer', 'evangelist'
    ));

create index if not exists people_lifecycle_stage_idx
  on public.people(lifecycle_stage);

-- Backfill (each is its own UPDATE so Supabase can plan it after
-- the column exists):
--   anyone with a 'paid' booking → customer
--   anyone whose email matches a Member Area subscription → customer
--   anyone with at least one inquiry → lead  (left as default)
--   anyone in `leads` (newsletter queue) but not above → subscriber

update public.people p
  set lifecycle_stage = 'customer'
  where exists (
    select 1 from public.bookings b
    where b.email = p.email
      and b.status = 'paid'
  )
  and p.lifecycle_stage <> 'customer';

update public.people p
  set lifecycle_stage = 'subscriber'
  where p.lifecycle_stage = 'lead'
    and exists (
      select 1 from public.leads l
      where l.person_id = p.id
        and l.source in ('newsletter', 'legacy_customers', 'legacy_leads')
        and l.status = 'active'
    )
    and not exists (
      select 1 from public.inquiries i where i.person_id = p.id
    );

-- ─── 2. deals table ───────────────────────────────────────────
create table if not exists public.deals (
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
    check (status in ('open', 'won', 'lost', 'refunded')),
  owner_id        uuid references auth.users(id) on delete set null,
  booking_id              uuid,
  member_subscription_id  uuid,
  stripe_payment_intent_id text
);

create index if not exists deals_person_id_idx  on public.deals(person_id);
create index if not exists deals_inquiry_id_idx on public.deals(inquiry_id);
create index if not exists deals_status_idx     on public.deals(status);
create index if not exists deals_won_at_idx     on public.deals(won_at);

alter table public.deals enable row level security;

-- Only admins read/write deals. Inquiries already use is_admin() in
-- 024; reuse it here for the same enforcement story.
drop policy if exists "Admin all on deals" on public.deals;
create policy "Admin all on deals"
  on public.deals
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─── 3. updated_at trigger ────────────────────────────────────
drop trigger if exists touch_deals_updated_at on public.deals;
create trigger touch_deals_updated_at
  before update on public.deals
  for each row execute function public.touch_updated_at();
