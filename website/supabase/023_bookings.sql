-- ============================================================
-- 023_bookings.sql — Private Reading bookings + availability
-- ============================================================
-- Run this in Supabase SQL Editor or via:
--   supabase db query --linked --file website/supabase/023_bookings.sql
--
-- Two tables back the customer-facing Private Reading funnel:
--   reading_availability — slots Bill is open to book
--   bookings             — paid bookings, one per Stripe Checkout Session
--
-- Slots move through states:
--   open  → held (during Stripe Checkout)  → booked (webhook on payment)
--   open  → held → open  (when hold TTL passes without payment)
--
-- All writes from the customer funnel happen via the Stripe webhook
-- using the service-role key, which bypasses RLS. The browser only
-- reads available slots through a server route (anon allowed).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- reading_availability
-- One row per bookable start time. duration_minutes lets us
-- support 30/60/90 from the same table — we just hide overlapping
-- slots when one is booked.
-- ────────────────────────────────────────────────────────────
create table if not exists public.reading_availability (
  id                 uuid primary key default gen_random_uuid(),
  slot_start         timestamptz not null,
  duration_minutes   int not null default 60
    check (duration_minutes in (30, 60, 90)),
  status             text not null default 'open'
    check (status in ('open', 'held', 'booked')),
  held_until         timestamptz,
  held_for_session   text,
  booking_id         uuid,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (slot_start, duration_minutes)
);

create index if not exists reading_availability_slot_start_idx
  on public.reading_availability(slot_start);
create index if not exists reading_availability_status_idx
  on public.reading_availability(status);

-- ────────────────────────────────────────────────────────────
-- bookings
-- One row per paid Private Reading. Linked back to the held
-- slot via slot_id (which the webhook flips to status='booked').
-- ────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  full_name                   text not null,
  email                       text not null,
  phone                       text,
  birthday                    date,
  birth_time                  time,
  question                    text,
  duration_minutes            int not null check (duration_minutes in (30, 60, 90)),
  scheduled_at                timestamptz,
  slot_id                     uuid references public.reading_availability(id) on delete set null,
  status                      text not null default 'pending_payment'
    check (status in (
      'pending_payment', 'paid', 'scheduled',
      'completed', 'cancelled', 'refunded'
    )),
  amount_cents                int,
  currency                    text default 'usd',
  stripe_session_id           text unique,
  stripe_payment_intent_id    text,
  user_id                     uuid references auth.users(id) on delete set null
);

create index if not exists bookings_email_idx        on public.bookings(email);
create index if not exists bookings_status_idx       on public.bookings(status);
create index if not exists bookings_scheduled_at_idx on public.bookings(scheduled_at);
create index if not exists bookings_user_id_idx      on public.bookings(user_id);

alter table public.reading_availability enable row level security;
alter table public.bookings              enable row level security;

-- ────────────────────────────────────────────────────────────
-- RLS — customers don't read or write bookings tables from the
-- browser. The funnel uses server routes (anon → service-role
-- via API) so no public policies are required.
-- Authenticated members get a read of their own bookings if/when
-- their user_id gets stamped on a booking.
-- ────────────────────────────────────────────────────────────
drop policy if exists "Users read own bookings" on public.bookings;
create policy "Users read own bookings"
  on public.bookings
  for select using (auth.uid() = user_id);

-- updated_at triggers reuse touch_updated_at() from migration 004
drop trigger if exists touch_reading_availability_updated_at
  on public.reading_availability;
create trigger touch_reading_availability_updated_at
  before update on public.reading_availability
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_bookings_updated_at on public.bookings;
create trigger touch_bookings_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ────────────────────────────────────────────────────────────
-- release_expired_holds()
-- Used by /api/bookings/slots to lazily release slots whose holds
-- have expired without payment. Idempotent.
-- ────────────────────────────────────────────────────────────
create or replace function public.release_expired_holds()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.reading_availability
  set status = 'open',
      held_until = null,
      held_for_session = null
  where status = 'held'
    and held_until is not null
    and held_until < now();
end;
$$;

grant execute on function public.release_expired_holds() to anon, authenticated, service_role;
