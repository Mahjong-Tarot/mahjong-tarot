// POST /api/brevo/webhook?token=<BREVO_WEBHOOK_SECRET>
// Receives Brevo marketing-webhook events (delivered, opened, click,
// bounces, unsubscribe, spam) and mirrors them into the Supabase
// email_events table. See docs/engineering/email-event-tracking.md.
//
// Brevo does not sign webhook payloads, so authentication is a shared
// secret in the URL, compared in constant time. The webhook URL
// (including the token) is registered in Brevo and treated as a secret.
import { timingSafeEqual } from 'crypto';
import { getServiceSupabase } from '../../../lib/stripe';

function isAuthorized(req) {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret) return false;
  const provided = typeof req.query.token === 'string' ? req.query.token : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Brevo timestamps arrive in several shapes depending on event type:
// ts_event / ts (unix seconds), date / date_event ("YYYY-MM-DD HH:mm:ss").
function eventTimestamp(evt) {
  const unix = evt.ts_event ?? evt.ts;
  if (typeof unix === 'number' && unix > 0) {
    return new Date(unix * 1000).toISOString();
  }
  const text = evt.date_event || evt.date;
  if (typeof text === 'string') {
    const parsed = new Date(text.replace(' ', 'T'));
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

// Events that make an address unsendable. Brevo's exact event strings
// have varied across payload versions, so both spellings are matched.
// Maps to the nurture_status written on people (suppression reason).
const SUPPRESSING_EVENTS = {
  hard_bounce: 'bounced',
  hardbounce: 'bounced',
  spam: 'complained',
  complaint: 'complained',
  unsubscribe: 'unsubscribed',
  unsubscribed: 'unsubscribed',
};

// Marks the matching contact unsendable: ok_to_contact=false and
// nurture_status set to the suppression reason (anything other than
// 'active' drops them from the nurture-due index, migration 032).
// Idempotent; best-effort — a failure here must not 500 the webhook,
// or Brevo's retry would re-run an already-stored event forever.
async function suppressContact(service, email, eventType) {
  const status = SUPPRESSING_EVENTS[eventType];
  if (!status) return;
  // ilike for case-insensitive match (convention from lib/people.js),
  // with % and _ escaped — '_' is common in addresses and is an ILIKE
  // single-char wildcard, which could suppress the wrong contact.
  const pattern = email.replace(/([%_\\])/g, '\\$1');
  const { error } = await service
    .from('people')
    .update({ ok_to_contact: false, nurture_status: status })
    .ilike('email', pattern);
  if (error) console.error('[brevo-webhook] suppression failed', email, status, error);
}

function toRow(evt) {
  if (!evt || typeof evt !== 'object') return null;
  const email = typeof evt.email === 'string' ? evt.email.trim().toLowerCase() : '';
  const eventType = typeof evt.event === 'string' ? evt.event.trim().toLowerCase() : '';
  if (!email || !eventType) return null;

  const campaignId = Number.isInteger(evt.camp_id) ? evt.camp_id : null;
  const listIds = Array.isArray(evt.list_id)
    ? evt.list_id.filter((n) => Number.isInteger(n))
    : null;

  return {
    provider: 'brevo',
    event_type: eventType,
    email,
    campaign_id: campaignId,
    campaign_name: typeof evt['campaign name'] === 'string' ? evt['campaign name'] : null,
    url: typeof evt.URL === 'string' ? evt.URL : null,
    list_ids: listIds && listIds.length ? listIds : null,
    occurred_at: eventTimestamp(evt),
    payload: evt,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Brevo posts one JSON event per request, but batch mode sends an array.
  const events = Array.isArray(req.body) ? req.body : [req.body];
  const rows = events.map(toRow).filter(Boolean);
  if (!rows.length) {
    // Acknowledge unparseable payloads so Brevo doesn't retry them forever.
    return res.status(200).json({ received: true, stored: 0 });
  }

  // Insert one row at a time so a duplicate (unique_violation on the
  // dedup index, code 23505) doesn't sink the other rows in a batch.
  // Brevo sends single-event payloads in practice, so this stays cheap.
  const service = getServiceSupabase();
  let stored = 0;
  for (const row of rows) {
    const { error } = await service.from('email_events').insert(row);
    if (!error) {
      stored += 1;
    } else if (error.code !== '23505') {
      console.error('[brevo-webhook] insert failed', error);
      // 500 so Brevo retries — inserts are idempotent via the dedup index.
      return res.status(500).json({ error: 'Storage failed' });
    }
    // Runs even for deduped rows — the update is idempotent, and a
    // replay may be Brevo retrying after a suppression failure.
    await suppressContact(service, row.email, row.event_type);
  }

  return res.status(200).json({ received: true, stored });
}
