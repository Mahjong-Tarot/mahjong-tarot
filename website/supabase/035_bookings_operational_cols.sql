-- ============================================================
-- 035_bookings_operational_cols.sql — fold sessions into bookings
-- ============================================================
-- Adds the operational columns that today live on public.sessions
-- onto public.bookings, so a booking becomes the single record for
-- a reading (reservation + delivery + transcript + notes).
--
-- The sessions table is NOT dropped in this migration — that comes
-- next, after readers are switched to bookings. This PR just makes
-- the columns available + backfills existing session data.
--
-- Apply as individual statements (Supabase Management API can't run
-- DDL+DML against the same new column in one batch).
-- ============================================================

alter table public.bookings
  add column if not exists meeting_source       text,
  add column if not exists meeting_external_id  text,
  add column if not exists prep_notes           text,
  add column if not exists post_call_notes      text,
  add column if not exists transcript_text      text,
  add column if not exists summary_text         text;
