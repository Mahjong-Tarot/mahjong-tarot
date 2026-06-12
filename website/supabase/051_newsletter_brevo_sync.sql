-- ============================================================
-- 051_newsletter_brevo_sync.sql — auto-sync signups to Brevo
-- ============================================================
-- Implements the sync layer from email-system-overview.md
-- (Decision 1A): newsletter signups flow to Brevo automatically,
-- with Supabase staying the source of truth. Replaces the manual
-- "export before every send" chore from the campaign plan.
--
--   submit_newsletter RPC
--         │ inserts inquiries row (type='newsletter')
--         ▼
--   trigger → net.http_post → Brevo POST /v3/contacts
--             (async via pg_net; api key from Supabase Vault)
--
-- Design notes:
--   * BREVO_LIST_ID 9 = "OCA Master Deliverable" — the master
--     send list. updateEnabled=true makes the upsert idempotent
--     and additive (existing contacts gain the list, not lose
--     others).
--   * The API key lives in Supabase Vault under 'brevo_api_key',
--     set via the service-role-only RPC below — never in the
--     repo, never in migrations. Rotation = call the RPC again.
--   * pg_net is fire-and-forget: responses land in
--     net._http_response for ~6 hours. A failed call (Brevo
--     outage) is NOT retried — acceptable because campaign sends
--     are point-in-time; the admin can re-run the manual export
--     as backstop. Requires Brevo IP authorization to be OFF
--     (disabled 2026-06-12) since Supabase egress IPs vary.
--   * The trigger never raises: a sync failure must not break
--     the signup itself.
-- ============================================================

-- ─── 1. Vault setter (service-role only) ─────────────────────

create or replace function public.admin_set_brevo_vault_key(p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'brevo_api_key';
  if v_id is null then
    perform vault.create_secret(p_key, 'brevo_api_key', 'Brevo API key for newsletter sync trigger');
  else
    perform vault.update_secret(v_id, p_key);
  end if;
end;
$$;

revoke execute on function public.admin_set_brevo_vault_key(text) from public, anon, authenticated;

-- ─── 2. Sync trigger ──────────────────────────────────────────

create or replace function public.sync_newsletter_to_brevo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_name  text;
  v_key   text;
begin
  select email, name into v_email, v_name
  from public.people where id = new.person_id;
  if v_email is null then return new; end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'brevo_api_key';
  if v_key is null then
    raise warning 'sync_newsletter_to_brevo: vault secret brevo_api_key missing';
    return new;
  end if;

  perform net.http_post(
    url     := 'https://api.brevo.com/v3/contacts',
    headers := jsonb_build_object(
      'api-key', v_key,
      'Content-Type', 'application/json',
      'Accept', 'application/json'
    ),
    body    := jsonb_build_object(
      'email', v_email,
      'updateEnabled', true,
      'listIds', jsonb_build_array(9),
      'attributes', case
        when v_name is not null then jsonb_build_object('FIRSTNAME', v_name)
        else '{}'::jsonb
      end
    )
  );
  return new;
exception when others then
  -- Sync must never break the signup itself.
  raise warning 'sync_newsletter_to_brevo failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists trg_sync_newsletter_to_brevo on public.inquiries;
create trigger trg_sync_newsletter_to_brevo
  after insert on public.inquiries
  for each row
  when (new.type = 'newsletter')
  execute function public.sync_newsletter_to_brevo();
