// POST /api/admin/deals/[id]/refund
// Admin-only: issue a full Stripe refund for a won deal, then cascade
// status='refunded' to the deal and its linked booking / book_order.
//
// The Stripe call uses an idempotency key derived from the deal id, so
// retrying the same request returns the original refund instead of
// double-charging. The cascade DB writes always run after a successful
// (or idempotent-replay) Stripe call so a partial prior failure is healed.
import { requireApi } from '../../../../../lib/guards';
import { getStripe, getServiceSupabase } from '../../../../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('admin')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { supabase } = auth;

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing deal id.' });

  // Read the deal via the admin auth client — RLS gates this. If the
  // current user is not allowed to see the row, .maybeSingle() returns
  // null and we 404 (same outcome whether the row doesn't exist or is
  // hidden by policy).
  const { data: deal, error: dealErr } = await supabase
    .from('deals')
    .select('id, status, stripe_payment_intent_id, booking_id, notes')
    .eq('id', id)
    .maybeSingle();
  if (dealErr) {
    console.error('[deals/refund] deal lookup failed', dealErr);
    return res.status(500).json({ error: dealErr.message });
  }
  if (!deal) return res.status(404).json({ error: 'Deal not found.' });

  if (deal.status !== 'won') {
    return res.status(400).json({ error: 'Only won deals can be refunded.' });
  }
  if (!deal.stripe_payment_intent_id) {
    return res
      .status(400)
      .json({ error: 'Deal has no Stripe payment intent — refund manually.' });
  }

  // Stripe refund (full amount). The idempotency key is stable per
  // deal, so a retried request returns the original refund and does
  // not double-refund the customer.
  const stripe = getStripe();
  let refund;
  try {
    refund = await stripe.refunds.create(
      { payment_intent: deal.stripe_payment_intent_id },
      { idempotencyKey: `refund-deal-${deal.id}` },
    );
  } catch (err) {
    console.error('[deals/refund] stripe.refunds.create failed', err);
    return res
      .status(502)
      .json({ error: err.message || 'Stripe refund failed.' });
  }

  // Cascade DB writes via the service-role client so we are immune to
  // RLS edge cases on the linked tables. Order is: deal first, then
  // booking, then book_order. Each is best-effort logged but we still
  // return 200 if the Stripe call succeeded — the refund is the
  // source of truth and the operator can heal a stale row by hand.
  const service = getServiceSupabase();

  const cascadeErrors = [];

  {
    const { error } = await service
      .from('deals')
      .update({ status: 'refunded' })
      .eq('id', deal.id);
    if (error) {
      console.error('[deals/refund] deals update failed', error);
      cascadeErrors.push(`deals: ${error.message}`);
    }
  }

  if (deal.booking_id) {
    const { error } = await service
      .from('bookings')
      .update({ status: 'refunded' })
      .eq('id', deal.booking_id);
    if (error) {
      console.error('[deals/refund] bookings update failed', error);
      cascadeErrors.push(`bookings: ${error.message}`);
    }
  }

  // book_orders has no FK to deals — match on the shared Stripe
  // payment_intent id. Only attempt for deals whose notes mark them
  // as book orders, to avoid touching unrelated rows.
  if ((deal.notes || '').toLowerCase().startsWith('book order')) {
    const { error } = await service
      .from('book_orders')
      .update({ status: 'refunded' })
      .eq('stripe_payment_intent_id', deal.stripe_payment_intent_id);
    if (error) {
      console.error('[deals/refund] book_orders update failed', error);
      cascadeErrors.push(`book_orders: ${error.message}`);
    }
  }

  return res.status(200).json({
    ok: true,
    refund: { id: refund.id, amount: refund.amount, status: refund.status },
    cascadeErrors: cascadeErrors.length ? cascadeErrors : undefined,
  });
}
