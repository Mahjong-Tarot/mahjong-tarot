-- ============================================================
-- 044_readings_public_token.sql
-- ============================================================
-- Quick Reading share links + multi-recipient email.
--
-- 1. public_token: token-only public URL (/reading/q/<token>) the
--    astrologer can copy from the Quick Reading drawer. Backfilled
--    for existing admin quick readings so old rows are shareable.
-- 2. UPDATE policy: the readings table only had select/insert/delete
--    policies, so the email endpoint could not record recipients in
--    sent_to. Owners may now update their own rows.
-- ============================================================

alter table public.readings
  add column if not exists public_token text;

create unique index if not exists readings_public_token_idx
  on public.readings (public_token)
  where public_token is not null;

update public.readings
  set public_token = replace(gen_random_uuid()::text, '-', '')
  where type = 'admin' and public_token is null;

drop policy if exists "Users update own readings" on public.readings;
create policy "Users update own readings" on public.readings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
