-- ============================================================
-- Mahjong Tarot: open the almanac for public read
-- Migration: 014_almanac_public_read
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
--
-- E1 · Daily Almanac requires the logged-out home page to lead with
-- today's almanac. The data is deterministic public content; previous
-- RLS limited reads to authenticated users only.
-- ============================================================

create policy "anon can read almanac_days"
  on public.almanac_days for select
  to anon
  using (true);

grant select on public.almanac_day_summary to anon;
grant select on public.almanac_today       to anon;
