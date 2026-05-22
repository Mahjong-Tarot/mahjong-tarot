-- ============================================================
-- 022_member_subscriptions.sql — Stripe subscription state per user
-- ============================================================
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- Owns the self-serve member subscription lifecycle written by the
-- Stripe webhook at /api/stripe/webhook. One row per auth user.
--
-- The existing `clients.subscription_status` field (added in 018)
-- is the astrologer-portal CRM view and stays manually managed.
-- This table is the source of truth for whether a logged-in member
-- has paid for Member Area access.
-- ============================================================

create table if not exists public.member_subscriptions (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  plan                    text not null default 'founders'
    check (plan in ('founders', 'standard')),
  status                  text not null default 'incomplete'
    check (status in (
      'incomplete', 'incomplete_expired',
      'trialing', 'active', 'past_due',
      'canceled', 'unpaid', 'paused'
    )),
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  started_at              timestamptz,
  canceled_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists member_subscriptions_status_idx
  on public.member_subscriptions(status);

create index if not exists member_subscriptions_stripe_customer_idx
  on public.member_subscriptions(stripe_customer_id);

-- ────────────────────────────────────────────────────────────
-- RLS — users can read their own row only.
-- All writes happen via the Stripe webhook using the service-role
-- key, which bypasses RLS, so no insert/update policies are needed.
-- ────────────────────────────────────────────────────────────
alter table public.member_subscriptions enable row level security;

drop policy if exists "Users read own subscription"
  on public.member_subscriptions;
create policy "Users read own subscription"
  on public.member_subscriptions
  for select using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- updated_at trigger (reuses touch_updated_at() from migration 004)
-- ────────────────────────────────────────────────────────────
drop trigger if exists touch_member_subscriptions_updated_at
  on public.member_subscriptions;
create trigger touch_member_subscriptions_updated_at
  before update on public.member_subscriptions
  for each row execute function public.touch_updated_at();
