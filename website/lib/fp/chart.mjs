// Four Pillars (Life Cycle) chart engine.
//
// A faithful port of the core of astro-eng/astro's
// src/library/chinese-astrology/calculation.ts: the element counting
// (stem + branch + nayin per pillar), the matriculation formula that sets the
// per-person stage cycle, and the Fate/Force assignment.
//
// The one substitution: the ganzhi (heavenly stem + earthly branch) of each
// pillar comes from `lunar-typescript` (the same library bazi.js already uses),
// which reproduces Bill's engine's ganzhi exactly for the golden sample
// (see docs/features/four-pillars-report/PHASE-1-FINDINGS.md). Everything
// downstream — the element triple per pillar, the counts, the stages — is read
// from the ported pillars-of-fate table so it stays identical to Bill's engine.

import { Solar } from 'lunar-typescript';
import {
  ELEMENT_NAMES,
  STEM_ORDER,
  BRANCH_ORDER,
  ELEMENT_ORDER,
  MATRICULATION_ELEMENTS,
  STAGES,
  PILLARS_OF_FATE,
} from './data.mjs';

// cyclical lookup keyed by "stem,branch" (both 1-indexed).
const POF_BY_STEM_BRANCH = new Map(
  PILLARS_OF_FATE.map((r) => [`${r.stem},${r.branch}`, r]),
);

/** Resolve a ganzhi (gan/zhi Chinese chars) to its pillars-of-fate row. */
function pofForGanzhi(gan, zhi) {
  const stem = STEM_ORDER.indexOf(gan) + 1;
  const branch = BRANCH_ORDER.indexOf(zhi) + 1;
  const row = POF_BY_STEM_BRANCH.get(`${stem},${branch}`);
  if (!row) throw new Error(`No pillars-of-fate row for ${gan}${zhi}`);
  return row;
}

/**
 * Fate/Force table — ported verbatim from calculation.ts getElementForce().
 * efFate is the year pillar's branch element; elementId is the stage element.
 */
function getElementForce(efFate, elementId) {
  const table = {
    1: { 2: 'happiness', 3: 'recognition', 4: 'wealth', 5: 'opportunity' },
    2: { 3: 'happiness', 4: 'recognition', 5: 'wealth', 1: 'opportunity' },
    3: { 4: 'happiness', 5: 'recognition', 1: 'wealth', 2: 'opportunity' },
    4: { 5: 'happiness', 1: 'recognition', 2: 'wealth', 3: 'opportunity' },
    5: { 1: 'happiness', 2: 'recognition', 3: 'wealth', 4: 'opportunity' },
  };
  return table[efFate]?.[elementId] ?? 'fate';
}

const clamp05 = (n) => (n <= 0 ? 0 : n >= 5 ? 5 : n);

/**
 * Build the Four Pillars (Life Cycle) chart for a birth.
 *
 * @param {object} args
 * @param {string} args.birthday   YYYY-MM-DD
 * @param {string|null} [args.birthTime]  HH:MM (24h); omit for no-hour reading
 * @returns {object|null} chart, or null if birthday is unusable
 */
export function buildFourPillarsChart({ birthday, birthTime }) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  if (!y || !m || !d) return null;

  const hasHour = Boolean(birthTime);
  let hour = 12;
  let minute = 0;
  if (hasHour) {
    const parts = String(birthTime).split(':').map(Number);
    if (!Number.isNaN(parts[0])) {
      hour = parts[0];
      minute = parts[1] || 0;
    }
  }

  const ec = Solar.fromYmdHms(y, m, d, hour, minute, 0).getLunar().getEightChar();

  // Positions mirror calculation.ts: index 0=hour, 1=day, 2=month, 3=year.
  const pillars = {
    year: pofForGanzhi(ec.getYearGan(), ec.getYearZhi()),
    month: pofForGanzhi(ec.getMonthGan(), ec.getMonthZhi()),
    day: pofForGanzhi(ec.getDayGan(), ec.getDayZhi()),
    hour: hasHour ? pofForGanzhi(ec.getTimeGan(), ec.getTimeZhi()) : null,
  };

  // Element counting: each present pillar adds +1 to three elements
  // (stem, branch, nayin). No-hour readings count three pillars.
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const counted = [pillars.year, pillars.month, pillars.day];
  if (hasHour) counted.push(pillars.hour);
  for (const p of counted) {
    counts[p.stemElement] += 1;
    counts[p.branchElement] += 1;
    counts[p.nayinElement] += 1;
  }

  // Matriculation — sets which element rules each life stage for this person.
  // Ported from calculation.ts: arrStemResults[3]=year stem, arrBranchResults[2]=month branch.
  const yearStem = pillars.year.stem;
  const monthBranch = pillars.month.branch;
  let matricLine = 1;
  let matricTemp = (yearStem - 0.5) * -3 + 6;
  while (12.5 - monthBranch > matricTemp) {
    matricLine += 1;
    matricTemp = (yearStem - 0.5) * -3 + matricLine * 6;
  }
  const matricElement = MATRICULATION_ELEMENTS[matricLine - 1];

  // Fill the five stages (Plate order 0..4 = Birth..Retirement), starting from
  // the matriculation element and walking the productive cycle.
  const yearBranchElement = pillars.year.branchElement; // efFate
  let et = ELEMENT_ORDER.indexOf(matricElement);
  const stages = new Array(5);
  for (let stageY = 2; stageY <= 6; stageY++) {
    const x = stageY % 5;
    const elementId = ELEMENT_ORDER[et % 5];
    stages[x] = {
      stage: STAGES[x],
      elementId,
      element: ELEMENT_NAMES[elementId],
      count: counts[elementId], // raw count = the stage's Chi rating input
      force: getElementForce(yearBranchElement, elementId),
    };
    et += 1;
  }

  const byName = (obj) => ({
    Wood: obj[1], Fire: obj[2], Earth: obj[3], Metal: obj[4], Water: obj[5],
  });
  const ratings = {};
  for (const id of ELEMENT_ORDER) ratings[id] = clamp05(counts[id]);
  const mix = ELEMENT_ORDER.map((id) => ratings[id]).sort((a, b) => b - a).join('');

  return {
    hasHour,
    pillars,
    elementCounts: byName(counts),
    elementRatings: byName(ratings),
    mix,
    matriculation: { line: matricLine, element: matricElement, elementName: ELEMENT_NAMES[matricElement] },
    stages,
  };
}
