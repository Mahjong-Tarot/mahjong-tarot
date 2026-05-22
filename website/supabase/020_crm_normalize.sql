-- ============================================================
-- 020_crm_normalize.sql — CRM: normalize people + inquiries
-- ============================================================
-- Slice 1 of the CRM build. Modeled on AIO's
-- 001_normalized_schema.sql, adapted to mahjong-tarot's existing data.
--
-- This migration is ADDITIVE. It:
--   1. Adds new columns to people + inquiries (source_site, etc.)
--   2. Backfills existing inquiry status/type values
--   3. Adds CHECK constraints + updated_at trigger
--   4. Adds activity_log table
--   5. Adds nullable person_id columns to clients + profiles
--      (FK constraints added in slice 6 after backfill)
--
-- Re-runnable. All ALTER TABLE / CREATE statements use IF NOT EXISTS
-- / IF EXISTS as appropriate.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. people — add CRM columns
-- ────────────────────────────────────────────────────────────
alter table public.people
  add column if not exists source_site text not null default 'themahjongtarot.com',
  add column if not exists company     text,
  add column if not exists role        text;

-- updated_at trigger (mirrors AIO's handle_updated_at)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_people_updated_at on public.people;
create trigger set_people_updated_at
  before update on public.people
  for each row
  execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 2. inquiries — add source_site, normalize status + type
-- ────────────────────────────────────────────────────────────
alter table public.inquiries
  add column if not exists source_site text not null default 'themahjongtarot.com';

-- Backfill existing status values into the new pipeline enum:
--   received  → new_lead
--   read      → contacted
--   completed → won
update public.inquiries set status = 'new_lead'  where status = 'received';
update public.inquiries set status = 'contacted' where status = 'read';
update public.inquiries set status = 'won'       where status = 'completed';

-- Drop any prior status default before adding the CHECK constraint
alter table public.inquiries alter column status set default 'new_lead';

-- Add CHECK constraints (drop+recreate so this migration is re-runnable)
alter table public.inquiries drop constraint if exists inquiries_status_check;
alter table public.inquiries add constraint inquiries_status_check
  check (status in (
    'new_lead', 'contacted', 'discovery_call', 'proposal',
    'won', 'lost', 'archived'
  ));

alter table public.inquiries drop constraint if exists inquiries_type_check;
alter table public.inquiries add constraint inquiries_type_check
  check (type in (
    'contact', 'newsletter', 'booking', 'reading',
    'consultation', 'general'
  ));

create index if not exists idx_inquiries_status      on public.inquiries (status);
create index if not exists idx_inquiries_type        on public.inquiries (type);
create index if not exists idx_inquiries_source_site on public.inquiries (source_site);

-- ────────────────────────────────────────────────────────────
-- 3. activity_log — audit trail (matches AIO shape)
-- ────────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  inquiry_id  uuid references public.inquiries(id) on delete cascade,
  person_id   uuid references public.people(id)    on delete cascade,
  action      text not null,
  details     jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_log_inquiry on public.activity_log (inquiry_id);
create index if not exists idx_activity_log_person  on public.activity_log (person_id);

-- RLS: admin-only access (RPCs run as SECURITY DEFINER and bypass this)
alter table public.activity_log enable row level security;

drop policy if exists "activity_log admin read" on public.activity_log;
create policy "activity_log admin read"
  on public.activity_log for select
  using (public.is_admin());

drop policy if exists "activity_log admin write" on public.activity_log;
create policy "activity_log admin write"
  on public.activity_log for all
  using (public.is_admin())
  with check (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- 4. Identity links — add person_id to clients + profiles
-- ────────────────────────────────────────────────────────────
-- Nullable, no FK yet. Slice 6 backfills then adds the FK.
alter table public.clients
  add column if not exists person_id uuid;

alter table public.profiles
  add column if not exists person_id uuid;

create index if not exists idx_clients_person_id  on public.clients  (person_id);
create index if not exists idx_profiles_person_id on public.profiles (person_id);

-- ────────────────────────────────────────────────────────────
-- 5. Verification queries (commented — for manual check after apply)
-- ────────────────────────────────────────────────────────────
-- -- All inquiry statuses must be valid:
-- select status, count(*) from public.inquiries group by status;
--
-- -- All inquiry types must be valid:
-- select type, count(*) from public.inquiries group by type;
--
-- -- people columns:
-- select column_name from information_schema.columns
--   where table_schema='public' and table_name='people';
--
-- -- activity_log exists and RLS on:
-- select relname, relrowsecurity from pg_class where relname='activity_log';
