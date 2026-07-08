import { calculatePillars, elementInteraction, norm, tier, findSignMatch } from '../../lib/bazi';
import { buildFourPillarsChart } from '../../lib/fp/chart.mjs';
import { buildFourPillarsReading } from '../../lib/fp/engine.mjs';
import { content as fpContent } from '../../lib/fp/content.mjs';
import { computeFireHorseForecast } from '../../lib/fire-horse-forecast';
import secrets from '../../data/love-secrets.json';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { user, members } = req.body || {};

  try {
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayPillars = calculatePillars(todayDate, '12:00');

    let userPillars = null;
    let todayEnergy = null;
    let fireHorseForecast = null;
    let fourPillars = null;

    if (user?.birthday) {
      userPillars = calculatePillars(user.birthday, user.birthTime || null);

      // Bill's authored Four Pillars (Life Cycle) reading. Assembled here so the
      // 1.8 MB narrative content stays server-side; the small reading object is
      // sent to the client, which renders it with lib/fp/render.mjs.
      try {
        const fpChart = buildFourPillarsChart({ birthday: user.birthday, birthTime: user.birthTime || null });
        fourPillars = buildFourPillarsReading(fpChart, fpContent);
      } catch (err) {
        // Non-fatal: the rest of the dashboard still renders without it.
        // eslint-disable-next-line no-console
        console.error('dashboard: four-pillars reading failed', err);
      }
      const userDayElement = userPillars?.day?.stem?.element;
      const todayDayElement = todayPillars?.day?.stem?.element;
      todayEnergy = elementInteraction(userDayElement, todayDayElement);

      // Same engine as the member Fire Horse reading and the quick reading,
      // so the dashboard favorability number always matches the full report.
      const fh = computeFireHorseForecast(userPillars);
      if (fh) {
        fireHorseForecast = {
          rating: fh.yearScore * 100,
          band: fh.yearBand,
          sign: fh.sign,
        };
      }
    }

    const memberRatings = (members || []).map((m) => {
      if (!m.birthday || !user?.birthday) {
        return { id: m.id, name: m.name, relationship: m.relationship, rating: null };
      }
      const mp = calculatePillars(m.birthday, m.birthTime || null);
      const userSign = norm(userPillars?.year?.branch?.animal);
      const mSign = norm(mp?.year?.branch?.animal);
      const match = findSignMatch(userSign, mSign, secrets.sign_match);
      return {
        id: m.id,
        name: m.name,
        relationship: m.relationship,
        sign: mSign,
        birthday: m.birthday,
        rating: match?.Rating ?? null,
        tier: tier(match?.Rating),
      };
    });

    res.status(200).json({
      today: { date: todayDate, pillars: todayPillars, energy: todayEnergy },
      userPillars,
      fourPillars,
      fireHorseForecast,
      memberRatings,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
