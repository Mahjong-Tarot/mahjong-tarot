// Pure server-side compatibility computation, shared by
// /api/compatibility (member-facing) and /api/admin/quick-reading
// (astrologer Quick Reading tool).

import {
  calculatePillars,
  tallyElements,
  dominantElement,
  norm,
  tier,
  findSignMatch,
} from './bazi';
import secrets from '../data/love-secrets.json';

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
  const max = Math.max(...Object.values(combinedCounts));
  if (max === 0) return null;
  const winners = Object.entries(combinedCounts).filter(([, v]) => v === max);
  const strongest = winners.length === 1 ? winners[0][0] : 'Balanced';
  const row = secrets.element_strength.find((r) => r.Strength === strongest);
  return row ? { element: strongest, conclusion: row.Conclusion } : null;
}

/**
 * Compute a compatibility report between two people.
 * Both persons need a birthday (YYYY-MM-DD). Birth time is optional.
 * Returns the same shape that /api/compatibility used to return inline.
 */
export function computeCompatibility(person1, person2) {
  if (!person1?.birthday || !person2?.birthday) {
    throw new Error('Both birthdays required');
  }

  const p1 = calculatePillars(person1.birthday, person1.birthTime || null);
  const p2 = calculatePillars(person2.birthday, person2.birthTime || null);
  const sign1 = norm(p1.year.branch.animal);
  const sign2 = norm(p2.year.branch.animal);

  const e1 = tallyElements(p1);
  const e2 = tallyElements(p2);
  const combined = {
    Wood:  e1.Wood  + e2.Wood,
    Fire:  e1.Fire  + e2.Fire,
    Earth: e1.Earth + e2.Earth,
    Metal: e1.Metal + e2.Metal,
    Water: e1.Water + e2.Water,
  };

  const match = findSignMatch(sign1, sign2, secrets.sign_match);
  const rating = match?.Rating ?? null;
  const t = tier(rating);

  return {
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
}
