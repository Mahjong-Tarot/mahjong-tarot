// Four Pillars (Life Cycle) reading assembler.
//
// Turns a chart (from chart.mjs) into a full `reading` object by looking up
// Bill's authored narrative content (content.mjs). The per-stage chi/fate lookup
// is validated to reproduce the golden sample word-for-word
// (see docs/features/four-pillars-report/PHASE-1-FINDINGS.md).

import { ELEMENT_NAMES, SIGN_NAMES } from './data.mjs';

const clamp = (n, hi) => (n < 0 ? 0 : n > hi ? hi : n);

/**
 * Assemble the Life Cycle reading for a chart.
 * @param {object} chart    output of buildFourPillarsChart()
 * @param {object} content  the narrative content maps (from content.mjs in the
 *                          app, or content-node.mjs loadContent() in scripts)
 * @returns {object|null} reading, or null if chart is missing
 */
export function buildFourPillarsReading(chart, content) {
  if (!chart) return null;
  const h = chart.hasHour ? 1 : 0;

  // ── Stages: the validated core (chi + fate + chi transition) ─────────────
  const stages = chart.stages.map((st, i) => {
    const rating = clamp(st.count, 9);
    const pr = content.periodRating[`${st.stage.toLowerCase()}|${h}|${rating}|${st.elementId}|${st.force}`] || {};
    let chiDelta = null;
    if (i > 0) {
      const prev = clamp(chart.stages[i - 1].count, 9);
      chiDelta = content.chiDelta[`${prev}|${rating}|${h}`] || null;
    }
    return {
      stage: st.stage,
      element: st.element,
      count: st.count,
      force: st.force,
      chi: pr.chi || null,
      fate: pr.fate || null,
      chiDelta,
    };
  });

  // ── Year sign section ────────────────────────────────────────────────────
  const signId = chart.pillars.year.branch;
  const yearElementId = chart.pillars.year.stemElement;
  const animal = SIGN_NAMES[signId];
  const yearElement = ELEMENT_NAMES[yearElementId];
  const fixed = content.eaSign[String(signId)] || {};
  const yearSign = {
    animal,
    element: yearElement,
    combined: `${yearElement} ${animal}`,
    fixedElement: fixed.fixedElementId ? ELEMENT_NAMES[fixed.fixedElementId] : null,
    fixedElementDescription: fixed.fixedElementDescription || null,
    personality: content.elementSign[`${yearElementId}|${signId}`] || null,
    traits: content.saSign[String(signId)] || null,
    years: content.signYears[String(signId)] || null,
  };

  // ── Element mix / strength section ───────────────────────────────────────
  const strengths = [1, 2, 3, 4, 5].map((id) => {
    const name = ELEMENT_NAMES[id];
    const count = chart.elementCounts[name];
    return { element: name, count, text: content.elementMix[`${h}|${id}|${clamp(count, 8)}`] || null };
  });
  const elementMix = {
    code: chart.mix,
    counts: chart.elementCounts,
    strengths,
    conclusion: content.mixConclusion[`${h}|${chart.mix}`] || null,
  };

  return {
    hasHour: chart.hasHour,
    yearSign,
    elementMix,
    stages,
    conclusion: content.lcConclusion[`${h}|${chart.mix}`] || null,
  };
}
