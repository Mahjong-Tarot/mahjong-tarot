-- ============================================================
-- 049_email_replies_person_link.sql — replies ↔ CRM contacts
-- ============================================================
-- The first warm-up replies arrived with no connection to the
-- people table, so nothing surfaced on the contact's CRM record.
-- Adds the link and backfills existing rows by email match.
--
-- person_id is nullable on purpose: out-of-office autoresponders
-- and forwards arrive from addresses that aren't contacts, and we
-- deliberately do NOT create CRM records for those (the inbound
-- handler resolves find-only, never find-or-create).
-- ============================================================

alter table public.email_replies
  add column if not exists person_id uuid references public.people(id) on delete set null;

create index if not exists email_replies_person_idx
  on public.email_replies (person_id)
  where person_id is not null;

-- Backfill: case-insensitive email match, same convention the app
-- uses (lib/people.js matches with ilike).
update public.email_replies r
set person_id = p.id
from public.people p
where r.person_id is null
  and lower(p.email) = r.from_email;
