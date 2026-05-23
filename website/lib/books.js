// Server- and client-safe metadata for the book pre-order flow.
// Pricing/SKU is the source of truth here — keep in sync with
// products in Stripe (live) and the BOOK_SKUS map below.
export const BOOK_SKUS = {
  digital: {
    sku: 'digital',
    label: 'Digital Edition',
    short_label: 'Digital',
    amount_cents: 1888,
    delivery_date: '2026-07-27',
    delivery_label: 'Delivered July 27, 2026',
    requires_shipping: false,
    priceEnvVar: 'STRIPE_PRICE_BOOK_DIGITAL',
    blurb: 'Instant download when the book launches.',
    bullets: [
      'Full PDF + ePub',
      'Delivered to your inbox July 27, 2026',
      'Read on any device',
    ],
  },
  hardcopy: {
    sku: 'hardcopy',
    label: 'Hardcopy',
    short_label: 'Hardcopy',
    amount_cents: 2888,
    delivery_date: '2026-08-01',
    delivery_label: 'Ships August 2026',
    requires_shipping: true,
    priceEnvVar: 'STRIPE_PRICE_BOOK_HARDCOPY',
    blurb: 'Printed book, shipped to your door.',
    bullets: [
      'Printed paperback',
      'Ships August 2026',
      'Shipping collected at checkout',
    ],
  },
  signed_bundle: {
    sku: 'signed_bundle',
    label: 'Signed + Card Set',
    short_label: 'Signed Bundle',
    amount_cents: 8888,
    delivery_date: '2026-08-01',
    delivery_label: 'Ships August 2026',
    requires_shipping: true,
    priceEnvVar: 'STRIPE_PRICE_BOOK_SIGNED_BUNDLE',
    blurb: 'Signed hardcopy with the Mahjong Mirror Card Set.',
    bullets: [
      'Signed hardcopy',
      '42-card Mahjong Mirror deck',
      'Ships August 2026',
    ],
  },
};

export const BOOK_SKU_ORDER = ['digital', 'hardcopy', 'signed_bundle'];

export function bookFor(sku) {
  return BOOK_SKUS[sku] || null;
}

export function bookPriceId(sku) {
  const book = bookFor(sku);
  if (!book) throw new Error(`Unknown book SKU: ${sku}`);
  const id = process.env[book.priceEnvVar];
  if (!id) throw new Error(`${book.priceEnvVar} is not set.`);
  return id;
}

export function formatBookPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
