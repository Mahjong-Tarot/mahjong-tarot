// Server-side Fire Horse 2026 forecast composer. Mirrors the
// client-side useMemo chain in pages/year-of-the-fire-horse.jsx
// so the same forecast can be embedded in the admin Quick Reading
// email packet.

import signsScores from '../data/fire-horse/signs-scores.json';
import dmScores from '../data/fire-horse/day-master-scores.json';
import signsNarrative from '../data/fire-horse/signs-narrative.json';
import dmNarrative from '../data/fire-horse/day-master-narrative.json';
import yearOverview from '../data/fire-horse/year-overview.json';
import { STEMS } from './bazi';
import { findEntry, BAND_FOR, FIXED_ELEMENT, topMonths } from './fire-horse';

/**
 * Compose a personalized Fire Horse 2026 forecast from a pillars object
 * (output of calculatePillars). Returns null if sign / element cannot be
 * resolved (e.g. pillars missing).
 */
export function computeFireHorseForecast(pillars) {
  if (!pillars) return null;

  const sign = pillars.year?.branch?.animal?.toLowerCase();
  const yearStemElement = pillars.year?.stem?.element?.toLowerCase();
  if (!sign) return null;

  const effectiveElement = yearStemElement || FIXED_ELEMENT[sign];
  const baseEntry = findEntry(sign, effectiveElement);
  if (!baseEntry) return null;

  const dmHan = pillars.day?.gan;
  const dayMasterStem = dmHan ? STEMS[dmHan] : null;
  const dayMasterEntry = dayMasterStem
    ? dmScores.find((d) => d.stem === dayMasterStem.en)
    : null;

  const yearLift = dayMasterEntry?.year_lift ?? 0;
  const monthLifts = dayMasterEntry?.monthly_lifts ?? [];

  const monthly = baseEntry.monthly_scores.map((m, i) => {
    const monthLift = monthLifts[i]?.lift ?? 0;
    const raw = m.score + yearLift + monthLift;
    const score = Math.max(0.05, Math.min(0.95, raw));
    return { ...m, score, base_score: m.score, monthLift };
  });
  const yearScore = Math.max(0.05, Math.min(0.95, baseEntry.year_score + yearLift));
  const monthlyAvg = monthly.reduce((s, m) => s + m.score, 0) / 12;

  return {
    sign,
    effectiveElement,
    yearScore,
    yearBand: BAND_FOR(yearScore),
    monthlyAvg,
    monthly,
    bestMonths: topMonths(monthly, 3),
    worstMonths: topMonths(monthly, 3, true),
    signNarrative: signsNarrative[sign] || null,
    dayMaster: dayMasterStem ? {
      en: dayMasterStem.en,
      hanzi: dmHan,
      element: dayMasterStem.element,
      polarity: dayMasterStem.polarity,
      lift: yearLift,
      narrative: dmNarrative[dayMasterStem.en] || null,
    } : null,
    lunarMonths: yearOverview.lunar_months,
  };
}
