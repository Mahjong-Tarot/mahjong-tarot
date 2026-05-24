// GET /api/stripe/reading-confirm?session_id=...
// Lightweight read for the /book-a-reading/confirm page so we can
// show the customer their booking without exposing raw Stripe data.
import { getStripe, getServiceSupabase } from '../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id required' });

  const stripe = getStripe();
  const service = getServiceSupabase();

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (err) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { data: booking } = await service
    .from('bookings')
    .select('full_name, email, duration_minutes, scheduled_at, status')
    .eq('stripe_session_id', session_id)
    .maybeSingle();

  return res.status(200).json({
    paid: session.payment_status === 'paid',
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_details?.email || session.customer_email,
    booking: booking || null,
    scheduled_at: booking?.scheduled_at || session.metadata?.slot_start || null,
    duration: booking?.duration_minutes || parseInt(session.metadata?.duration, 10) || null,
  });
}
