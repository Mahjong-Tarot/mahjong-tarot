// Legacy Purple Star chart API — now backed by the proprietary native engine
// (lib/ps/chart.mjs). No third-party astrology library. Kept as a thin adapter so
// existing callers (member dashboard, admin private-readings) need no changes.

import { data } from './ps/data.mjs';
import { buildChartFromBirth } from './ps/chart.mjs';

// internal palace key → the display label these legacy surfaces expect
const KEY_TO_LABEL = {
  Ming: 'Ming', Siblings: 'Siblings', Marriage: 'Marriage', Children: 'Children',
  Wealth: 'Wealth', Health: 'Health', Travel: 'Travel', Associates: 'Servants',
  Career: 'Career', Property: 'Property', Happiness: 'Leisure', Parents: 'Parents',
};
const MUTAGEN_LABELS = { 禄: 'Lu', 权: 'Quan', 科: 'Ke', 忌: 'Ji' };

export function hourToTimeIndex(hour) {
  if (hour == null || Number.isNaN(hour)) return null;
  return Math.floor(((hour % 24) + 1) / 2) % 12;
}

const mapStar = (s) => ({
  name: s.display, hanzi: s.hanzi, pinyin: s.roman || '',
  type: s.billType === 'Major' ? 'major' : 'minor',
  brightness: s.brightness || '', mutagen: MUTAGEN_LABELS[s.mutagen] || s.mutagen || null,
});

/**
 * Compute a Purple Star (Zi Wei Dou Shu) chart. Requires date + time of birth.
 * @param {object} args
 * @param {string} args.birthday   YYYY-MM-DD
 * @param {string} args.birthTime  HH:MM (24h)
 * @param {string} [args.gender]   'M' | 'F'
 */
export function calculatePurpleStar({ birthday, birthTime, gender }) {
  if (!birthday || !birthTime) return null;
  const hour = parseInt(String(birthTime).split(':')[0], 10);
  if (Number.isNaN(hour)) return null;
  const g = (gender === 'F' || gender === 'female' || gender === '女') ? 'female' : 'male';

  let chart;
  try {
    chart = buildChartFromBirth({ solarDate: birthday, hour, gender: g }, data);
  } catch (err) {
    return null;
  }

  const palaces = chart.palaces.map((p) => ({
    branch: p.branchHan, animal: p.animal, branchHan: p.branchHan,
    name: KEY_TO_LABEL[p.key] || p.label, rawName: p.key,
    isMing: p.key === 'Ming', isBody: !!p.isBody,
    decade: p.decade ? p.decade.range : null,
    ages: p.ages || [],
    majorStars: p.majors.map(mapStar),
    minorStars: p.minors.map(mapStar),
    adjStars: [],
  }));

  const ming = palaces.find((p) => p.isMing) || null;
  const body = palaces.find((p) => p.isBody) || null;

  return {
    solarDate: birthday,
    lunarDate: chart.meta.lunar,
    chineseDate: chart.meta.chinese,
    fiveElementsClass: chart.meta.fiveElements,
    soulStar: chart.meta.soul,
    bodyStar: chart.meta.body,
    soulBranch: ming ? ming.branch : null,
    bodyBranch: body ? body.branch : null,
    lifePalace: ming ? { branchHan: ming.branchHan, animal: ming.animal } : null,
    bodyPalace: body ? { branchHan: body.branchHan, animal: body.animal } : null,
    palaces,
  };
}
