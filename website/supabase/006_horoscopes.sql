-- ============================================================
-- Mahjong Tarot: Daily Horoscopes
-- Migration: 006_horoscopes
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================
--
-- TABLE: horoscopes
--   One row per (date, scope, category). Backfilled from 2026-02-17 (Lunar New Year,
--   Year of the Fire Horse) and updated daily by a GitHub Actions workflow.
--   scope:    'general' = day-level reading, OR one of the 12 zodiac animals lowercased
--   category: 'general' | 'love' | 'money'
--   score:    0-100, the day's primary score
--   tone:     auspicious | favorable | neutral | cautionary | challenging
--   status:   published | pending | rejected
--
-- The em-dash (U+2014) and en-dash (U+2013) are forbidden via check constraints
-- using chr() so the SQL stays pure ASCII and survives clipboard mangling.

create table if not exists public.horoscopes (
  date            date        not null,
  scope           text        not null,
  category        text        not null,
  text            text        not null,
  score           int         not null,
  tone            text        not null,
  signal_payload  jsonb       not null,
  status          text        not null default 'published',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  primary key (date, scope, category),
  check (scope    in ('general','rat','ox','tiger','rabbit','dragon','snake','horse','sheep','monkey','rooster','dog','pig')),
  check (category in ('general','love','money')),
  check (tone     in ('auspicious','favorable','neutral','cautionary','challenging')),
  check (status   in ('published','pending','rejected')),
  check (score between 0 and 100),
  check (position(chr(8212) in text) = 0),
  check (position(chr(8211) in text) = 0));

create index if not exists horoscopes_date_idx        on public.horoscopes (date desc);
create index if not exists horoscopes_date_scope_idx  on public.horoscopes (date desc, scope);
create index if not exists horoscopes_status_idx      on public.horoscopes (status) where status <> 'published';

drop trigger if exists touch_horoscopes_updated_at on public.horoscopes;
create trigger touch_horoscopes_updated_at before update on public.horoscopes for each row execute function public.touch_updated_at();

create or replace view public.horoscope_day_summary as
  select date, score as general_score, tone as general_tone,
         signal_payload->'pillars'         as pillars,
         signal_payload->'match_day'       as match_day,
         signal_payload->>'western_moment' as western_moment
  from public.horoscopes
  where scope = 'general' and category = 'general' and status = 'published';

create or replace view public.horoscope_today as
  select * from public.horoscopes
  where status = 'published' and date = (now() at time zone 'America/Los_Angeles')::date;

create table if not exists public.horoscope_runs (
  id            uuid        primary key default gen_random_uuid(),
  run_at        timestamptz not null    default now(),
  target_date   date        not null,
  status        text        not null    check (status in ('success','partial','failed')),
  generated     int         not null    default 0,
  failed        int         not null    default 0,
  error_message text,
  duration_ms   int);

create index if not exists horoscope_runs_recent_idx on public.horoscope_runs (run_at desc);

alter table public.horoscopes     enable row level security;
alter table public.horoscope_runs enable row level security;

drop policy if exists "public can read published horoscopes" on public.horoscopes;
create policy "public can read published horoscopes" on public.horoscopes for select using (status = 'published');

drop policy if exists "service role full access to horoscopes" on public.horoscopes;
create policy "service role full access to horoscopes" on public.horoscopes for all to service_role using (true) with check (true);

drop policy if exists "service role full access to horoscope_runs" on public.horoscope_runs;
create policy "service role full access to horoscope_runs" on public.horoscope_runs for all to service_role using (true) with check (true);

grant select on public.horoscope_day_summary to anon, authenticated;
grant select on public.horoscope_today       to anon, authenticated;
