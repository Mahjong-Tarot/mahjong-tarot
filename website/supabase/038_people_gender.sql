-- ============================================================
-- 038_people_gender.sql — add gender to people
-- ============================================================
-- Purple Star calculation requires gender (and birth_time). Adding
-- the column to public.people so it can be filled in via the
-- /admin/people shelf and consumed by the Reading brief page.
-- ============================================================

alter table public.people
  add column if not exists gender text
    check (gender in ('M', 'F', 'NB') or gender is null);
