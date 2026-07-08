// Generates a multi-section Quick Reading (rendered on screen and/or
// emailed) and persists the row to public.readings so the astrologer can
// see it in the "Past readings" tab. The astrologer selects which
// sections to render via `types`.
//
// Gated by requireApi('staff'). The insert uses the user-scoped supabase
// client returned by the guard, so the existing readings RLS policy
// (`auth.uid() = user_id`) keeps each astrologer's history private.

import { requireApi } from '../../../lib/guards';
import { buildQuickReading, READING_TYPES } from '../../../lib/quickReading';
import { buildQuickReadingHtml } from '../../../lib/quickReadingHtml';

const REPLY_TO = process.env.RESEND_REPLY_TO || 'firepig01@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Mahjong Tarot <notifications@mahjongtarot.com>';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('staff')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { user, supabase } = auth;

  const {
    name,
    birthday,
    birthTime,
    birthPlace,
    gender,
    partner,
    types,
    recipient,
  } = req.body || {};

  // Validation
  if (!birthday || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    return res.status(400).json({ error: 'birthday (YYYY-MM-DD) is required.' });
  }
  if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) {
    return res.status(400).json({ error: 'birthTime must be HH:MM.' });
  }
  if (!Array.isArray(types) || types.length === 0) {
    return res.status(400).json({ error: 'Select at least one reading type.' });
  }
  for (const t of types) {
    if (!READING_TYPES.includes(t)) {
      return res.status(400).json({ error: `Unknown reading type: ${t}` });
    }
  }
  if (types.includes('compatibility')) {
    if (!partner?.birthday || !/^\d{4}-\d{2}-\d{2}$/.test(partner.birthday)) {
      return res.status(400).json({ error: 'Partner birthday (YYYY-MM-DD) is required for compatibility.' });
    }
    if (partner.birthTime && !/^\d{2}:\d{2}$/.test(partner.birthTime)) {
      return res.status(400).json({ error: 'Partner birthTime must be HH:MM.' });
    }
  }

  // Recipient: 'screen' (render in the portal, no email), 'me' (caller's
  // email) or an explicit email string.
  let toEmail = null;
  if (recipient !== 'screen') {
    toEmail = user.email;
    if (recipient && recipient !== 'me') {
      if (typeof recipient !== 'string' || !EMAIL_RE.test(recipient)) {
        return res.status(400).json({ error: 'recipient must be "me", "screen", or a valid email address.' });
      }
      toEmail = recipient;
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (toEmail && !apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured.' });
  }

  try {
    const reading = buildQuickReading({
      subject: { name, birthday, birthTime, birthPlace, gender },
      partner: types.includes('compatibility') ? partner : null,
      types,
    });

    const html = buildQuickReadingHtml(reading);
    const subjectLine = `Quick reading — ${name || 'unnamed subject'}`;

    // Send via Resend (skipped for on-screen readings)
    let emailId = null;
    if (toEmail) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [toEmail],
          subject: subjectLine,
          html,
          reply_to: REPLY_TO,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error('Resend error (quick-reading):', data);
        return res.status(response.status).json({ error: data.message || 'Failed to send email.' });
      }
      emailId = data.id;
    }

    // Persist the reading so it shows up in the "Past readings" tab.
    // Non-fatal on failure — the email already went out.
    const insertPayload = {
      user_id: user.id,
      type: 'admin',
      types,
      html,
      sent_to: toEmail,
      person1_name: name || null,
      person1_birthday: birthday,
      person1_birth_time: birthTime || null,
      person1_gender: gender || null,
      rating: reading.compatibility?.rating ?? null,
      report: reading.compatibility ? { compatibility: reading.compatibility } : null,
    };
    if (reading.partner) {
      insertPayload.person2_name = reading.partner.name;
      insertPayload.person2_birthday = reading.partner.birthday;
      insertPayload.person2_birth_time = reading.partner.birthTime;
      insertPayload.person2_gender = reading.partner.gender;
    }
    const { error: insErr } = await supabase
      .from('readings')
      .insert(insertPayload);
    if (insErr) {
      // eslint-disable-next-line no-console
      console.error('quick-reading: readings insert failed', insErr);
    }

    return res.status(200).json({ success: true, sentTo: toEmail, id: emailId, html });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('quick-reading handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
