import { supabase } from './supabase';

export async function pathForUser(userId) {
  if (!userId || !supabase) return '/member/dashboard';
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (data?.role === 'admin') return '/admin';
  if (data?.role === 'astrologer') return '/admin/private-readings';
  return '/member/dashboard';
}

export const REPORTS = [
  {
    glyph: '日',
    name: 'Daily Almanac',
    desc: "The day's auspicious and inauspicious activities, drawn from the Chinese almanac, tuned to today's energy.",
  },
  {
    glyph: '運',
    name: 'Daily Horoscope',
    desc: 'A reading for your sign, refreshed every day. Short, specific, and grounded in the tradition rather than generic.',
  },
  {
    glyph: '紫',
    name: 'Purple Star',
    desc: 'Your Zi Wei Dou Shu chart, the most detailed system in Chinese astrology, mapped across the twelve palaces of life.',
  },
  {
    glyph: '三',
    name: 'Three Blessings',
    desc: 'Fu, Lu, Shou, your reading on fortune, prosperity, and longevity, and how each is moving for you this year.',
  },
  {
    glyph: '合',
    name: 'Compatibility Calculator',
    desc: 'Run any two birth charts side by side: relationships, business partners, family. See where you align and where you grind.',
  },
  {
    glyph: '柱',
    name: 'Four Pillars Chart',
    desc: 'Your full Bazi chart, year, month, day, and hour, with element balance, favorable elements, and luck-pillar timeline.',
  },
];
