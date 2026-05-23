-- ============================================================
-- 025_orders.sql — generic orders/payments record
-- ============================================================
-- Each row = one money-in event, regardless of what was sold.
-- Used to power the Sales page filter:
--   All | Subscriptions | Books | Private Readings
--
-- A row may optionally reference a session_id (for reading
-- payments — though sessions also carry their own paid_at via
-- migration 024; orders is the canonical record), a client_id
-- (for subscription / readings on a known client), or a
-- person_id (for book sales where no client record exists).
-- ============================================================

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  paid_at         timestamptz,
  type            text not null
                    check (type in ('subscription', 'book', 'reading', 'other')),
  status          text not null default 'paid'
                    check (status in ('paid', 'pending', 'refunded', 'cancelled')),
  amount          numeric(10, 2) not null,
  currency        text not null default 'USD',
  payment_method  text
                    check (payment_method is null or payment_method in (
                      'offline', 'stripe', 'other'
                    )),
  -- Identity: one of these should be set
  person_id       uuid references public.people(id)  on delete set null,
  client_id       uuid references public.clients(id) on delete set null,
  session_id      uuid references public.sessions(id) on delete set null,
  -- Optional product details
  product_title   text,
  notes           text,
  created_by      uuid
);

create index if not exists idx_orders_paid_at on public.orders (paid_at desc);
create index if not exists idx_orders_type    on public.orders (type);
create index if not exists idx_orders_status  on public.orders (status);
create index if not exists idx_orders_person  on public.orders (person_id);
create index if not exists idx_orders_client  on public.orders (client_id);
create index if not exists idx_orders_session on public.orders (session_id);

-- updated_at trigger
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- RLS — admin-only writes; admin reads.
-- (Astrologer doesn't see orders directly; they see their own
-- sessions.paid_at via the existing sessions RLS.)
-- ────────────────────────────────────────────────────────────
alter table public.orders enable row level security;

drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "orders admin write" on public.orders;
create policy "orders admin write"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());
