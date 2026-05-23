// POST /api/stripe/book-checkout
// Body: { sku, email }
// Guest checkout for the book pre-order page. Creates a one-time
// Stripe Checkout Session for one of the three book SKUs. Stripe
// collects the shipping address for the physical SKUs.
import { getStripe } from '../../../lib/stripe';
import { bookFor, bookPriceId } from '../../../lib/books';

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

  const { sku, email } = req.body || {};

  const book = bookFor(sku);
  if (!book) return res.status(400).json({ error: 'Invalid SKU' });

  let price;
  try {
    price = bookPriceId(sku);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const stripe = getStripe();
  const origin = originFromReq(req);

  const params = {
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    metadata: {
      book_order: 'true',
      sku,
    },
    payment_intent_data: {
      metadata: { book_order: 'true', sku },
      description: `Mahjong Mirror — ${book.label}`,
    },
    allow_promotion_codes: true,
    automatic_tax: { enabled: false },
    billing_address_collection: 'auto',
    success_url: `${origin}/the-mahjong-mirror/order/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/the-mahjong-mirror/order?sku=${sku}&checkout=cancel`,
  };

  if (email) params.customer_email = email;

  if (book.requires_shipping) {
    params.shipping_address_collection = {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'DE', 'FR', 'NL', 'SG', 'HK', 'JP', 'VN'],
    };
    params.phone_number_collection = { enabled: true };
  }

  const session = await stripe.checkout.sessions.create(params);
  return res.status(200).json({ url: session.url });
}
