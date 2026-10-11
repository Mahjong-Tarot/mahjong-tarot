// POST /api/bookings/hold
// Body: { slot_id: uuid, duration: 30|60|90 }
// Marks the slot as 'held' so other browsers can't pick it while
// this user is on the way to Stripe. Returns the slot details so
// the pay step can show a summary.
import { getServiceSupabase } from '../../../lib/stripe';
import { randomUUID } from 'crypto';
import { tierFor, HOLD_TTL_MINUTES } from '../../../lib/bookings';
import { rateLimit, ipHash } from '../../../lib/rateLimit';

// Active (unexpired, pre-checkout) holds one IP may have at once. The hold
// token carries a hash of the IP, so they can be counted without a column.
const MAX_ACTIVE_HOLDS_PER_IP = 2;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!rateLimit(req, res, { name: 'bookings-hold', limit: 10, windowMs: 10 * 60_000 })) return;

  const { slot_id, duration } = req.body || {};
  if (!slot_id || !tierFor(duration)) {
    return res.status(400).json({ error: 'slot_id and duration required' });
  }

  const service = getServiceSupabase();

  // Release expired holds before we try to claim.
  await service.rpc('release_expired_holds');

  const ipKey = ipHash(req);
  const { count: activeHolds, error: countErr } = await service
    .from('reading_availability')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'held')
    .like('held_for_session', `pending_${ipKey}_%`)
    .gt('held_until', new Date().toISOString());
  if (countErr) {
    console.error('[bookings/hold] active-hold count failed', countErr);
    return res.status(500).json({ error: 'Hold failed' });
  }
  if ((activeHolds ?? 0) >= MAX_ACTIVE_HOLDS_PER_IP) {
    return res.status(429).json({ error: 'You already have a time on hold. Finish that booking or wait a few minutes.' });
  }

  const heldUntil = new Date(Date.now() + HOLD_TTL_MINUTES * 60_000).toISOString();
  const holdToken = `pending_${ipKey}_${randomUUID()}`;

  // Conditional update: only move 'open' rows for this duration.
  const { data, error } = await service
    .from('reading_availability')
    .update({
      status: 'held',
      held_until: heldUntil,
      held_for_session: holdToken,
    })
    .eq('id', slot_id)
    .eq('status', 'open')
    .eq('duration_minutes', parseInt(duration, 10))
    .select('id, slot_start, duration_minutes')
    .maybeSingle();

  if (error) {
    console.error('[bookings/hold] update failed', error);
    return res.status(500).json({ error: 'Hold failed' });
  }
  if (!data) {
    return res.status(409).json({ error: 'Slot is no longer available. Pick another time.' });
  }

  return res.status(200).json({ slot: data, hold_token: holdToken, held_until: heldUntil });
}
