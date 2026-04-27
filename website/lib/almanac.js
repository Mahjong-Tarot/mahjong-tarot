import { supabase } from './supabase';

export const LNY_2026 = '2026-02-17';
export const LNY_2027 = '2027-02-06';

export function todayInLA() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(new Date());
}

export function isValidAlmanacDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  if (d < LNY_2026) return false;
  if (d >= LNY_2027) return false;
  return true;
}

export async function fetchAlmanacForDate(date) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('almanac_days')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) {
    console.error('fetchAlmanacForDate', date, error);
    return null;
  }
  return data;
}

export async function fetchAlmanacSummariesForMonth(yearMonth) {
  if (!supabase) return [];
  const [y, m] = yearMonth.split('-').map(Number);
  const start = `${yearMonth}-01`;
  const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('almanac_day_summary')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: true });
  if (error) {
    console.error('fetchAlmanacSummariesForMonth', yearMonth, error);
    return [];
  }
  return data || [];
}

export function shiftDate(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function shiftMonth(yyyymm, delta) {
  const [y, m] = yyyymm.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function formatHumanDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function formatMonthHuman(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
