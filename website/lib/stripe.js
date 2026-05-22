// Server-only Stripe + service-role Supabase helpers used by the
// Member Area subscription flow. Never import from a React component —
// these read secrets from process.env.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

let _stripe;
export function getStripe() {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.');
  _stripe = new Stripe(key);
  return _stripe;
}

let _serviceClient;
// Service-role Supabase client. Bypasses RLS — only use server-side,
// only from authenticated/verified entry points (Stripe webhook,
// signed-in API routes that just need to upsert the user's own row).
export function getServiceSupabase() {
  if (_serviceClient) return _serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.PUBLIC_SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase service-role credentials missing (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).',
    );
  }
  _serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _serviceClient;
}

export const PLANS = {
  founders: {
    key: 'founders',
    priceEnvVar: 'STRIPE_PRICE_FOUNDERS',
  },
};

export function priceIdForPlan(plan) {
  const entry = PLANS[plan];
  if (!entry) throw new Error(`Unknown plan: ${plan}`);
  const id = process.env[entry.priceEnvVar];
  if (!id) throw new Error(`${entry.priceEnvVar} is not set.`);
  return id;
}
