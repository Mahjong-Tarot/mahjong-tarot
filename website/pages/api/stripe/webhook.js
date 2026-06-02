// POST /api/stripe/webhook
// Stripe-signed events for the Member Area subscription lifecycle.
// Raw body is required for signature verification, so the Next.js
// JSON body parser is disabled below.
import { getStripe, getServiceSupabase } from '../../../lib/stripe';
import { findOrCreatePersonByEmail, promoteToCustomer } from '../../../lib/people';
import { DEFAULT_ASTROLOGER_ID } from '../../../lib/bookings';

export const config = {
  api: { bodyParser: false },
};

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
]);

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function toIsoSeconds(maybeSeconds) {
  if (!maybeSeconds && maybeSeconds !== 0) return null;
  return new Date(maybeSeconds * 1000).toISOString();
}

function resolveUserId(sub, session) {
  return (
    session?.client_reference_id ||
    sub?.metadata?.user_id ||
    session?.metadata?.user_id ||
    null
  );
}

function paymentIntentId(session) {
  return typeof session?.payment_intent === 'string'
    ? session.payment_intent
    : session?.payment_intent?.id || null;
}

// Inserts a deal row, swallowing the unique-constraint error so
// double-deliveries from Stripe don't crash the handler.
async function insertDealIfNew(service, row) {
  const { error } = await service.from('deals').insert(row);
  if (error && error.code !== '23505') throw error; // 23505 = unique_violation
}

// Subscription renewals (and other invoice.paid events except the
// initial subscription_create, which checkout.session.completed
// already covers). Writes a Deal so recurring revenue rolls up
// alongside one-time sales on the dashboard.
async function handleInvoicePaid(service, invoice) {
  const reason = invoice.billing_reason;
  // Skip the very first charge — already handled at checkout time.
  // Also skip the no-money preview / draft cases.
  if (reason === 'subscription_create') return;
  if ((invoice.amount_paid ?? 0) <= 0) return;
  if (!['subscription_cycle', 'subscription_update'].includes(reason)) return;

  const subId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id || null;
  const customerEmail =
    invoice.customer_email ||
    invoice.customer_details?.email ||
    null;
  const customerName =
    invoice.customer_name ||
    invoice.customer_details?.name ||
    null;
  const pi =
    typeof invoice.payment_intent === 'string'
      ? invoice.payment_intent
      : invoice.payment_intent?.id || null;

  // Resolve the member_subscriptions row → user_id (for the deal's
  // member_subscription_id link). Best-effort; missing is OK.
  let userId = null;
  let plan = 'founders';
  if (subId) {
    const { data: sub } = await service
      .from('member_subscriptions')
      .select('user_id, plan')
      .eq('stripe_subscription_id', subId)
      .maybeSingle();
    if (sub) {
      userId = sub.user_id;
      plan = sub.plan || plan;
    }
  }

  if (!customerEmail) return; // can't attribute without an email

  const person = await findOrCreatePersonByEmail(service, {
    email: customerEmail,
    name: customerName,
  });

  await insertDealIfNew(service, {
    person_id: person?.id || null,
    member_subscription_id: userId,
    amount_cents: invoice.amount_paid ?? 0,
    currency: invoice.currency || 'usd',
    source: 'stripe',
    notes: `${plan} subscription · ${reason === 'subscription_update' ? 'proration' : 'renewal'}`,
    close_date: new Date().toISOString().slice(0, 10),
    won_at: new Date().toISOString(),
    status: 'won',
    stripe_payment_intent_id: pi,
  });
  await promoteToCustomer(service, person?.id, person?.lifecycle_stage);
}

