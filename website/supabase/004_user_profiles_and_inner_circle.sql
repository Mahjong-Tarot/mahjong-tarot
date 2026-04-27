-- ============================================================
-- Mahjong Tarot: User Profiles + Inner Circle
-- Migration: 004_user_profiles_and_inner_circle
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TABLE: profiles
-- One row per authenticated user, holds birth data + cached BaZi
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  name        text,
  birthday    date,
  birth_time  time,
  birth_place text,
  gender      text check (gender in ('M', 'F') or gender is null),
  pillars     jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- TABLE: inner_circle
-- People associated with a user (wife, parents, kids, gf, etc)
-- ────────────────────────────────────────────────────────────
create table public.inner_circle (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  relationship text not null,
  birthday     date,
  birth_time   time,
  birth_place  text,
  gender       text check (gender in ('M', 'F') or gender is null),
  pillars      jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index inner_circle_user_id_idx on public.inner_circle(user_id);

alter table public.inner_circle enable row level security;

create policy "Users read own circle" on public.inner_circle
  for select using (auth.uid() = user_id);

create policy "Users insert into own circle" on public.inner_circle
  for insert with check (auth.uid() = user_id);

create policy "Users update own circle" on public.inner_circle
  for update using (auth.uid() = user_id);

create policy "Users delete from own circle" on public.inner_circle
  for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- updated_at trigger
-- ────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger touch_inner_circle_updated_at
  before update on public.inner_circle
  for each row execute function public.touch_updated_at();
