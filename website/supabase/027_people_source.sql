-- ============================================================
-- 027_people_source.sql
-- Add a free-text `source` column to public.people so we can
-- distinguish where a contact came from (legacy_customers,
-- legacy_leads, contact form, etc.). Nullable, no check
-- constraint — kept open for future values.
-- ============================================================

alter table public.people
  add column if not exists source text;

create index if not exists idx_people_source on public.people (source);
