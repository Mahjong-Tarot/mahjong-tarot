// Server-side wrapper that assembles a "quick reading" packet from the
// existing reading libraries. Used by /api/admin/quick-reading to
// build the email body.
//
// Pure-function libs (bazi, purpleStar, three-blessings) are imported
// directly. Data-backed libs (almanac, horoscopes) are queried inline
// using a fresh server-side supabase client so we don't depend on the
// module-level browser client.

import { createClient } from '@supabase/supabase-js';
import {
  calculatePillars,
  tallyElements,
  dominantElement,
  getZodiacAnimal,
} from './bazi';
import { calculatePurpleStar } from './purpleStar';
import { computeThreeBlessings } from './three-blessings';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ALMANAC_START = '2026-02-17';
const ALMANAC_END_EXCLUSIVE = '2032-02-10';

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

function serverSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function fetchAlmanac(date) {
  if (!date) return null;
  if (date < ALMANAC_START || date >= ALMANAC_END_EXCLUSIVE) return null;
  const sb = serverSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('almanac_days')
    .select('date, weekday, score, tone, officer, activities, year_conflict, auspicious_hours, holiday, lunar_day, lunar_month')
    .eq('date', date)
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('quickReading: almanac fetch error', error);
    return null;
  }
  return data;
}

async function fetchChineseHoroscope(date, animal) {
  if (!date || !animal) return null;
  const sb = serverSupabase();
  if (!sb) return null;
  const scope = animal.toLowerCase();
  const { data, error } = await sb
    .from('horoscopes')
    .select('scope, category, text, score, tone')
    .eq('date', date)
    .eq('scope', scope)
    .eq('status', 'published');
  if (error) {
    // eslint-disable-next-line no-console
    console.error('quickReading: horoscope fetch error', error);
    return null;
  }
  if (!data || data.length === 0) return null;
  const byCategory = {};
  for (const row of data) byCategory[row.category] = row;
  return {
    animal,
    general: byCategory.general?.text || null,
    love:    byCategory.love?.text    || null,
    money:   byCategory.money?.text   || null,
  };
}

/**
 * Build a full reading packet from subject birth data + a consultation date.
 *
 * @param {object} args
 * @param {string} args.name
 * @param {string} args.birthday        YYYY-MM-DD
 * @param {string} [args.birthTime]     HH:MM
 * @param {string} [args.birthPlace]
 * @param {string} [args.gender]        'M' | 'F'
 * @param {string} args.consultationDate YYYY-MM-DD
 */
export async function buildQuickReading({ name, birthday, birthTime, birthPlace, gender, consultationDate }) {
  if (!birthday || !consultationDate) {
    throw new Error('birthday and consultationDate are required');
  }

  // Pure (synchronous) computations
  const pillars = calculatePillars(birthday, birthTime || null);
  const elements = pillars ? tallyElements(pillars) : null;
  const dominant = elements ? dominantElement(elements) : null;
  const zodiacAnimal = pillars?.year?.branch?.animal || getZodiacAnimal(birthday);

  const ziwei = birthTime
    ? calculatePurpleStar({ birthday, birthTime, gender })
    : null;

  const threeBlessings = computeThreeBlessings({ birthday, birthTime });

  // Data-backed (async) sections
  const [almanac, chineseHoroscope] = await Promise.all([
    fetchAlmanac(consultationDate),
    fetchChineseHoroscope(consultationDate, zodiacAnimal),
  ]);

  return {
    subject: {
      name: name || null,
      birthday,
      birthTime: birthTime || null,
      birthPlace: birthPlace || null,
      gender: gender || null,
      zodiacAnimal,
      westernSign: westernSunSign(birthday),
    },
    consultationDate,
    bazi: pillars ? { pillars, elements, dominant } : null,
    ziwei,
    threeBlessings,
    almanac,
    horoscope: {
      chinese: chineseHoroscope,
      western: westernSunSign(birthday),
    },
  };
}
