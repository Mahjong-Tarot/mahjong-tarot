-- ============================================================
-- 050_email_replies_harvested_sign.sql — sign harvester audit trail
-- ============================================================
-- The inbound handler now extracts the Chinese zodiac sign stated
-- in a reply (lib/zodiac-harvest.js) and, when the linked contact
-- has no chinese_sign yet, writes it to people. harvested_sign on
-- the reply records what was extracted — the audit trail that lets
-- staff spot a bad extraction and see where a contact's sign came
-- from. 'year' basis values are approximate (lunar new year edge).
-- ============================================================

alter table public.email_replies
  add column if not exists harvested_sign  text,
  add column if not exists harvest_basis   text;  -- 'stated' | 'year'

-- Backfill the two warm-up replies already processed manually:
-- "Fire Rooster" and "Eart Monkey 1968" — both stated outright.
update public.email_replies
set harvested_sign = 'Rooster', harvest_basis = 'stated'
where from_email = 'mfdesmond@gmail.com' and harvested_sign is null;

update public.email_replies
set harvested_sign = 'Monkey', harvest_basis = 'stated'
where from_email = 'amlnp68@gmail.com' and harvested_sign is null;
