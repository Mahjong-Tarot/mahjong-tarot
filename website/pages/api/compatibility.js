import { calculatePillars, tallyElements, dominantElement } from '../../lib/bazi';
import secrets from '../../data/love-secrets.json';

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

function findSoulMate(primarySign, partnerSign) {
  const row = secrets.soul_mate.find((r) => norm(r.PrimarySign) === primarySign);
  if (!row) return null;
  const isMatch = norm(row.SoulMate) === partnerSign;
  return {
    isMatch,
    expectedSoulMate: row.SoulMate,
    description: isMatch ? row.SoulMateDescription : row.NotSoulMateDescription,
  };
}

function findElementStrength(combinedCounts) {
  // The strongest element across both partners drives the conclusion.
  // CCElementStrength rows: Wood, Fire, Earth, Metal, Water, Balanced (one per element).
  const max = Math.max(...Object.values(combinedCounts));
  if (max === 0) return null;
  const winners = Object.entries(combinedCounts).filter(([, v]) => v === max);
  const strongest = winners.length === 1 ? winners[0][0] : 'Balanced';
  const row = secrets.element_strength.find((r) => r.Strength === strongest);
  return row ? { element: strongest, conclusion: row.Conclusion } : null;
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { person1, person2 } = req.body || {};
  if (!person1?.birthday || !person2?.birthday) {
    return res.status(400).json({ error: 'Both birthdays required' });
  }

  try {
    const p1 = calculatePillars(person1.birthday, person1.birthTime || null);
    const p2 = calculatePillars(person2.birthday, person2.birthTime || null);
    const sign1 = norm(p1.year.branch.animal);
    const sign2 = norm(p2.year.branch.animal);

    const e1 = tallyElements(p1);
    const e2 = tallyElements(p2);
    const combined = { Wood: e1.Wood + e2.Wood, Fire: e1.Fire + e2.Fire, Earth: e1.Earth + e2.Earth, Metal: e1.Metal + e2.Metal, Water: e1.Water + e2.Water };

    const match = findSignMatch(sign1, sign2);
    const rating = match?.Rating ?? null;
    const t = tier(rating);

    const result = {
      person1: { sign: sign1, pillars: p1, elements: e1, dominantElement: dominantElement(e1) },
      person2: { sign: sign2, pillars: p2, elements: e2, dominantElement: dominantElement(e2) },
      rating,
      tier: t,
      generalMatchDescription: match?.GeneralMatchDescription || null,
      yinYangDescription:      match?.YinYangDescription || null,
      yin:  match?.Yin ?? null,
      yang: match?.Yang ?? null,
      theGood:      match?.TheGood || null,
      theNotSoGood: match?.TheNotSoGood || null,
      romance:      match?.Romance || null,
      sex:          match?.Sex || null,
      soulMate:     findSoulMate(sign1, sign2),
      combinedElements: combined,
      elementStrength:  findElementStrength(combined),
    };

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
