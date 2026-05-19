-- ============================================================
-- 017_meeting_source_connections.sql — astrologer meeting sources
-- ============================================================
-- One row per (portal user × meeting source). Stores the OAuth
-- access/refresh tokens needed to call the source's API on the
-- user's behalf. RLS gates by auth.uid() = user_id so each
-- astrologer can only see their own connection rows.
--
-- TODO Phase 2: move access_token / refresh_token to Supabase Vault
-- once the Vault extension is enabled on the project.
-- ============================================================

create table if not exists public.meeting_source_connections (
  user_id           uuid        not null references auth.users(id) on delete cascade,
  source            text        not null
    check (source in ('krisp', 'zoom', 'google_meet')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  access_token      text        not null,
  refresh_token     text,
  token_expires_at  timestamptz,
  account_label     text,
  account_metadata  jsonb       default '{}'::jsonb,
  primary key (user_id, source)
);

alter table public.meeting_source_connections enable row level security;

create policy "users manage own meeting source connections"
  on public.meeting_source_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
