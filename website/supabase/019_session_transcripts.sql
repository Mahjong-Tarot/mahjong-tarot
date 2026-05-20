-- ============================================================
-- 019_session_transcripts.sql — session transcript + summary fields
-- ============================================================
-- Adds two optional text columns to public.sessions so a
-- practitioner (or an admin acting on their behalf) can paste the
-- meeting transcript and a high-level summary into the session
-- record after the call.
--
-- The polished, client-facing write-up still lives on
-- public.reports.body_markdown (added in 018_astrologer_portal.sql).
-- Storing the raw transcript on the session keeps the meeting
-- artifacts separate from the report artifact, and lets the
-- transcript exist before any report row has been created.
--
-- RLS note: existing policies on sessions/reports already gate on
-- is_portal_user(), which returns true for both 'astrologer' and
-- 'admin' roles. Admins can therefore already edit any astrologer's
-- session/report rows — no new policies needed for the
-- admin-acts-on-Bill's-behalf flow.
-- ============================================================

alter table public.sessions
  add column if not exists transcript_text  text,
  add column if not exists summary_text     text;
