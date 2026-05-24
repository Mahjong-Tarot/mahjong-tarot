// POST /api/reply
//
// Staff-only. Sends a reply email to the contact behind an inquiry.
// The recipient address is derived server-side from inquiry_id —
// callers do not get to pick the to_email (otherwise this becomes
// an open Resend relay).
//
// Body: { inquiry_id, subject, body }
import { requireApi } from '../../lib/guards';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('staff')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase } = auth;

  const { inquiry_id, subject, body } = req.body || {};

  if (!inquiry_id || typeof inquiry_id !== 'string') {
    return res.status(400).json({ error: 'inquiry_id is required' });
  }
  if (!subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: subject, body' });
  }

  // Resolve recipient from the inquiry — the caller does not get to
  // choose to_email. RLS on the cookie-aware client gates access.
  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .select('id, person:people!inner(email, name)')
    .eq('id', inquiry_id)
    .maybeSingle();

  if (inquiryErr) {
    console.error('Reply lookup error:', inquiryErr);
    return res.status(500).json({ error: inquiryErr.message });
  }
  if (!inquiry || !inquiry.person?.email) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>',
        to: [inquiry.person.email],
        subject,
        text: body,
        reply_to: process.env.RESEND_REPLY_TO || 'firepig01@gmail.com',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Reply send error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
