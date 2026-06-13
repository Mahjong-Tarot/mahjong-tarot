// Purple Star report engine — deterministic, data-driven.
//
// Consumes Bill's imported workbook data (data/ps/*.json) plus a computed chart
// and produces either a full fate+luck report or a single-palace reading.
// No invention: every sentence is selected from the authored narrative banks.
//
// Scoring follows the classical 三方四正 (San Fang Si Zheng): a palace is shaped
// by its own stars (focus, weight 1.0), the opposite/mirror palace (0.3), and
// the two trine palaces 4 branches away (0.3 each) — per Bill's call notes.

// Browser-safe: no Node built-ins here. Callers pass `data`
// ({stars,narratives,fate}); load it via data-node.mjs (scripts) or data.mjs (app).

// ── branch + palace constants ───────────────────────────────────────────────
export const BRANCH_IDX = { 子:0, 丑:1, 寅:2, 卯:3, 辰:4, 巳:5, 午:6, 未:7, 申:8, 酉:9, 戌:10, 亥:11 };
export const BRANCH_ANIMAL = { 子:'Rat', 丑:'Ox', 寅:'Tiger', 卯:'Rabbit', 辰:'Dragon', 巳:'Snake',
  午:'Horse', 未:'Goat', 申:'Monkey', 酉:'Rooster', 戌:'Dog', 亥:'Pig' };
export const PALACE_CN_TO_KEY = { 命宫:'Ming', 兄弟:'Siblings', 夫妻:'Marriage', 子女:'Children',
  财帛:'Wealth', 疾厄:'Health', 迁移:'Travel', 仆役:'Associates', 官禄:'Career',
  田宅:'Property', 福德:'Happiness', 父母:'Parents' };
export const PALACE_LABEL = { Ming:'Fate', Siblings:'Siblings', Marriage:'Marriage', Children:'Children',
  Wealth:'Wealth', Health:'Health', Travel:'Travel', Associates:'Friends', Career:'Career',
  Property:'Property', Happiness:'Wellbeing', Parents:'Parents' };

// brightness (庙旺得利平不陷) → luck code + weight
const BRIGHT = { 庙:['VL',2], 旺:['VL',2], 得:['L',1], 利:['L',1], 平:['neutral',0], 不:['U',-1], 陷:['VUL',-2] };
const MUTAGEN = { 禄:1, 权:1, 科:1, 忌:-1, Lu:1, Quan:1, Ke:1, Ji:-1 };

export function brightnessInfo(brightness, mutagen) {
  const b = BRIGHT[brightness] || ['neutral', 0];
  let [code, weight] = b;
  const shift = MUTAGEN[mutagen] || 0;
  weight += shift;
  if (shift > 0 && code === 'neutral') code = 'L';
  if (shift < 0 && code === 'neutral') code = 'U';
  return { code, weight };
}

// 三方四正: focus + opposite(+6) + trine(+4,+8)
export function sanFangSiZheng(idx) {
  return { focus: idx, opposite: (idx + 6) % 12, trine: [(idx + 4) % 12, (idx + 8) % 12] };
}
const WEIGHTS = { focus: 1.0, opposite: 0.3, trine: 0.3 }; // tunable; calibrate vs samples

// ── scoring ──────────────────────────────────────────────────────────────────
function palaceRawScore(palace) {
  let s = 0;
  for (const st of palace.majors) s += st.weight;
  for (const st of palace.minors) s += st.weight * 0.5;
  return s;
}

export function scoreChart(chart) {
  const byBranch = {};
  for (const p of chart.palaces) byBranch[p.branchIdx] = p;
  for (const p of chart.palaces) {
    const sfsz = sanFangSiZheng(p.branchIdx);
    let score = WEIGHTS.focus * palaceRawScore(p);
    score += WEIGHTS.opposite * palaceRawScore(byBranch[sfsz.opposite]);
    for (const t of sfsz.trine) score += WEIGHTS.trine * palaceRawScore(byBranch[t]);
    p.score = Math.round(score * 100) / 100;
    p.influences = sfsz;
  }
  // rank palaces → luck category
  const ranked = [...chart.palaces].sort((a, b) => b.score - a.score);
  const top = ranked[0], bottom = ranked[ranked.length - 1];
  const tie = top.score === bottom.score;
  for (const p of chart.palaces) {
    const hasPos = p.majors.some((s) => s.weight > 0) || p.minors.some((s) => s.weight > 0);
    const hasNeg = p.majors.some((s) => s.weight < 0) || p.minors.some((s) => s.weight < 0);
    if (!tie && p === top) p.luck = 'mostLucky';
    else if (!tie && p === bottom) p.luck = 'leastLucky';
    else if (hasPos && hasNeg) p.luck = 'mixed';
    else if (p.score > 0.001) p.luck = 'generallyLucky';
    else if (p.score < -0.001) p.luck = 'generallyUnlucky';
    else p.luck = 'mixed';
  }
  chart.luckiest = tie ? null : top;
  chart.unluckiest = tie ? null : bottom;
  return chart;
}

