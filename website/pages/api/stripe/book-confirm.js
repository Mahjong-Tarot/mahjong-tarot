// GET /api/stripe/book-confirm?session_id=...
// Lightweight read for the /the-mahjong-mirror/order/confirm page —
// reads the Stripe session + the matching book_orders row.
import { getStripe, getServiceSupabase } from '../../../lib/stripe';
import { bookFor } from '../../../lib/books';

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

  const { data: order } = await service
    .from('book_orders')
    .select('sku, email, status, amount_cents, currency')
    .eq('stripe_session_id', session_id)
    .maybeSingle();

  const sku = order?.sku || session.metadata?.sku || null;
  const book = sku ? bookFor(sku) : null;

  return res.status(200).json({
    paid: session.payment_status === 'paid',
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_details?.email || session.customer_email,
    sku,
    label: book?.label || null,
    delivery_label: book?.delivery_label || null,
    requires_shipping: book?.requires_shipping ?? null,
  });
}
