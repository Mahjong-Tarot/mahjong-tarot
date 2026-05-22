// POST /api/stripe/checkout
// Body: { plan: 'founders' }
// Creates (or reuses) a Stripe customer for the signed-in user, then
// creates a hosted Checkout Session and returns its URL. The client
// redirects window.location to that URL. The webhook at
// /api/stripe/webhook flips member_subscriptions.status to 'active'
// once Stripe confirms the payment.
import { requireUserApi } from '../../../lib/requireUserApi';
import {
  getStripe,
  getServiceSupabase,
  priceIdForPlan,
} from '../../../lib/stripe';

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

  const auth = await requireUserApi(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const { user } = auth;

  const plan = (req.body && req.body.plan) || 'founders';
  let price;
  try {
    price = priceIdForPlan(plan);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const stripe = getStripe();
  const service = getServiceSupabase();

  // Look up any existing subscription row for this user so we can
  // re-use a previously-created Stripe customer.
  const { data: existing, error: lookupErr } = await service
    .from('member_subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (lookupErr) {
    return res.status(500).json({ error: 'Lookup failed', detail: lookupErr.message });
  }

  // If they're already active, send them to the dashboard — no double charge.
  if (existing && ['active', 'trialing'].includes(existing.status)) {
    return res.status(409).json({
      error: 'You already have an active Member Area subscription.',
    });
  }

  let customerId = existing?.stripe_customer_id || null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    // Persist the customer id immediately so a duplicate checkout
    // request can't spawn a second Stripe customer.
    await service.from('member_subscriptions').upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        plan,
        status: 'incomplete',
      },
      { onConflict: 'user_id' },
    );
  }

  const origin = originFromReq(req);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan },
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
    billing_address_collection: 'auto',
    success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/signup?checkout=cancel`,
  });

  return res.status(200).json({ url: session.url });
}
