import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function client() {
  return url ? createClient(url, anon) : null;
}

export const LNY_2026 = '2026-02-17';

export function todayInLA() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(new Date());
}

export async function fetchHoroscopesForDate(date) {
  const sb = client();
  if (!sb) return [];
  const { data, error } = await sb
    .from('horoscopes')
    .select('date,scope,category,text,score,tone,signal_payload')
    .eq('date', date)
    .eq('status', 'published');
  if (error) {
    console.error('fetchHoroscopesForDate', date, error);
    return [];
  }
  return data || [];
}

export async function fetchDaySummariesForMonth(yearMonth) {
  // yearMonth: "YYYY-MM"
  const sb = client();
  if (!sb) return [];
  const start = `${yearMonth}-01`;
  const [y, m] = yearMonth.split('-').map(Number);
  const end = new Date(Date.UTC(y, m, 0));
  const endStr = end.toISOString().slice(0, 10);

  const { data, error } = await sb
    .from('horoscope_day_summary')
    .select('date,general_score,general_tone,pillars,match_day,western_moment')
    .gte('date', start)
    .lte('date', endStr)
    .order('date', { ascending: true });
  if (error) {
    console.error('fetchDaySummariesForMonth', yearMonth, error);
    return [];
  }
  return data || [];
}

export function isValidHoroscopeDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  if (d < LNY_2026) return false;
  if (d > todayInLA()) return false;
  return true;
}
