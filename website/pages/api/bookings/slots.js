// GET /api/bookings/slots?duration=60
// Returns open slots from public.reading_availability for the next
// 30 days. Lazily releases expired holds first.
import { getServiceSupabase } from '../../../lib/stripe';
import { tierFor } from '../../../lib/bookings';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const duration = parseInt(req.query.duration, 10) || 60;
  const tier = tierFor(duration);
  if (!tier) return res.status(400).json({ error: 'Invalid duration' });

  const service = getServiceSupabase();

  // Release any slots whose holds have expired.
  await service.rpc('release_expired_holds');

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 30);

  const { data, error } = await service
    .from('reading_availability')
    .select('id, slot_start, duration_minutes')
    .eq('status', 'open')
    .eq('duration_minutes', duration)
    .gte('slot_start', new Date().toISOString())
    .lte('slot_start', horizon.toISOString())
    .order('slot_start', { ascending: true })
    .limit(200);

  if (error) {
    return res.status(500).json({ error: 'Could not load slots', detail: error.message });
  }

  return res.status(200).json({ slots: data || [] });
}
