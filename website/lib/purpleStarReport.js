// Deterministic Purple Star palace outlook.
//
// Selects Bill's authored palace narratives (data/purple-star-palaces.json,
// from his Purple Star Luck workbook) by classifying each palace's luck from
// the chart — never invents text. The luck classification follows classical
// Zi Wei Dou Shu brightness: a palace's score is the brightness-weighted sum
// of its major stars (with the opposite-palace "borrowing" rule for empty
// palaces), plus a small shift for the Four Transformations.
//
// The single highest/lowest-scoring palace becomes "Most/Least Lucky"; the
// rest are Generally Lucky / Generally Unlucky / Mixed. Thresholds live in
// LUCK below and are deliberately simple + tunable — calibrate against the
// sample readings in docs/architecture/readings/PurpleStar/.

import PALACES from '../data/purple-star-palaces.json';

// iztro brightness ('[+3]'..'[-3]', the 庙旺得利平不陷 scale) → luck weight.
function brightnessWeight(brightness) {
  if (!brightness) return 0;
  const m = String(brightness).match(/-?\d+/);
  if (!m) return 0;
  const n = parseInt(m[0], 10);
  if (n >= 3) return 2;    // 庙 / 旺 — Very Lucky
  if (n >= 1) return 1;    // 得 / 利 — Lucky
  if (n === 0) return 0;   // 平 — Even
  if (n >= -1) return -1;  // 不 — Unlucky
  return -2;               // 陷 — Very Unlucky
}

// Four Transformations: Lu / Quan / Ke lift a star; Ji drags it down.
function mutagenShift(mutagen) {
  if (mutagen === 'Ji') return -1;
  if (mutagen === 'Lu' || mutagen === 'Quan' || mutagen === 'Ke') return 1;
  return 0;
}

// Opposite branch (對宮) — an empty palace borrows the opposite palace's stars.
const OPPOSITE_BRANCH = {
  zi: 'wu', wu: 'zi', chou: 'wei', wei: 'chou', yin: 'shen', shen: 'yin',
  mao: 'you', you: 'mao', chen: 'xu', xu: 'chen', si: 'hai', hai: 'si',
};

const LABEL = {
  mostLucky: 'Most Lucky',
  generallyLucky: 'Generally Lucky',
  mixed: 'Mixed Luck',
  generallyUnlucky: 'Generally Unlucky',
  leastLucky: 'Least Lucky',
};

function starScore(s) {
  return brightnessWeight(s.brightness) + mutagenShift(s.mutagen);
}

// The major stars that drive a palace's luck — borrowing from the opposite
// palace when this one has none.
function effectiveMajors(palace, byBranch) {
  if (palace.majorStars && palace.majorStars.length) {
    return { stars: palace.majorStars, borrowed: false };
  }
  const opp = byBranch[OPPOSITE_BRANCH[palace.branch]];
  return { stars: (opp && opp.majorStars) || [], borrowed: true };
}

function categorize(score, stars, isLuckiest, isUnluckiest) {
  if (isLuckiest) return 'mostLucky';
  if (isUnluckiest) return 'leastLucky';
  const hasPos = stars.some((s) => starScore(s) > 0);
  const hasNeg = stars.some((s) => starScore(s) < 0);
  if (hasPos && hasNeg) return 'mixed';
  if (score > 0) return 'generallyLucky';
  if (score < 0) return 'generallyUnlucky';
  return 'mixed';
}

/**
 * Compute the per-palace luck outlook for a chart from calculatePurpleStar().
 * Returns { palaces: [...], luckiest, unluckiest } where each palace entry is
 * { name, score, category, label, narrative, extremeNarrative, borrowed }.
 * Returns null if the chart is missing.
 */
export function computePalaceOutlook(chart) {
  if (!chart || !Array.isArray(chart.palaces)) return null;

  const byBranch = {};
  for (const p of chart.palaces) byBranch[p.branch] = p;

  // Only the 12 life palaces we have authored narratives for.
  const scored = chart.palaces
    .filter((p) => PALACES[p.name])
    .map((p) => {
      const { stars, borrowed } = effectiveMajors(p, byBranch);
      const score = stars.reduce((sum, s) => sum + starScore(s), 0);
      return { name: p.name, branch: p.branch, stars, borrowed, score };
    });

  if (!scored.length) return null;

  // Single luckiest / unluckiest by score (first wins ties, deterministic).
  let luckiest = scored[0];
  let unluckiest = scored[0];
  for (const s of scored) {
    if (s.score > luckiest.score) luckiest = s;
    if (s.score < unluckiest.score) unluckiest = s;
  }
  // If everything ties (all equal), don't force a luckiest/unluckiest split.
  const allEqual = luckiest.score === unluckiest.score;

  const palaces = scored.map((s) => {
    const isLuckiest = !allEqual && s === luckiest;
    const isUnluckiest = !allEqual && s === unluckiest;
    const category = categorize(s.score, s.stars, isLuckiest, isUnluckiest);
    const data = PALACES[s.name];
    return {
      name: s.name,
      score: s.score,
      borrowed: s.borrowed,
      category,
      label: LABEL[category],
      narrative: data.conclusion[category],
      extremeNarrative: isLuckiest ? data.luckiest : isUnluckiest ? data.unluckiest : null,
    };
  });

  return {
    palaces,
    luckiest: allEqual ? null : palaces.find((p) => p.name === luckiest.name),
    unluckiest: allEqual ? null : palaces.find((p) => p.name === unluckiest.name),
  };
}
