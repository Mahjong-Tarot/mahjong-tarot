import { computeCompatibility } from '../../lib/compatibility';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { person1, person2 } = req.body || {};
  if (!person1?.birthday || !person2?.birthday) {
    return res.status(400).json({ error: 'Both birthdays required' });
  }
  try {
    res.status(200).json(computeCompatibility(person1, person2));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
