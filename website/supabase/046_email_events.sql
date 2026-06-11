-- ============================================================
-- 046_email_events.sql — Brevo email engagement event log
-- ============================================================
-- Stores marketing-email engagement events (delivered, opened,
-- click, bounce, unsubscribe, spam complaint) pushed by Brevo's
-- marketing webhook to POST /api/brevo/webhook.
--
-- Design notes:
--   * Supabase is the system of record for list health (see
--     docs/engineering/email-system-overview.md). Brevo keeps
--     its own dashboards; this table is our internal mirror so
--     engagement survives an ESP switch and can join against
--     people / deals for attribution.
--   * event_type stores Brevo's event string as-received
--     (lower-cased), no enum — Brevo has added event types
--     before and an enum would reject them.
--   * Dedup: Brevo retries failed deliveries and can replay
--     events. The unique index below makes inserts idempotent;
--     the API route swallows 23505 on conflict.
--   * RLS is enabled with no policies: only the service-role
--     key (server-side API routes) can read or write. The
--     admin dashboard reads via server routes, not the browser.
-- ============================================================

create table if not exists public.email_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null default 'brevo',
  event_type    text not null,
  email         text not null,
  campaign_id   bigint,
  campaign_name text,
  url           text,          -- clicked link, when event_type = 'click'
  list_ids      bigint[],      -- Brevo list ids attached to the event
  occurred_at   timestamptz not null,
  payload       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- Idempotency: one row per (provider, event, recipient, campaign,
-- moment). coalesce() folds NULL campaign ids (transactional or
-- list-level events) into a single bucket so the index still applies.
create unique index if not exists email_events_dedup_idx
  on public.email_events (provider, event_type, email, coalesce(campaign_id, 0), occurred_at);

create index if not exists email_events_email_idx
  on public.email_events (email);
create index if not exists email_events_campaign_idx
  on public.email_events (campaign_id)
  where campaign_id is not null;
create index if not exists email_events_occurred_idx
  on public.email_events (occurred_at desc);

alter table public.email_events enable row level security;
