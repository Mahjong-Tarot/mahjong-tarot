-- ============================================================
-- 047_email_replies.sql — captured campaign replies
-- ============================================================
-- Stores emails sent to *@reply.mahjongtarot.com, parsed by
-- Brevo inbound parsing and POSTed to /api/brevo/inbound.
-- Each reply is also forwarded to Bill via Resend so his
-- workflow doesn't change (forwarded_at records that).
--
-- See docs/engineering/email-event-tracking.md (Phase 2).
--
-- RLS enabled with no policies: service-role only, same as
-- email_events — the admin dashboard reads via server routes.
-- ============================================================

create table if not exists public.email_replies (
  id            uuid primary key default gen_random_uuid(),
  message_id    text,            -- RFC 5322 Message-ID from the sender
  from_email    text not null,
  from_name     text,
  to_email      text,            -- which @reply.* address was written to
  subject       text,
  text_body     text,
  sent_at       timestamptz,
  forwarded_at  timestamptz,     -- set when the copy to Bill is sent
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- Brevo retries webhook deliveries; Message-ID is the natural
-- dedup key. Partial so legacy mail without one still stores.
create unique index if not exists email_replies_message_id_idx
  on public.email_replies (message_id)
  where message_id is not null;

create index if not exists email_replies_from_idx
  on public.email_replies (from_email);
create index if not exists email_replies_created_idx
  on public.email_replies (created_at desc);

alter table public.email_replies enable row level security;