async function handleBookOrderCompleted(service, session) {
  const sku = session.metadata?.sku || null;
  if (!sku) throw new Error('book_order session missing sku metadata');

  const shipping =
    session.shipping_details ||
    session.collected_information?.shipping_details ||
    null;
  const addr = shipping?.address || null;

  const { error } = await service
    .from('book_orders')
    .upsert(
      {
        email: session.customer_details?.email || session.customer_email || '',
        full_name: session.customer_details?.name || shipping?.name || null,
        phone: session.customer_details?.phone || null,
        sku,
        amount_cents: session.amount_total ?? null,
        currency: session.currency || 'usd',
        status: 'paid',
        shipping_name: shipping?.name || null,
        shipping_line1: addr?.line1 || null,
        shipping_line2: addr?.line2 || null,
        shipping_city: addr?.city || null,
        shipping_state: addr?.state || null,
        shipping_postal_code: addr?.postal_code || null,
        shipping_country: addr?.country || null,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId(session),
      },
      { onConflict: 'stripe_session_id' },
    );

  if (error) throw error;

  // Write the corresponding Deal so revenue rolls up on the dashboard.
  const email = session.customer_details?.email || session.customer_email;
  const fullName = session.customer_details?.name || shipping?.name || null;
  if (email) {
    const person = await findOrCreatePersonByEmail(service, { email, name: fullName });
    await insertDealIfNew(service, {
      person_id: person?.id || null,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency || 'usd',
      source: 'stripe',
      notes: `Book order · ${sku}`,
      close_date: new Date().toISOString().slice(0, 10),
      won_at: new Date().toISOString(),
      status: 'won',
      stripe_payment_intent_id: paymentIntentId(session),
    });
    await promoteToCustomer(service, person?.id, person?.lifecycle_stage);
  }
}

async function handleBookingCompleted(service, session) {
  const m = session.metadata || {};
  const duration = parseInt(m.duration, 10);
  const slotId = m.slot_id || null;
  const scheduledAt = m.slot_start || null;

  // Astrologer ownership: prefer the metadata value (set at checkout
  // creation); fall back to the slot row in case metadata is missing.
  let astrologerId = m.astrologer_id || null;
  if (!astrologerId && slotId) {
    const { data: slot } = await service
      .from('reading_availability')
      .select('astrologer_id')
      .eq('id', slotId)
      .maybeSingle();
    astrologerId = slot?.astrologer_id || null;
  }
  // For now every reading routes to the default astrologer (Bill) so
  // it lands in his queue even if the slot had no owner.
  astrologerId = astrologerId || DEFAULT_ASTROLOGER_ID;

  // Idempotent upsert by Stripe session id.
  const { data: booking, error: bookingErr } = await service
    .from('bookings')
    .upsert(
      {
        full_name: m.full_name || session.customer_details?.name || '',
        email: m.email || session.customer_details?.email || session.customer_email || '',
        phone: m.phone || null,
        birthday: m.birthday || null,
        birth_time: m.birth_time || null,
        question: m.question || null,
        is_relationship: m.is_relationship === 'true',
        partner_name: m.partner_name || null,
        partner_birthday: m.partner_birthday || null,
        partner_birth_time: m.partner_birth_time || null,
        partner_gender: m.partner_gender || null,
        duration_minutes: duration,
        scheduled_at: scheduledAt,
        slot_id: slotId,
        astrologer_id: astrologerId,
        status: 'paid',
        amount_cents: session.amount_total ?? null,
        currency: session.currency || 'usd',
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
      },
      { onConflict: 'stripe_session_id' },
    )
    .select('id')
    .single();

  if (bookingErr) throw bookingErr;

  // Flip the held slot to booked and link it to the new booking row.
  if (slotId && booking?.id) {
    await service
      .from('reading_availability')
      .update({ status: 'booked', booking_id: booking.id, held_until: null })
      .eq('id', slotId);
  }

  // Find or create the person, write the deal, promote lifecycle.
  const email = m.email || session.customer_details?.email || session.customer_email;
  const fullName = m.full_name || session.customer_details?.name || null;
  if (email && booking?.id) {
    const person = await findOrCreatePersonByEmail(service, { email, name: fullName });
    await insertDealIfNew(service, {
      person_id: person?.id || null,
      booking_id: booking.id,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency || 'usd',
      source: 'stripe',
      notes: `Private Reading · ${duration} min`,
      close_date: new Date().toISOString().slice(0, 10),
      won_at: new Date().toISOString(),
      status: 'won',
      stripe_payment_intent_id: paymentIntentId(session),
    });
    await promoteToCustomer(service, person?.id, person?.lifecycle_stage);
  }
}

