-- ============================================================
-- 036_drop_sessions.sql — retire the legacy sessions table
-- ============================================================
-- public.bookings now carries the operational fields (added in 035).
-- This drops public.sessions and cascades the FK references
-- (reports.session_id, etc.). Nothing else needs migrating because
-- the reports table is empty.
-- ============================================================

drop table if exists public.sessions cascade;
