-- ============================================================
-- 024_sessions_payment.sql — offline payment tracking per session
-- ============================================================
-- Adds payment fields to public.sessions so the astrologer/admin
-- can note that a client paid (offline or otherwise) for a
-- specific reading session.
--
-- Numbered 024 because 022 is reserved for an in-flight member
-- subscriptions migration on the Stripe WIP branch, and 023 is
-- reserved for the CRM identity backfill (PR #256).
-- ============================================================

alter table public.sessions
  add column if not exists paid_at         timestamptz,
  add column if not exists payment_method  text,
  add column if not exists payment_amount  numeric(10, 2),
  add column if not exists payment_notes   text;

alter table public.sessions
  drop constraint if exists sessions_payment_method_check;
alter table public.sessions
  add constraint sessions_payment_method_check
  check (payment_method is null or payment_method in (
    'offline', 'stripe', 'other'
  ));

create index if not exists idx_sessions_paid_at on public.sessions (paid_at);

-- ────────────────────────────────────────────────────────────
-- log_session_payment — set/update payment on a session
-- ────────────────────────────────────────────────────────────
-- Used by the portal UI ("Log payment" button on the client
-- detail page). Caller must be a portal user (astrologer or admin)
-- and own the session via existing RLS on sessions, OR be admin.
-- The function runs as SECURITY DEFINER so it can write the
-- activity_log row regardless of RLS on that table.
-- ────────────────────────────────────────────────────────────
create or replace function public.log_session_payment(
  p_session_id    uuid,
  p_amount        numeric default null,
  p_paid_at       timestamptz default now(),
  p_payment_method text default 'offline',
  p_notes         text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role text;
  v_session_astrologer uuid;
begin
  -- Authorize: admin OR astrologer who owns the session
  select role into v_caller_role from public.profiles where user_id = auth.uid();
  if v_caller_role is null then
    raise exception 'forbidden: not signed in';
  end if;

  if v_caller_role <> 'admin' then
    select astrologer_id into v_session_astrologer
      from public.sessions where id = p_session_id;
    if v_session_astrologer is distinct from auth.uid() then
      raise exception 'forbidden: not your session';
    end if;
  end if;

  if p_payment_method not in ('offline', 'stripe', 'other') then
    raise exception 'invalid payment_method: %', p_payment_method;
  end if;

  update public.sessions
     set paid_at        = p_paid_at,
         payment_method = p_payment_method,
         payment_amount = p_amount,
         payment_notes  = p_notes,
         updated_at     = now()
   where id = p_session_id;

  insert into public.activity_log (person_id, action, details)
  select c.person_id, 'session_payment',
         jsonb_build_object(
           'session_id', p_session_id,
           'amount',     p_amount,
           'method',     p_payment_method,
           'paid_at',    p_paid_at
         )
    from public.sessions s
    join public.clients c on c.id = s.client_id
   where s.id = p_session_id;

  return p_session_id;
end;
$$;

grant execute on function public.log_session_payment(uuid, numeric, timestamptz, text, text) to authenticated;
