import { computeCompatibility } from '../../lib/compatibility';
import { rateLimit } from '../../lib/rateLimit';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!rateLimit(req, res, { name: 'compatibility', limit: 30, windowMs: 60_000 })) return;
  const { person1, person2 } = req.body || {};
  if (!person1?.birthday || !person2?.birthday) {
    return res.status(400).json({ error: 'Both birthdays required' });
  }
  try {
    res.status(200).json(computeCompatibility(person1, person2));
  } catch (e) {
    console.error('[compatibility] failed', e);
    res.status(500).json({ error: 'Could not compute compatibility' });
  }
}
