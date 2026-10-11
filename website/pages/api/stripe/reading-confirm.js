// GET /api/stripe/reading-confirm?session_id=...
// Lightweight read for the /book-a-reading/confirm page so we can
// show the customer their booking without exposing raw Stripe data.
import { getStripe, getServiceSupabase } from '../../../lib/stripe';
import { rateLimit } from '../../../lib/rateLimit';

// Unauthenticated: the session id leaks via history, screenshots and
// analytics, so return no full PII. The email is masked (jo***@example.com)
// so the guest can still recognise it.
function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = String(email).split('@');
  if (!domain) return null;
  return `${local.slice(0, 2)}***@${domain}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!rateLimit(req, res, { name: 'checkout-confirm', limit: 30, windowMs: 60_000 })) return;

  const { session_id } = req.query;
  if (typeof session_id !== 'string' || !/^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    return res.status(400).json({ error: 'session_id required' });
  }

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
    .select('duration_minutes, scheduled_at, status')
    .eq('stripe_session_id', session_id)
    .maybeSingle();

  return res.status(200).json({
    paid: session.payment_status === 'paid',
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: maskEmail(session.customer_details?.email || session.customer_email),
    booking: booking ? { status: booking.status } : null,
    scheduled_at: booking?.scheduled_at || session.metadata?.slot_start || null,
    duration: booking?.duration_minutes || parseInt(session.metadata?.duration, 10) || null,
  });
}
