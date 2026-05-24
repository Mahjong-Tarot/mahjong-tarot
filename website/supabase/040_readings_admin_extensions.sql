-- ============================================================
-- 040_readings_admin_extensions.sql
-- ============================================================
-- Extend public.readings so the admin Quick Reading tool can
-- persist multi-section astrologer readings alongside the
-- existing member-facing compatibility readings.
--
-- Existing rows are untouched: member compat rows keep type =
-- 'compatibility' with a slug. New admin rows store type =
-- 'admin', no slug, an array of which sections were rendered,
-- and the email HTML for replay in the admin "Past readings" tab.
-- ============================================================

alter table public.readings
  add column if not exists types   text[],
  add column if not exists html    text,
  add column if not exists sent_to text;

-- Admin rows do not have a slug, so the column needs to be nullable.
alter table public.readings
  alter column slug drop not null;

-- The old unique(user_id, slug) constraint blocks any second admin row
-- (both have slug = null). Replace with a partial unique index so
-- existing member rows (with slugs) stay unique per user, while
-- slug-less admin rows can coexist freely.
alter table public.readings
  drop constraint if exists readings_user_id_slug_key;

create unique index if not exists readings_user_id_slug_idx
  on public.readings (user_id, slug)
  where slug is not null;

-- Speeds up the "Past readings" tab query (per-astrologer, by type, newest first).
create index if not exists readings_user_type_created_idx
  on public.readings (user_id, type, created_at desc);
