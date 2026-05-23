-- ============================================================
-- 029_disable_rls_people_inquiries.sql
-- Temporarily disable RLS on people + inquiries so the
-- /admin/people page can read them with the anon JWT.
--
-- SECURITY NOTE: with RLS off, anyone holding the public anon
-- key (which ships in the website JS bundle) can SELECT every
-- row from these tables. Acceptable per owner's instruction
-- "no RLS for now, we'll deal with security later".
-- TODO: re-enable RLS and add SELECT policies for is_admin()
--       before opening the public site further.
-- ============================================================

alter table public.people     disable row level security;
alter table public.inquiries  disable row level security;
