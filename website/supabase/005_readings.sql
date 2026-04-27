-- ============================================================
-- Mahjong Tarot: Saved compatibility readings
-- Migration: 005_readings
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

create table public.readings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  slug                text not null,
  type                text not null default 'compatibility',

  person1_name        text,
  person1_birthday    date,
  person1_birth_time  time,
  person1_gender      text,

  person2_name        text,
  person2_birthday    date,
  person2_birth_time  time,
  person2_gender      text,

  rating              numeric,
  report              jsonb,

  created_at          timestamptz not null default now(),
  unique (user_id, slug)
);

create index readings_user_created_idx on public.readings (user_id, created_at desc);

alter table public.readings enable row level security;

create policy "Users read own readings" on public.readings
  for select using (auth.uid() = user_id);

create policy "Users insert own readings" on public.readings
  for insert with check (auth.uid() = user_id);

create policy "Users delete own readings" on public.readings
  for delete using (auth.uid() = user_id);