// Fate-bank level derives from the palace's luck category, so the conclusion
// and the fate traits never contradict each other.
const LUCK_TO_LEVEL = { mostLucky:'VL', generallyLucky:'L', mixed:'mixed', generallyUnlucky:'UL', leastLucky:'VUL' };
function fateLevel(p) { return LUCK_TO_LEVEL[p.luck] || 'mixed'; }
// score → decade Yun rating (matches Decade_Yun sheet keys)
function yunRating(score) {
  if (score >= 2) return 'Very Favorable';
  if (score >= 0.5) return 'Favorable';
  if (score <= -2) return 'Very Unfavorable';
  if (score <= -0.5) return 'Unfavorable';
  return 'Neutral';
}
const RATING_LABEL = { VL:'Very Lucky', L:'Lucky', mixed:'Mixed', UL:'Unlucky', VUL:'Very Unlucky' };

// luck-code combo key for a set of stars (descending VL>L>U>VUL, max 3).
// The workbook has no "neutral" code, so a 平-brightness star (e.g. the Emperor)
// is bucketed as L for narrative lookup — it still counts.
function comboKey(stars) {
  const order = { VL:0, L:1, U:2, VUL:3 };
  const codes = stars.map((s) => (s.code === 'neutral' ? 'L' : s.code))
    .filter((c) => c in order).sort((a, b) => order[a] - order[b]);
  return codes.slice(0, 3).join(',');
}

// Part 2 — years/ages. Each age is ruled by the palace that lists it; its luck
// is that palace's, modulated by the decade it falls in. Rank → 10 best/worst.
function parseBucket(label) {
  const m = String(label).match(/(\d+)\s*-\s*(\d+)/);
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];
  const s = String(label).match(/(\d+)/);
  return s ? [parseInt(s[1], 10), parseInt(s[1], 10)] : [0, 0];
}
const LUCK_TO_RATING = { mostLucky:'Very Lucky', generallyLucky:'Lucky', mixed:'Neutral', generallyUnlucky:'Unlucky', leastLucky:'Very Unlucky' };

export function buildYears(chart, narratives, currentAge, maxAge = 100) {
  const ageToPalace = {};
  for (const p of chart.palaces) for (const a of (p.ages || [])) ageToPalace[a] = p;
  const decadeOf = (age) => chart.palaces.find((p) => p.decade && p.decade.range
    && age >= p.decade.range[0] && age <= p.decade.range[1]);
  const buckets = narratives.yearDescriptions.map((e) => ({ ...e, range: parseBucket(e.bucket) }));
  const bucketFor = (age) => buckets.find((b) => age >= b.range[0] && age <= b.range[1]) || buckets[buckets.length - 1];

  const scored = [];
  for (let age = 1; age <= maxAge; age++) {
    const pal = ageToPalace[age];
    if (!pal) continue;
    const dec = decadeOf(age);
    const score = pal.score + (dec ? 0.3 * dec.score : 0);
    scored.push({ age, palace: pal, score, luck: pal.luck });
  }
  const byScore = [...scored].sort((a, b) => b.score - a.score);
  const pick = (entry, forceCat) => {
    const b = bucketFor(entry.age);
    const cat = forceCat || entry.luck;
    return { age: entry.age, bucket: b.bucket, palace: PALACE_LABEL[entry.palace.key],
      text: b[cat] || b.mixed };
  };
  const mostLucky = byScore.slice(0, 10).map((e) => pick(e, e.score > 0 ? null : 'generallyLucky'));
  const leastLucky = byScore.slice(-10).reverse().map((e) => pick(e, e.score < 0 ? null : 'generallyUnlucky'));

  // Next 12 months — keyed off the palace ruling the current age (Chinese age).
  let next = null;
  if (currentAge && ageToPalace[currentAge]) {
    const pal = ageToPalace[currentAge];
    const rating = LUCK_TO_RATING[pal.luck] || 'Neutral';
    const ny = narratives.nextYear[rating] || {};
    next = { age: currentAge, palace: PALACE_LABEL[pal.key], rating,
      firstMonths: ny.firstMonths, secondMonths: ny.secondMonths };
  }
  return { mostLucky, leastLucky, nextYear: next };
}

// ── report assembly ───────────────────────────────────────────────────────────
function fateTraits(fate, key, level, n = 4) {
  const bank = (fate[key] && (fate[key][level] || fate[key][level === 'mixed' ? 'mixed' : level])) || [];
  return bank.slice(0, n);
}

