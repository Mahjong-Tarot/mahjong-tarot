// POST /api/stripe/webhook
// Stripe-signed events for the Member Area subscription lifecycle.
// Raw body is required for signature verification, so the Next.js
// JSON body parser is disabled below.
import { getStripe, getServiceSupabase } from '../../../lib/stripe';

export const config = {
  api: { bodyParser: false },
};

const HANDLED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
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
      }
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
