import { supabase } from './supabase';

export const LNY_2026 = '2026-02-17';
export const LNY_2027 = '2027-02-06';
export const ALMANAC_RANGE_START = '2026-02-17';
export const ALMANAC_RANGE_END_EXCLUSIVE = '2032-02-10';

export function todayInLA() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  return fmt.format(new Date());
}

export function isValidAlmanacDate(d) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  if (d < ALMANAC_RANGE_START) return false;
  if (d >= ALMANAC_RANGE_END_EXCLUSIVE) return false;
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

export const ACTIVITIES = [
  { key: 'StartABusiness', label: 'Start a Business', slug: 'start-a-business', phrase: 'starting a business' },
  { key: 'GetMarried', label: 'Get Married', slug: 'get-married', phrase: 'getting married' },
  { key: 'MoveHomes', label: 'Move Homes', slug: 'move-homes', phrase: 'moving homes' },
  { key: 'SexualActivity', label: 'Intimacy', slug: 'intimacy', phrase: 'intimacy' },
  { key: 'EatOut', label: 'Eat Out', slug: 'eat-out', phrase: 'eating out' },
  { key: 'ConfrontYourBoss', label: 'Confront Your Boss', slug: 'confront-your-boss', phrase: 'confronting your boss' },
  { key: 'AdvanceYourCareer', label: 'Advance Your Career', slug: 'advance-your-career', phrase: 'advancing your career' },
  { key: 'Travel', label: 'Travel', slug: 'travel', phrase: 'travel' },
  { key: 'GoOnADate', label: 'Go On a Date', slug: 'go-on-a-date', phrase: 'going on a date' },
  { key: 'CleanTheHouse', label: 'Clean the House', slug: 'clean-the-house', phrase: 'cleaning the house' },
  { key: 'WorkInTheGarden', label: 'Garden', slug: 'garden', phrase: 'gardening' },
  { key: 'DoYourHair', label: 'Do Your Hair', slug: 'do-your-hair', phrase: 'doing your hair' },
  { key: 'DoYourNails', label: 'Do Your Nails', slug: 'do-your-nails', phrase: 'doing your nails' },
  { key: 'CheckYourHealth', label: 'Check Your Health', slug: 'check-your-health', phrase: 'a health check' },
  { key: 'EnjoyFamilyTime', label: 'Family Time', slug: 'family-time', phrase: 'family time' },
  { key: 'SignAContract', label: 'Sign a Contract', slug: 'sign-a-contract', phrase: 'signing a contract' },
  { key: 'MakeDecisions', label: 'Make Decisions', slug: 'make-decisions', phrase: 'making decisions' },
  { key: 'Invest', label: 'Invest', slug: 'invest', phrase: 'investing' },
  { key: 'HomeRepair', label: 'Home Repair', slug: 'home-repair', phrase: 'home repair' },
  { key: 'GoShopping', label: 'Go Shopping', slug: 'go-shopping', phrase: 'shopping' },
  { key: 'LeaveARelationship', label: 'Leave a Relationship', slug: 'leave-a-relationship', phrase: 'leaving a relationship' },
  { key: 'MakeAMajorPurchase', label: 'Major Purchase', slug: 'major-purchase', phrase: 'a major purchase' },
  { key: 'HaveYourBaby', label: 'Have Your Baby', slug: 'have-your-baby', phrase: 'delivering a baby' },
  { key: 'CookDinnerAtHome', label: 'Cook Dinner at Home', slug: 'cook-dinner-at-home', phrase: 'cooking at home' },
  { key: 'AttendReligiousActivity', label: 'Religious Activity', slug: 'religious-activity', phrase: 'religious practice' },
  { key: 'TakeLegalAction', label: 'Take Legal Action', slug: 'take-legal-action', phrase: 'taking legal action' },
  { key: 'HaveFuneral', label: 'Hold a Funeral', slug: 'hold-a-funeral', phrase: 'holding a funeral' },
  { key: 'EnjoyAMovie', label: 'Enjoy a Movie', slug: 'enjoy-a-movie', phrase: 'a movie outing' },
  { key: 'MeetYourFriends', label: 'Meet Friends', slug: 'meet-friends', phrase: 'meeting friends' },
];

const ACTIVITY_BY_SLUG = Object.fromEntries(ACTIVITIES.map((a) => [a.slug, a]));
const ACTIVITY_BY_KEY = Object.fromEntries(ACTIVITIES.map((a) => [a.key, a]));

export function activitySlugToKey(slug) {
  return ACTIVITY_BY_SLUG[slug]?.key || null;
}

export function activityKeyToSlug(key) {
  return ACTIVITY_BY_KEY[key]?.slug || null;
}

export function getActivityBySlug(slug) {
  return ACTIVITY_BY_SLUG[slug] || null;
}

export function getActivityByKey(key) {
  return ACTIVITY_BY_KEY[key] || null;
}

const ACTIVITY_KEYWORDS = {
  GetMarried: ['wedding', 'marriage', 'tie the knot'],
  MoveHomes: ['move', 'relocate', 'new home'],
  SexualActivity: ['sex', 'romance', 'intimate'],
  ConfrontYourBoss: ['quit job', 'argue', 'tough talk'],
  AdvanceYourCareer: ['promotion', 'career', 'job', 'work'],
  GoOnADate: ['date', 'first date'],
  WorkInTheGarden: ['gardening', 'plant', 'yard'],
  EnjoyFamilyTime: ['family'],
  SignAContract: ['contract', 'agreement', 'lease'],
  Invest: ['stock', 'invest', 'crypto', 'market'],
  HomeRepair: ['repair', 'fix', 'renovate', 'remodel'],
  GoShopping: ['shop', 'buy', 'mall'],
  LeaveARelationship: ['breakup', 'divorce', 'split'],
  MakeAMajorPurchase: ['big purchase', 'house', 'car'],
  HaveYourBaby: ['baby', 'birth', 'delivery'],
  AttendReligiousActivity: ['church', 'temple', 'pray', 'worship'],
  TakeLegalAction: ['lawsuit', 'sue', 'court', 'legal'],
  HaveFuneral: ['funeral', 'burial'],
  EnjoyAMovie: ['movie', 'cinema', 'film'],
  MeetYourFriends: ['friends', 'hang out', 'social'],
  StartABusiness: ['startup', 'launch business', 'open shop'],
};

export function searchActivities(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = [];
  for (const activity of ACTIVITIES) {
    const label = activity.label.toLowerCase();
    const synonyms = (ACTIVITY_KEYWORDS[activity.key] || []).map((s) => s.toLowerCase());
    let score = 0;
    if (label === q) score = 100;
    else if (label.startsWith(q)) score = 80;
    else if (label.includes(q)) score = 60;
    else if (synonyms.some((s) => s === q)) score = 90;
    else if (synonyms.some((s) => s.startsWith(q))) score = 70;
    else if (synonyms.some((s) => s.includes(q))) score = 50;
    if (score > 0) scored.push({ ...activity, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export async function fetchLuckyDatesForActivity(activityKey, { start, end, limit = 100 } = {}) {
  if (!supabase) return [];
  let query = supabase
    .from('almanac_days')
    .select('date, weekday, score, tone, officer, holiday, activities')
    .eq(`activities->>${activityKey}`, 'Lucky')
    .order('date', { ascending: true })
    .limit(limit);
  if (start) query = query.gte('date', start);
  if (end) query = query.lte('date', end);
  const { data, error } = await query;
  if (error) {
    console.error('fetchLuckyDatesForActivity', activityKey, error);
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
