import { calculatePillars, elementInteraction } from '../../lib/bazi';
import secrets from '../../data/love-secrets.json';

// Chinese New Year 2026 → start of Fire Horse year
const FIRE_HORSE_NEW_YEAR = '2026-02-17';

const SIGN_NORMALIZE = { Goat: 'Sheep', Ram: 'Sheep', Boar: 'Pig' };
const norm = (s) => SIGN_NORMALIZE[s] || s;

function tier(rating) {
  if (rating == null) return null;
  if (rating >= 90) return { name: 'Soul Mate Material', tone: 'great' };
  if (rating >= 80) return { name: 'Strong Match',       tone: 'good'  };
  if (rating >= 70) return { name: 'Solid',              tone: 'good'  };
  if (rating >= 60) return { name: 'Workable',           tone: 'mixed' };
  if (rating >= 50) return { name: 'Mixed',              tone: 'mixed' };
  return                 { name: 'Tough Match',          tone: 'rough' };
}

function findSignMatch(primarySign, partnerSign) {
  return secrets.sign_match.find(
    (r) => norm(r.PrimarySign) === primarySign && norm(r.PartnerSign) === partnerSign,
  ) || null;
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { user, members } = req.body || {};

  try {
    const todayDate = new Date().toISOString().slice(0, 10);
    const todayPillars = calculatePillars(todayDate, '12:00');

    let userPillars = null;
    let todayEnergy = null;
    let fireHorseForecast = null;

    if (user?.birthday) {
      userPillars = calculatePillars(user.birthday, user.birthTime || null);
      const userDayElement = userPillars?.day?.stem?.element;
      const todayDayElement = todayPillars?.day?.stem?.element;
      todayEnergy = elementInteraction(userDayElement, todayDayElement);

      const fhPillars = calculatePillars(FIRE_HORSE_NEW_YEAR, null);
      const userSign = norm(userPillars?.year?.branch?.animal);
      const fhSign = norm(fhPillars?.year?.branch?.animal); // Horse
      const fhMatch = findSignMatch(userSign, fhSign);
      if (fhMatch) {
        fireHorseForecast = {
          rating: fhMatch.Rating,
          tier: tier(fhMatch.Rating),
          headline: fhMatch.GeneralMatchDescription?.split('. ')[0] + '.',
          narrative: fhMatch.GeneralMatchDescription,
          theGood: fhMatch.TheGood || null,
          userSign,
          yearSign: fhSign,
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
      const match = findSignMatch(userSign, mSign);
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
      fireHorseForecast,
      memberRatings,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
