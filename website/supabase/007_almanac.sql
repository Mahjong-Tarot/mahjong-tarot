-- ============================================================
-- Mahjong Tarot: Tong Shu Almanac
-- Migration: 007_almanac
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE: almanac_days
-- One row per Gregorian date. Backfilled from Lunar New Year (2026-02-17,
-- Year of the Fire Horse) and refreshed on demand by the encoder.
--
-- Driven by encoding/almanac.py — the 12 Day Officer rule cycles activity
-- verdicts deterministically off the day-vs-month branch pair. Score is the
-- weighted share of activities returning Lucky (Lucky=1, Normal=0.5, Unlucky=0).
-- ────────────────────────────────────────────────────────────
create table public.almanac_days (
  date              date primary key,
  weekday           text not null,
  pillars           jsonb not null,    -- {year: {element, sign}, month: {...}, day: {...}}
  lunar_day         int  not null,
  lunar_month       int  not null,
  is_leap_month     boolean not null default false,
  officer           jsonb not null,    -- {key, english, chinese, pinyin, gloss}
  year_conflict     text not null,     -- the day branch's directional opposite
  auspicious_hours  jsonb not null,    -- [{branch, chinese, range}, ...] (always 6)
  activities        jsonb not null,    -- {StartABusiness: 'Lucky'|'Normal'|'Unlucky', ... × 29}
  match_day         jsonb,             -- ['year_day'] | ['year_month'] | ['triple'] | null
  western_moment    text,              -- e.g. 'Independence Day (US)' or null
  holiday           text,              -- composed display text (lunar + western + match flags)
  score             int  not null,     -- 0-100
  tone              text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (tone in ('auspicious', 'favorable', 'neutral', 'cautionary', 'challenging')),
  check (score between 0 and 100),
  check (lunar_day between 1 and 30),
  check (lunar_month between 1 and 12)
);

create index almanac_days_date_idx on public.almanac_days (date desc);
create index almanac_days_tone_idx on public.almanac_days (tone);

-- Shared updated_at trigger function (idempotent — also defined in 006_horoscopes.sql)
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists almanac_days_updated_at on public.almanac_days;
create trigger almanac_days_updated_at
  before update on public.almanac_days
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- VIEW: almanac_day_summary
-- One row per day with the calendar-cell essentials (no per-activity detail).
-- Drives the monthly almanac calendar.
-- ────────────────────────────────────────────────────────────
create or replace view public.almanac_day_summary as
  select
    date,
    weekday,
    pillars,
    lunar_day,
    lunar_month,
    officer->>'english'  as officer_english,
    officer->>'chinese'  as officer_chinese,
    year_conflict,
    score,
    tone,
    match_day,
    western_moment,
    holiday
  from public.almanac_days;

-- ────────────────────────────────────────────────────────────
-- VIEW: almanac_today
-- Today's almanac in America/Los_Angeles (matches the horoscope cron timezone).
-- Convenient for the dashboard widget.
-- ────────────────────────────────────────────────────────────
create or replace view public.almanac_today as
  select * from public.almanac_days
  where date = (now() at time zone 'America/Los_Angeles')::date;

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Members-only by default: read requires an authenticated session.
-- Service role retains full access for the encoder backfill.
-- ────────────────────────────────────────────────────────────
alter table public.almanac_days enable row level security;

create policy "authenticated can read almanac_days"
  on public.almanac_days for select
  to authenticated
  using (true);

create policy "service role full access to almanac_days"
  on public.almanac_days for all
  to service_role
  using (true)
  with check (true);

grant select on public.almanac_day_summary to authenticated;
grant select on public.almanac_today       to authenticated;
