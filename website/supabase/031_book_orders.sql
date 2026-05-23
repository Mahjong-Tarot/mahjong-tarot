-- ============================================================
-- 031_book_orders.sql — pre-order rows for The Mahjong Mirror
-- ============================================================
-- One row per Stripe Checkout Session that completed for a book
-- pre-order (digital / hardcopy / signed_bundle). The webhook
-- upserts on stripe_session_id so re-deliveries are idempotent.
-- ============================================================

create table if not exists public.book_orders (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  email                     text not null,
  full_name                 text,
  phone                     text,
  sku                       text not null
                              check (sku in ('digital', 'hardcopy', 'signed_bundle')),
  amount_cents              integer,
  currency                  text not null default 'usd',
  status                    text not null default 'paid'
                              check (status in ('paid', 'refunded', 'cancelled')),
  shipping_name             text,
  shipping_line1            text,
  shipping_line2            text,
  shipping_city             text,
  shipping_state            text,
  shipping_postal_code      text,
  shipping_country          text,
  stripe_session_id         text unique,
  stripe_payment_intent_id  text,
  notes                     text
);

create index if not exists idx_book_orders_created_at on public.book_orders (created_at desc);
create index if not exists idx_book_orders_sku        on public.book_orders (sku);
create index if not exists idx_book_orders_status     on public.book_orders (status);
create index if not exists idx_book_orders_email      on public.book_orders (lower(email));

-- ────────────────────────────────────────────────────────────
-- RLS — admin-only read/write. Webhook uses service-role key
-- which bypasses RLS.
-- ────────────────────────────────────────────────────────────
alter table public.book_orders enable row level security;

drop policy if exists "book_orders admin read" on public.book_orders;
create policy "book_orders admin read"
  on public.book_orders for select
  using (public.is_admin());

drop policy if exists "book_orders admin write" on public.book_orders;
create policy "book_orders admin write"
  on public.book_orders for all
  using (public.is_admin())
  with check (public.is_admin());
