-- ============================================================
-- Mahjong Tarot: Purple Star (Zi Wei Dou Shu) star reference
-- Migration: 044_purple_star_stars
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE: purple_star_stars
-- One row per iztro star (66 total). Canonical reference for how each
-- star is displayed across the site. iztro_key is the stable identifier
-- emitted by the iztro library; hanzi/pinyin are the source-of-truth
-- transliteration; name is Bill's curated English name.
--
-- DISPLAY CONTRACT: render `name` only when name_status = 'locked';
-- otherwise fall back to `pinyin || ' ' || hanzi`. iztro's English
-- nicknames are never shown publicly.
--
-- name_status allowed values: locked | draft | resting | unnamed
-- ────────────────────────────────────────────────────────────
create table public.purple_star_stars (
  iztro_key    text primary key,
  hanzi        text not null,
  pinyin       text not null,
  bill_kind    text,
  element      text,
  court_role   text,
  name         text,
  name_status  text not null default 'unnamed',
  legacy_alias text
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Public reference content: readable by anon and authenticated. Staff
-- edits happen through the service role, which bypasses RLS, so no
-- insert/update/delete policy is defined here.
--
-- NOTE: RLS only filters *which rows* a role may read — the role must
-- also hold the table-level SELECT grant (precedent: reading_types in
-- migration 001). Granting select without the grant returns
-- "permission denied for table" for anon.
-- ────────────────────────────────────────────────────────────
alter table public.purple_star_stars enable row level security;

create policy "anon can read purple_star_stars"
  on public.purple_star_stars for select
  to anon
  using (true);

create policy "authenticated can read purple_star_stars"
  on public.purple_star_stars for select
  to authenticated
  using (true);

grant select on public.purple_star_stars to anon;
grant select on public.purple_star_stars to authenticated;
