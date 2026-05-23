// POST /api/stripe/booking-checkout
// Body: { duration, full_name, email, phone?, birthday?, birth_time?,
//         question?, slot_id, hold_token }
// Guest checkout — no auth required. Creates a one-time Stripe
// Checkout Session ($49 / $69 / $129 depending on duration) and
// stamps the booking metadata so the webhook can finalise the row.
import { getStripe, getServiceSupabase } from '../../../lib/stripe';
import { readingPriceId, tierFor } from '../../../lib/bookings';

function originFromReq(req) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    duration,
    full_name,
    email,
    phone,
    birthday,
    birth_time,
    question,
    slot_id,
    hold_token,
  } = req.body || {};

  const tier = tierFor(duration);
  if (!tier) return res.status(400).json({ error: 'Invalid duration' });
  if (!full_name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  if (!slot_id) return res.status(400).json({ error: 'Slot is required' });

  let price;
  try {
    price = readingPriceId(duration);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const service = getServiceSupabase();

  // Re-verify the slot is held for this session. If it isn't, the
  // user took >10 min on Step 03 or someone raced us.
  const { data: slot, error: slotErr } = await service
    .from('reading_availability')
    .select('id, slot_start, status, held_for_session, duration_minutes, astrologer_id')
    .eq('id', slot_id)
    .maybeSingle();

  if (slotErr) return res.status(500).json({ error: 'Slot lookup failed' });
  if (!slot || slot.status !== 'held' || slot.held_for_session !== hold_token) {
    return res.status(409).json({
      error: 'Your slot is no longer reserved. Please pick a new time.',
    });
  }
  if (slot.duration_minutes !== parseInt(duration, 10)) {
    return res.status(400).json({ error: 'Slot duration mismatch' });
  }

  const stripe = getStripe();
  const origin = originFromReq(req);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{ price, quantity: 1 }],
    metadata: {
      booking: 'true',
      duration: String(duration),
      full_name,
      email,
      phone: phone || '',
      birthday: birthday || '',
      birth_time: birth_time || '',
      question: question ? question.slice(0, 500) : '',
      slot_id,
      slot_start: slot.slot_start,
      astrologer_id: slot.astrologer_id || '',
    },
    payment_intent_data: {
      metadata: {
        booking: 'true',
        slot_id,
        duration: String(duration),
        astrologer_id: slot.astrologer_id || '',
      },
      description: `Mahjong Tarot — Private Reading (${duration} min)`,
    },
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
    billing_address_collection: 'auto',
    success_url: `${origin}/book-a-reading/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book-a-reading?duration=${duration}&checkout=cancel`,
  });

  // Stamp the held slot with the real Stripe session id so the webhook
  // can correlate (in case metadata ever fails to round-trip).
  await service
    .from('reading_availability')
    .update({ held_for_session: session.id })
    .eq('id', slot_id);

  return res.status(200).json({ url: session.url });
}
