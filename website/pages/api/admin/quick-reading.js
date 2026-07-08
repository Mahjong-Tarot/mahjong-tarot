// Generates a multi-section Quick Reading, persists it to public.readings
// (with a public share token), and returns the HTML for on-screen display.
// The astrologer selects which sections to render via `types`. Emailing a
// saved reading is handled by /api/admin/email-quick-reading.
//
// Gated by requireApi('staff'). The insert uses the user-scoped supabase
// client returned by the guard, so the existing readings RLS policy
// (`auth.uid() = user_id`) keeps each astrologer's history private.

import { randomUUID } from 'crypto';
import { requireApi } from '../../../lib/guards';
import { buildQuickReading, READING_TYPES } from '../../../lib/quickReading';
import { buildQuickReadingHtml } from '../../../lib/quickReadingHtml';

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

  try {
    const reading = buildQuickReading({
      subject: { name, birthday, birthTime, birthPlace, gender },
      partner: types.includes('compatibility') ? partner : null,
      types,
    });

    const html = buildQuickReadingHtml(reading);

    // Persist the reading so it shows up in the "Past readings" tab and
    // is reachable via its public share link. Non-fatal on failure — the
    // astrologer still gets the on-screen reading.
    const insertPayload = {
      user_id: user.id,
      type: 'admin',
      types,
      html,
      public_token: randomUUID().replace(/-/g, ''),
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
    const { data: inserted, error: insErr } = await supabase
      .from('readings')
      .insert(insertPayload)
      .select('id, public_token')
      .single();
    if (insErr) {
      // eslint-disable-next-line no-console
      console.error('quick-reading: readings insert failed', insErr);
    }

    return res.status(200).json({
      success: true,
      html,
      readingId: inserted?.id ?? null,
      publicToken: inserted?.public_token ?? null,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('quick-reading handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
