-- ============================================================
-- 018_astrologer_portal.sql — clients, sessions, reports + RLS
-- ============================================================
-- Three tables that back the Astrologer Portal:
--   clients   — people the practitioner reads for
--   sessions  — scheduled or completed readings
--   reports   — generated write-ups sent to clients
--
-- All gated by is_portal_user() (from 016_roles.sql) — only
-- profiles with role 'astrologer' or 'admin' can read/write.
-- An extra read-only policy on reports lets clients see their
-- own ready/sent reports (no UI for this in v1, but RLS is wired).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- CLIENTS
-- ────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id                       uuid primary key default gen_random_uuid(),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  user_id                  uuid references auth.users(id) on delete set null,
  full_name                text not null,
  email                    text,
  phone                    text,
  birthday                 date,
  birth_time               time,
  birth_place              text,
  gender                   text,
  notes                    text,
  subscription_status      text not null default 'none'
    check (subscription_status in ('none', 'active', 'lapsed', 'cancelled')),
  subscription_started_at  timestamptz,
  subscription_ended_at    timestamptz,
  created_by               uuid references auth.users(id) on delete set null
);

create index if not exists clients_full_name_idx           on public.clients(full_name);
create index if not exists clients_email_idx               on public.clients(email);
create index if not exists clients_user_id_idx             on public.clients(user_id);
create index if not exists clients_subscription_status_idx on public.clients(subscription_status);

-- ────────────────────────────────────────────────────────────
-- SESSIONS
-- A scheduled or completed reading. Links to ONE external
-- meeting via (meeting_source, meeting_external_id).
-- ────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  client_id            uuid not null references public.clients(id) on delete cascade,
  astrologer_id        uuid not null references auth.users(id) on delete restrict,
  scheduled_at         timestamptz not null,
  duration_minutes     int default 60,
  status               text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'no_show', 'cancelled')),
  meeting_source       text check (meeting_source in ('krisp', 'zoom', 'google_meet')),
  meeting_external_id  text,
  prep_notes           text,
  post_call_notes      text
);

create index if not exists sessions_scheduled_at_idx  on public.sessions(scheduled_at);
create index if not exists sessions_client_id_idx     on public.sessions(client_id);
create index if not exists sessions_astrologer_id_idx on public.sessions(astrologer_id);
create index if not exists sessions_status_idx        on public.sessions(status);
create index if not exists sessions_meeting_lookup_idx
  on public.sessions(meeting_source, meeting_external_id);

-- ────────────────────────────────────────────────────────────
-- REPORTS
-- Snapshot of source data + generated body, with status flow:
--   draft → generating → ready → sent
--   (or → failed from generating)
-- ────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  client_id            uuid not null references public.clients(id) on delete cascade,
  session_id           uuid references public.sessions(id) on delete set null,
  generated_by         uuid references auth.users(id) on delete set null,
  meeting_source       text,
  meeting_external_id  text,
  source_transcript    text,
  source_summary       text,
  status               text not null default 'draft'
    check (status in ('draft', 'generating', 'ready', 'sent', 'failed')),
  title                text,
  body_markdown        text,
  sent_at              timestamptz,
  sent_to_email        text,
  email_message_id     text,
  generation_error     text
);

create index if not exists reports_client_id_idx  on public.reports(client_id);
create index if not exists reports_session_id_idx on public.reports(session_id);
create index if not exists reports_status_idx     on public.reports(status);

-- ────────────────────────────────────────────────────────────
-- RLS
-- ────────────────────────────────────────────────────────────
alter table public.clients  enable row level security;
alter table public.sessions enable row level security;
alter table public.reports  enable row level security;

create policy "portal users full access on clients"
  on public.clients for all
  using (public.is_portal_user())
  with check (public.is_portal_user());

create policy "portal users full access on sessions"
  on public.sessions for all
  using (public.is_portal_user())
  with check (public.is_portal_user());

create policy "portal users full access on reports"
  on public.reports for all
  using (public.is_portal_user())
  with check (public.is_portal_user());

-- End-user read access for their own ready/sent reports.
-- No UI consumes this in v1 — RLS is in place ready for a future
-- client-facing report-reader feature.
create policy "clients read own reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.clients c
      where c.id = reports.client_id
        and c.user_id = auth.uid()
    )
    and status in ('ready', 'sent')
  );
