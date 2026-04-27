import { calculatePillars, tallyElements, dominantElement } from '../../lib/bazi';
import oca from '../../data/oca-data.json';

const SIGN_NORMALIZE = {
  Sheep: 'Sheep', Goat: 'Sheep', Ram: 'Sheep',
  Pig: 'Pig', Boar: 'Pig',
};

function normSign(s) {
  return SIGN_NORMALIZE[s] || s;
}

function findSignMatch(primarySign, partnerSign, primaryGender) {
  const list = oca.cc_sign_match.filter((r) =>
    normSign(r.PrimarySign) === primarySign &&
    normSign(r.PartnerSign) === partnerSign,
  );
  // CCSignMatch isn't gender-keyed at the row level (one row per sign pair),
  // so we just return the row.
  return list[0] || null;
}

function findSoulMate(primarySign, partnerSign, primaryGender) {
  const list = oca.cc_soul_mate.filter((r) =>
    normSign(r.PrimarySign) === primarySign &&
    r.PrimaryGender === primaryGender,
  );
  if (!list.length) return null;
  const row = list[0];
  const isMatch = normSign(row.SoulMate) === partnerSign;
  return {
    isMatch,
    description: isMatch ? row.SoulMateDescription : row.NotSoulMateDescription,
    expectedSoulMate: row.SoulMate,
  };
}

function findNarrative(rating, primaryGender, type = 'love') {
  const want = primaryGender === 'M' ? 'm' : 'f';
  const rounded = Math.round(rating);
  const list = oca.rc_narrative.filter((r) =>
    (r.Type || '').toLowerCase() === type &&
    (r.PrimaryGender || '').toLowerCase() === want,
  );
  let best = null;
  let bestDelta = Infinity;
  for (const r of list) {
    const d = Math.abs((r.Rating || 0) - rounded);
    if (d < bestDelta) { best = r; bestDelta = d; }
  }
  return best?.Narrative || null;
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { person1, person2 } = req.body || {};
  if (!person1?.birthday || !person2?.birthday) {
    return res.status(400).json({ error: 'Both birthdays required' });
  }

  try {
    const p1 = calculatePillars(person1.birthday, person1.birthTime || null);
    const p2 = calculatePillars(person2.birthday, person2.birthTime || null);
    const sign1 = normSign(p1.year.branch.animal);
    const sign2 = normSign(p2.year.branch.animal);

    const match = findSignMatch(sign1, sign2);
    const rating = match?.Rating ?? null;
    const gender1 = (person1.gender || 'M').toUpperCase();

    const result = {
      person1: {
        sign: sign1,
        pillars: p1,
        elements: tallyElements(p1),
        dominantElement: dominantElement(tallyElements(p1)),
      },
      person2: {
        sign: sign2,
        pillars: p2,
        elements: tallyElements(p2),
        dominantElement: dominantElement(tallyElements(p2)),
      },
      rating,
      generalDescription: match?.GeneralMatchDescription || null,
      yinYangDescription: match?.YinYangDescription || null,
      theGood: match?.TheGood || null,
      theBad: match?.TheBad || null,
      soulMate: findSoulMate(sign1, sign2, gender1),
      narrative: rating != null ? findNarrative(rating, gender1, 'love') : null,
    };

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
