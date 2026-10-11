-- ============================================================
-- 063_lock_profile_role.sql — SEC-01
-- ============================================================
-- "Users update own profile" (004) lets a signed-in user UPDATE every column
-- of their own row, including role. Every admin gate (lib/guards.js,
-- kernel/identity/admin-auth.ts, is_admin()/is_portal_user()) trusts
-- profiles.role, so any member could PATCH themselves to 'admin'.
--
-- This trigger refuses any change to the privileged columns (role,
-- person_id, user_id, and the billing/premium flags the Stripe webhook owns)
-- unless the writer is:
--   * the service role (API routes, webhooks, scripts), by JWT claim or role,
--   * a database owner/admin role (SQL editor, migrations,
--     seed-astrologers.sql, SECURITY DEFINER functions owned by postgres),
--   * an admin (public.is_admin()).
-- A self-insert must keep the defaults (role 'member', no person link, not
-- premium).
--
-- A column-level `revoke update (role, ...)` is not used: Supabase grants
-- table-level UPDATE to authenticated, and a column revoke is a no-op while
-- the table-level grant stands. The trigger is the enforcement point.
-- ============================================================

create or replace function public.profiles_lock_privileged_columns()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  claims text := nullif(current_setting('request.jwt.claims', true), '');
  jwt_role text := coalesce(claims::jsonb ->> 'role', '');
begin
  if jwt_role = 'service_role'
     or current_user in ('service_role', 'postgres', 'supabase_admin', 'supabase_auth_admin')
     or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role is distinct from 'member'
       or new.person_id is not null
       or coalesce(new.is_premium, false)
       or new.membership_type is not null
       or new.premium_expires_at is not null
       or new.stripe_customer_id is not null
       or new.stripe_subscription_id is not null then
      raise exception 'profiles: role, person link and membership fields are set by staff only'
        using errcode = '42501';
    end if;
  else
    if new.role is distinct from old.role
       or new.user_id is distinct from old.user_id
       or new.person_id is distinct from old.person_id
       or new.is_premium is distinct from old.is_premium
       or new.membership_type is distinct from old.membership_type
       or new.premium_expires_at is distinct from old.premium_expires_at
       or new.stripe_customer_id is distinct from old.stripe_customer_id
       or new.stripe_subscription_id is distinct from old.stripe_subscription_id then
      raise exception 'profiles: role, person link and membership fields are set by staff only'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_lock_privileged_columns on public.profiles;
create trigger profiles_lock_privileged_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_lock_privileged_columns();

-- Belt and braces: the self-service policies also pin the row to its owner.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
