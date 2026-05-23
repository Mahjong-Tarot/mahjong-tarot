// Server-only helpers for the Private Reading funnel.
// Pricing/duration is the source of truth here — keep in sync
// with the TIERS array in pages/book-a-reading.jsx.
export const READING_TIERS = {
  30: { duration: 30, amount_cents: 4800, label: 'A focused look',  priceEnvVar: 'STRIPE_PRICE_READING_30' },
  60: { duration: 60, amount_cents: 8800, label: 'The full mirror', priceEnvVar: 'STRIPE_PRICE_READING_60' },
  90: { duration: 90, amount_cents: 12800, label: 'Deep counsel',   priceEnvVar: 'STRIPE_PRICE_READING_90' },
};

export function tierFor(duration) {
  const d = parseInt(duration, 10);
  return READING_TIERS[d] || null;
}

export function readingPriceId(duration) {
  const tier = tierFor(duration);
  if (!tier) throw new Error(`Unknown reading duration: ${duration}`);
  const id = process.env[tier.priceEnvVar];
  if (!id) throw new Error(`${tier.priceEnvVar} is not set.`);
  return id;
}

// Hold expires this many minutes after the user picks a slot,
// giving them time to complete Stripe Checkout.
export const HOLD_TTL_MINUTES = 10;
