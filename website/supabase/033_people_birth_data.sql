-- ============================================================
-- 033_people_birth_data.sql — birth_time + birth_place on people
-- ============================================================
-- The reading flow needs birth_time and birth_place to compute the
-- Hour Pillar and (where culturally relevant) the longitude offset.
-- Today those columns only exist on the legacy `clients` table and
-- the per-booking copy in `bookings`. Move them to `people` so
-- there's one source of truth, then later PRs can drop `clients`.
--
-- Apply via:
--   supabase db query --linked --file <this>
--   (Backfill UPDATEs are separate from the ALTER because the
--    Management API plans statements eagerly.)
-- ============================================================

alter table public.people
  add column if not exists birth_time time,
  add column if not exists birth_place text;