export function buildPalaceReading(chart, palaceKey, data) {
  const p = chart.palaces.find((x) => x.key === palaceKey);
  if (!p) return null;
  const { narratives, fate } = data;
  const byBranch = {}; for (const q of chart.palaces) byBranch[q.branchIdx] = q;
  const level = fateLevel(p);

  const conclusion = (narratives.palaceConclusion[palaceKey] || {})[p.luck]
    || (narratives.palaceConclusion[palaceKey] || {}).mixed;
  const combo = comboKey(p.majors);
  const comboNarr = (narratives.starCombo[combo] || {}).palace || (narratives.starCombo[combo] || {}).decade;

  const influences = {
    opposite: byBranch[p.influences.opposite],
    trine: p.influences.trine.map((t) => byBranch[t]),
  };
  return {
    type: 'palace',
    palace: { key: palaceKey, label: PALACE_LABEL[palaceKey], branch: p.branchHan, animal: p.animal,
      score: p.score, luck: p.luck, level },
    stars: { majors: p.majors, minors: p.minors },
    narrative: {
      conclusion,
      starCombo: comboNarr ? (comboNarr.major || comboNarr.minor) : null,
      fate: fateTraits(fate, palaceKey, level, 6),
    },
    sanFangSiZheng: {
      focus: { palace: PALACE_LABEL[palaceKey], stars: p.majors.map((s) => s.display) },
      opposite: { palace: PALACE_LABEL[influences.opposite.key], branch: influences.opposite.branchHan,
        stars: [...influences.opposite.majors, ...influences.opposite.minors].map((s) => s.display) },
      trine: influences.trine.map((t) => ({ palace: PALACE_LABEL[t.key], branch: t.branchHan,
        stars: [...t.majors, ...t.minors].map((s) => s.display) })),
    },
  };
}

export function buildFullReport(chart, data) {
  const { narratives, fate } = data;
  // Part 1 — decades (sorted by start age)
  const decades = [...chart.palaces]
    .filter((p) => p.decade && p.decade.range)
    .sort((a, b) => a.decade.range[0] - b.decade.range[0])
    .map((p, i) => {
      const num = String(i + 1);
      const rating = yunRating(p.score);
      const majCombo = comboKey(p.majors);
      const minCombo = comboKey(p.minors);
      const sc = narratives.starCombo;
      return {
        index: num, ages: p.decade.range, palace: PALACE_LABEL[p.key], branch: p.branchHan,
        score: p.score, rating,
        major: (sc[majCombo] || {}).decade?.major || null,
        minor: (sc[minCombo] || {}).decade?.minor || null,
        yun: (narratives.decadeYun[num] || {})[rating] || null,
        start: (narratives.decadeStart[rating] || narratives.decadeStart[ratingToAusp(rating)] || {}),
      };
    });
  const ranked = [...decades].sort((a, b) => b.score - a.score);
  const luckiestDecade = ranked[0], unluckiestDecade = ranked[ranked.length - 1];
  if (luckiestDecade) luckiestDecade.period = (narratives.decadePeriod[luckiestDecade.index] || {}).luckiest;
  if (unluckiestDecade) unluckiestDecade.period = (narratives.decadePeriod[unluckiestDecade.index] || {}).unluckiest;

  // Part 3 — the 12 palaces (fate + luck)
  const palaces = chart.palaces
    .slice()
    .sort((a, b) => PALACE_ORDER.indexOf(a.key) - PALACE_ORDER.indexOf(b.key))
    .map((p) => {
      const level = fateLevel(p);
      return {
        key: p.key, label: PALACE_LABEL[p.key], branch: p.branchHan, animal: p.animal,
        luck: p.luck, score: p.score,
        conclusion: (narratives.palaceConclusion[p.key] || {})[p.luck]
          || (narratives.palaceConclusion[p.key] || {}).mixed,
        extreme: chart.luckiest === p ? (narratives.palaceExtreme[p.key] || {}).luckiest
          : chart.unluckiest === p ? (narratives.palaceExtreme[p.key] || {}).unluckiest : null,
        fate: fateTraits(fate, p.key, level, 5),
        majors: p.majors, minors: p.minors,
      };
    });

  const years = buildYears(chart, narratives, chart.currentAge);

  return {
    type: 'full',
    luckiestPalace: chart.luckiest ? PALACE_LABEL[chart.luckiest.key] : null,
    unluckiestPalace: chart.unluckiest ? PALACE_LABEL[chart.unluckiest.key] : null,
    decades, luckiestDecade, unluckiestDecade, years, palaces,
  };
}

const PALACE_ORDER = ['Ming','Siblings','Marriage','Children','Wealth','Health','Travel','Associates','Career','Property','Happiness','Parents'];
function ratingToAusp(r) { return r; }
