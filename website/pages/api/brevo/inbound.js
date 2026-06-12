// POST /api/brevo/inbound?token=<BREVO_WEBHOOK_SECRET>
// Receives Brevo inbound-parsing payloads for mail sent to
// *@reply.mahjongtarot.com (campaign replies), stores each message in
// email_replies, and forwards a copy to Bill via Resend so his inbox
// workflow doesn't change. See docs/engineering/email-event-tracking.md.
//
// Same shared-secret auth as /api/brevo/webhook — Brevo doesn't sign
// payloads, so the token lives in the registered webhook URL.
import { timingSafeEqual } from 'crypto';
import { getServiceSupabase } from '../../../lib/stripe';
import { extractChineseSign } from '../../../lib/zodiac-harvest';

// Resolve the sender to a CRM contact — find-only, never create.
// Out-of-office autoresponders and forwards come from addresses that
// aren't contacts; creating people rows for them would pollute the CRM.
async function findPersonId(service, email) {
  const pattern = email.replace(/([%_\\])/g, '\\$1');
  const { data, error } = await service
    .from('people')
    .select('id')
    .ilike('email', pattern)
    .limit(1);
  if (error) {
    console.error('[brevo-inbound] person lookup failed', email, error);
    return null;
  }
  return data?.[0]?.id || null;
}

function isAuthorized(req) {
  const secret = process.env.BREVO_WEBHOOK_SECRET;
  if (!secret) return false;
  const provided = typeof req.query.token === 'string' ? req.query.token : '';
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Brevo inbound item → email_replies row. Payload shape documented at
// developers.brevo.com/docs/inbound-parse-webhooks (Items[] with From,
// To, Subject, RawTextBody, ExtractedMarkdownMessage, MessageId, …).
function toRow(item) {
  if (!item || typeof item !== 'object') return null;
  const fromEmail =
    typeof item.From?.Address === 'string' ? item.From.Address.trim().toLowerCase() : '';
  if (!fromEmail) return null;

  const sentAt = (() => {
    const d = item.SentAtDate ? new Date(item.SentAtDate) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
  })();

  // Strip bulky/binary fields from the stored payload; bodies are kept
  // in their own columns and attachments aren't downloaded.
  const { RawHtmlBody, Attachments, ...payload } = item;

  return {
    message_id: typeof item.MessageId === 'string' ? item.MessageId : null,
    from_email: fromEmail,
    from_name: typeof item.From?.Name === 'string' ? item.From.Name : null,
    to_email:
      typeof item.To?.[0]?.Address === 'string' ? item.To[0].Address.toLowerCase() : null,
    subject: typeof item.Subject === 'string' ? item.Subject : null,
    text_body:
      (typeof item.ExtractedMarkdownMessage === 'string' && item.ExtractedMarkdownMessage) ||
      (typeof item.RawTextBody === 'string' && item.RawTextBody) ||
      null,
    sent_at: sentAt,
    payload,
  };
}

// Forwards the reply to Bill so nothing changes about how he reads
// mail. reply_to is the original sender, so hitting Reply in Gmail
// goes straight back to them. Best-effort: a forward failure must not
// 500 the webhook (the row is already stored; Brevo would re-deliver
// and the dedup index would drop the duplicate, losing the forward).
async function forwardToBill(row) {
  const apiKey = process.env.RESEND_API_KEY;
  // Campaign replies belong in the firepig@ Workspace inbox — the same
  // address campaigns historically used as their reply-to. (The gmail
  // fallback used elsewhere sent the first two warm-up forwards to
  // Bill's personal Gmail instead; Yon expects them at firepig@.)
  const forwardTo =
    process.env.REPLY_FORWARD_TO || 'firepig@mahjongtarot.com';
  if (!apiKey) {
    console.warn('[brevo-inbound] forwarding skipped: RESEND_API_KEY not set');
    return null;
  }
  const sender = row.from_name ? `${row.from_name} <${row.from_email}>` : row.from_email;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>',
      to: [forwardTo],
      reply_to: row.from_email,
      subject: `[Campaign reply] ${row.subject || '(no subject)'}`,
      text: `From: ${sender}\nTo: ${row.to_email || '(unknown)'}\nSent: ${row.sent_at || '(unknown)'}\n\n${row.text_body || '(empty body)'}`,
    }),
  });
  if (!r.ok) {
    console.error('[brevo-inbound] forward failed', r.status, (await r.text()).slice(0, 200));
    return null;
  }
  return new Date().toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const rows = items.map(toRow).filter(Boolean);
  if (!rows.length) {
    return res.status(200).json({ received: true, stored: 0 });
  }

  const service = getServiceSupabase();
  let stored = 0;
  for (const row of rows) {
    row.person_id = await findPersonId(service, row.from_email);

    // Sign harvester: the reply-bait asks for the sender's zodiac
    // sign — record what they stated, and enrich the CRM contact if
    // their sign is still unknown. Never overwrites an existing one.
    const harvest = extractChineseSign(row.text_body);
    row.harvested_sign = harvest?.sign || null;
    row.harvest_basis = harvest?.basis || null;
    if (harvest && row.person_id) {
      const { error: signErr } = await service
        .from('people')
        .update({ chinese_sign: harvest.sign })
        .eq('id', row.person_id)
        .is('chinese_sign', null);
      if (signErr) console.error('[brevo-inbound] sign update failed', signErr);
    }

    const { data, error } = await service
      .from('email_replies')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      // 23505 = unique_violation on message_id: Brevo re-delivery.
      if (error.code === '23505') continue;
      console.error('[brevo-inbound] insert failed', error);
      // 500 so Brevo retries — inserts are idempotent via message_id.
      return res.status(500).json({ error: 'Storage failed' });
    }
    stored += 1;

    const forwardedAt = await forwardToBill(row);
    if (forwardedAt && data?.id) {
      await service.from('email_replies').update({ forwarded_at: forwardedAt }).eq('id', data.id);
    }
  }

  return res.status(200).json({ received: true, stored });
}
