// Server-side wrapper that assembles a "quick reading" packet from the
// existing reading libraries. Used by /api/admin/quick-reading to
// build the email body.
//
// The astrologer ticks one or more reading types on the Quick Reading
// form. This function computes only the sections that were requested
// and leaves the others undefined so the HTML renderer skips them.

import {
  calculatePillars,
  tallyElements,
  dominantElement,
  getZodiacAnimal,
} from './bazi';
import { data as psData } from './ps/data.mjs';
import { buildChartFromBirth, chineseAge } from './ps/chart.mjs';
import { scoreChart, buildFullReport } from './ps/engine.mjs';
import { computeThreeBlessings } from './three-blessings';
import { computeFireHorseForecast } from './fire-horse-forecast';
import { computeCompatibility } from './compatibility';

// Western sun-sign date ranges (month-day). End is exclusive.
const WESTERN_SIGNS = [
  { name: 'Capricorn',   start: '01-01', end: '01-20' },
  { name: 'Aquarius',    start: '01-20', end: '02-19' },
  { name: 'Pisces',      start: '02-19', end: '03-21' },
  { name: 'Aries',       start: '03-21', end: '04-20' },
  { name: 'Taurus',      start: '04-20', end: '05-21' },
  { name: 'Gemini',      start: '05-21', end: '06-21' },
  { name: 'Cancer',      start: '06-21', end: '07-23' },
  { name: 'Leo',         start: '07-23', end: '08-23' },
  { name: 'Virgo',       start: '08-23', end: '09-23' },
  { name: 'Libra',       start: '09-23', end: '10-23' },
  { name: 'Scorpio',     start: '10-23', end: '11-22' },
  { name: 'Sagittarius', start: '11-22', end: '12-22' },
  { name: 'Capricorn',   start: '12-22', end: '12-32' },
];

function westernSunSign(birthday) {
  if (!birthday) return null;
  const md = birthday.slice(5); // 'MM-DD'
  return WESTERN_SIGNS.find((s) => md >= s.start && md < s.end)?.name || null;
}

export const READING_TYPES = ['bazi', 'ziwei', 'three_blessings', 'fire_horse', 'compatibility'];

/**
 * Build a Quick Reading packet for a subject (and optionally a partner
 * for compatibility). Only the reading types passed in `types` are
 * computed — every other section is left undefined so the renderer
 * skips it cleanly.
 *
 * @param {object} args
 * @param {object} args.subject  { name, birthday, birthTime, birthPlace, gender }
 * @param {object} [args.partner] { name, birthday, birthTime, gender }
 * @param {string[]} args.types  subset of READING_TYPES
 */
export function buildQuickReading({ subject, partner, types }) {
  if (!subject?.birthday) {
    throw new Error('subject.birthday is required');
  }
  if (!Array.isArray(types) || types.length === 0) {
    throw new Error('types must be a non-empty array');
  }

  const pillars = calculatePillars(subject.birthday, subject.birthTime || null);
  const zodiacAnimal = pillars?.year?.branch?.animal || getZodiacAnimal(subject.birthday);

  const out = {
    subject: {
      name: subject.name || null,
      birthday: subject.birthday,
      birthTime: subject.birthTime || null,
      birthPlace: subject.birthPlace || null,
      gender: subject.gender || null,
      zodiacAnimal,
      westernSign: westernSunSign(subject.birthday),
    },
    partner: partner ? {
      name: partner.name || null,
      birthday: partner.birthday,
      birthTime: partner.birthTime || null,
      gender: partner.gender || null,
    } : null,
    types,
  };

  if (types.includes('bazi') && pillars) {
    const elements = tallyElements(pillars);
    out.bazi = { pillars, elements, dominant: dominantElement(elements) };
  }

  if (types.includes('ziwei')) {
    // Native chart + full fate & luck report from Bill's authored Purple
    // Star data — the same engine that powers the member Purple Star
    // reading. null = requested but no birth time → renderer shows a
    // fallback message.
    out.ziwei = null;
    out.ziweiFull = null;
    if (subject.birthTime) {
      try {
        const solarDate = subject.birthday.split('-').map(Number).join('-');
        const chart = buildChartFromBirth({
          solarDate,
          hour: parseInt(subject.birthTime.split(':')[0], 10),
          gender: subject.gender === 'F' ? 'female' : 'male',
        }, psData);
        chart.name = (subject.name || 'Your').split(' ')[0];
        chart.currentAge = chineseAge(solarDate);
        scoreChart(chart, psData);
        out.ziwei = chart;
        out.ziweiFull = buildFullReport(chart, psData);
        out.ziweiFull.genderAssumed = !subject.gender;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('quick-reading: ziwei chart failed', err);
      }
    }
  }

  if (types.includes('three_blessings')) {
    out.threeBlessings = computeThreeBlessings({
      birthday: subject.birthday,
      birthTime: subject.birthTime,
    });
  }

  if (types.includes('fire_horse')) {
    out.fireHorse = pillars ? computeFireHorseForecast(pillars) : null;
  }

  if (types.includes('compatibility') && partner?.birthday) {
    out.compatibility = computeCompatibility(
      {
        name: subject.name,
        birthday: subject.birthday,
        birthTime: subject.birthTime || null,
        gender: subject.gender || null,
      },
      {
        name: partner.name,
        birthday: partner.birthday,
        birthTime: partner.birthTime || null,
        gender: partner.gender || null,
      },
    );
  }

  return out;
}
