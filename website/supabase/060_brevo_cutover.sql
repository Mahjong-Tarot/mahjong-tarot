-- 060_brevo_cutover.sql: marketing platform port, Resend replaces Brevo.
--
-- Newsletter signups stop syncing to Brevo list 9 (051's trigger). The
-- audience is now public.people.marketing_consent, mailed by the marketing
-- platform through Resend (docs/engineering/2026-09-28-marketing-platform-port.md,
-- decision "Resend broadcasts replace Brevo"). 051's function, the Brevo vault
-- key and public.email_events (Brevo's event history, still fed by
-- /api/brevo/webhook for past campaigns) are left in place.
--
-- A newsletter signup is an explicit opt-in, so it (re)subscribes the person:
-- submit_newsletter upserts people without touching consent, which would leave
-- someone who once unsubscribed unsubscribed after signing up again.

drop trigger if exists trg_sync_newsletter_to_brevo on public.inquiries;

create or replace function public.newsletter_signup_subscribes()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.type = 'newsletter' and new.person_id is not null then
    update public.people
       set marketing_consent = 'subscribed',
           marketing_consent_source = 'newsletter_signup',
           marketing_consent_at = now()
     where id = new.person_id
       and marketing_consent <> 'subscribed';
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_newsletter_signup_subscribes on public.inquiries;
create trigger trg_newsletter_signup_subscribes after insert on public.inquiries
  for each row execute function public.newsletter_signup_subscribes();
