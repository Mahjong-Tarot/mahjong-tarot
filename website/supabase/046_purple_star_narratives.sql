-- ============================================================
-- Mahjong Tarot: Purple Star (Zi Wei Dou Shu) narrative bank
-- Migration: 046_purple_star_narratives
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE: purple_star_narratives
-- Bill's authored report narratives, normalized into one keyed lookup so
-- future report sections (decades, years, next-12-months) extend it without
-- new tables.
--
--   category  e.g. 'palace_conclusion' | 'palace_luckiest'
--   key1      the primary key for the category (e.g. palace name 'Ming')
--   key2      the secondary key (e.g. luck category 'mostLucky', or
--             'luckiest' / 'unluckiest'); '' when not applicable
--   scope     'decade' | 'year' | 'this_year' | 'month'; '' for timeless text
--   text      the narrative
--
-- Canonical editable store. The app currently reads the generated read-model
-- in website/data/purple-star-palaces.json; regenerate that from this table
-- (or the source workbook) when it changes.
-- ────────────────────────────────────────────────────────────
create table public.purple_star_narratives (
  category text not null,
  key1     text not null,
  key2     text not null default '',
  scope    text not null default '',
  text     text not null,
  primary key (category, key1, key2, scope)
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — public reference content (read-only for anon +
-- authenticated). RLS filters rows; the table-level GRANT is also required
-- or anon reads return "permission denied" (precedent: reading_types in 001).
-- Staff edits go through the service role, which bypasses RLS.
-- ────────────────────────────────────────────────────────────
alter table public.purple_star_narratives enable row level security;

create policy "anon can read purple_star_narratives"
  on public.purple_star_narratives for select
  to anon
  using (true);

create policy "authenticated can read purple_star_narratives"
  on public.purple_star_narratives for select
  to authenticated
  using (true);

grant select on public.purple_star_narratives to anon;
grant select on public.purple_star_narratives to authenticated;
