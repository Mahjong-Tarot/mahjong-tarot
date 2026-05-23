// POST /api/bookings/hold
// Body: { slot_id: uuid, duration: 30|60|90 }
// Marks the slot as 'held' so other browsers can't pick it while
// this user is on the way to Stripe. Returns the slot details so
// the pay step can show a summary.
import { getServiceSupabase } from '../../../lib/stripe';
import { tierFor, HOLD_TTL_MINUTES } from '../../../lib/bookings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slot_id, duration } = req.body || {};
  if (!slot_id || !tierFor(duration)) {
    return res.status(400).json({ error: 'slot_id and duration required' });
  }

  const service = getServiceSupabase();

  // Release expired holds before we try to claim.
  await service.rpc('release_expired_holds');

  const heldUntil = new Date(Date.now() + HOLD_TTL_MINUTES * 60_000).toISOString();
  const holdToken = `pending_${Math.random().toString(36).slice(2)}_${Date.now()}`;

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
    return res.status(500).json({ error: 'Hold failed', detail: error.message });
  }
  if (!data) {
    return res.status(409).json({ error: 'Slot is no longer available. Pick another time.' });
  }

  return res.status(200).json({ slot: data, hold_token: holdToken, held_until: heldUntil });
}
