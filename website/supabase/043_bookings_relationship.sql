-- ============================================================
-- 043_bookings_relationship.sql — relationship / second-person data
-- ============================================================
-- Most private readings are relationship readings. This adds the
-- second person's chart data directly onto the booking so it is
-- captured at intake (book-a-reading) AND editable in the admin
-- prep tab (/admin/private-readings/[id]).
--
--   is_relationship    — true when the reading is about the guest's
--                        relationship with another person.
--   partner_*          — the other person's chart inputs. Only
--                        partner_birthday is needed for Bazi; time +
--                        gender unlock the Hour Pillar and Purple Star.
--
-- Additive only — all columns nullable, no RLS changes (staff already
-- have full access to bookings via existing policies). Safe to run in
-- the Supabase SQL Editor in one shot (single ALTER, no DDL+DML mix).
-- ============================================================

alter table public.bookings
  add column if not exists is_relationship    boolean not null default false,
  add column if not exists partner_name       text,
  add column if not exists partner_birthday   date,
  add column if not exists partner_birth_time time,
  add column if not exists partner_gender     text;
