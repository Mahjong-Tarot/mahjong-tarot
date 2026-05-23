-- ============================================================
-- 037_drop_clients.sql — retire the legacy clients table
-- ============================================================
-- All readers have been swapped to public.people (identity) and
-- public.bookings (operational reading data). The clients table
-- is no longer the source of truth for anything.
-- ============================================================

drop table if exists public.clients cascade;
