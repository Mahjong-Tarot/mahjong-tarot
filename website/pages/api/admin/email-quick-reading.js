// Emails a saved Quick Reading to one or more recipients. The reading is
// looked up with the caller's user-scoped supabase client, so the readings
// RLS policy guarantees an astrologer can only send their own readings.
// Each recipient gets an individual email (no shared To: line).

import { requireApi } from '../../../lib/guards';

const REPLY_TO = process.env.RESEND_REPLY_TO || 'firepig01@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_RECIPIENTS = 10;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('staff')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase } = auth;

  const { id, emails } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: 'id is required.' });
  }
  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Enter at least one email address.' });
  }
  if (emails.length > MAX_RECIPIENTS) {
    return res.status(400).json({ error: `At most ${MAX_RECIPIENTS} recipients per send.` });
  }
  for (const e of emails) {
    if (typeof e !== 'string' || !EMAIL_RE.test(e)) {
      return res.status(400).json({ error: `Invalid email address: ${e}` });
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  const { data: reading, error: readErr } = await supabase
    .from('readings')
    .select('id, person1_name, html, sent_to')
    .eq('id', id)
    .maybeSingle();
  if (readErr) return res.status(500).json({ error: readErr.message });
  if (!reading?.html) return res.status(404).json({ error: 'Reading not found.' });

  const subjectLine = `Your Mahjong Tarot reading${reading.person1_name ? ` — ${reading.person1_name}` : ''}`;

  const sent = [];
  for (const to of emails) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: subjectLine,
        html: reading.html,
        reply_to: REPLY_TO,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Resend error (email-quick-reading):', data);
      return res.status(response.status).json({
        error: data.message || `Failed to send to ${to}.`,
        sentTo: sent,
      });
    }
    sent.push(to);
  }

  // Record recipients (merged with any previous sends) — non-fatal.
  const prev = (reading.sent_to || '').split(/,\s*/).filter(Boolean);
  const merged = [...new Set([...prev, ...sent])].join(', ');
  const { error: updErr } = await supabase
    .from('readings')
    .update({ sent_to: merged })
    .eq('id', id);
  if (updErr) {
    // eslint-disable-next-line no-console
    console.error('email-quick-reading: sent_to update failed', updErr);
  }

  return res.status(200).json({ success: true, sentTo: sent, sentToAll: merged });
}