async function upsertFromSubscription(service, sub, userIdHint) {
  const userId = userIdHint || sub.metadata?.user_id;
  const row = {
    stripe_customer_id:
      typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
    stripe_subscription_id: sub.id,
    plan: sub.metadata?.plan || 'founders',
    status: sub.status,
    current_period_end: toIsoSeconds(sub.current_period_end),
    cancel_at_period_end: !!sub.cancel_at_period_end,
    started_at: toIsoSeconds(sub.start_date || sub.created),
    canceled_at: toIsoSeconds(sub.canceled_at),
  };

  // Prefer upsert by user_id (PK) when we know it. Otherwise fall
  // back to matching by stripe_customer_id (set during checkout
  // session creation, before this event arrives).
  if (userId) {
    await service
      .from('member_subscriptions')
      .upsert({ user_id: userId, ...row }, { onConflict: 'user_id' });
    return;
  }

  if (row.stripe_customer_id) {
    await service
      .from('member_subscriptions')
      .update(row)
      .eq('stripe_customer_id', row.stripe_customer_id);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  let event;
  try {
    const raw = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (!HANDLED_EVENTS.has(event.type)) {
    // Acknowledge so Stripe stops retrying.
    return res.status(200).json({ received: true, ignored: event.type });
  }

  const service = getServiceSupabase();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Two checkout types live on the same endpoint: the
      // recurring Member Area subscription (mode=subscription) and
      // one-time Private Reading bookings (mode=payment). Branch
      // on session.mode / metadata.booking.
      if (session.mode === 'payment' && session.metadata?.booking === 'true') {
        await handleBookingCompleted(service, session);
      } else if (session.mode === 'payment' && session.metadata?.book_order === 'true') {
        await handleBookOrderCompleted(service, session);
      } else {
        const userId = session.client_reference_id || session.metadata?.user_id;
        const subId = session.subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertFromSubscription(service, sub, userId);
        } else if (userId && session.customer) {
          // Defensive: rare case where subscription id isn't on the session yet.
          await service.from('member_subscriptions').upsert(
            {
              user_id: userId,
              stripe_customer_id:
                typeof session.customer === 'string'
                  ? session.customer
                  : session.customer?.id,
              plan: session.metadata?.plan || 'founders',
              status: 'active',
              started_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
        }

        // Record the initial subscription charge as a Deal so it
        // shows up on the dashboard alongside one-time sales.
        const email = session.customer_details?.email || session.customer_email;
        if (userId && email && (session.amount_total ?? 0) > 0) {
          const person = await findOrCreatePersonByEmail(service, {
            email,
            name: session.customer_details?.name || null,
          });
          await insertDealIfNew(service, {
            person_id: person?.id || null,
            member_subscription_id: userId,
            amount_cents: session.amount_total ?? 0,
            currency: session.currency || 'usd',
            source: 'stripe',
            notes: `${session.metadata?.plan || 'founders'} subscription · first charge`,
            close_date: new Date().toISOString().slice(0, 10),
            won_at: new Date().toISOString(),
            status: 'won',
            stripe_payment_intent_id: paymentIntentId(session),
          });
          await promoteToCustomer(service, person?.id, person?.lifecycle_stage);
        }
      }
    } else if (event.type === 'invoice.paid') {
      await handleInvoicePaid(service, event.data.object);
    } else {
      // customer.subscription.created | updated | deleted
      const sub = event.data.object;
      await upsertFromSubscription(service, sub, resolveUserId(sub));
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error', event.type, err);
    // Return 500 so Stripe retries — handlers are idempotent.
    return res.status(500).json({ error: 'Handler failed' });
  }

  return res.status(200).json({ received: true });
}
