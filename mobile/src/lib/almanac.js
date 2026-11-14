import { supabase } from './supabase';

// Same table and range the website's /almanac/[date] page reads
// (website/lib/almanac.js). Anon read is allowed by migration 014.
export const FIRST_DATE = '2026-02-17';
export const LAST_DATE = '2032-02-09';

export function todayInLA() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
}

export function shiftDate(date, days) {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function inRange(date) {
  return date >= FIRST_DATE && date <= LAST_DATE;
}

export async function fetchAlmanacDay(date) {
  const { data, error } = await supabase.from('almanac_days').select('*').eq('date', date).maybeSingle();
  if (error) throw new Error('Could not load the almanac. Check your connection.');
  return data;
}

// Copied from website/lib/almanac.js ACTIVITIES (labels only).
export const ACTIVITY_LABEL = {
  StartABusiness: 'Start a Business',
  GetMarried: 'Get Married',
  MoveHomes: 'Move Homes',
  SexualActivity: 'Intimacy',
  EatOut: 'Eat Out',
  ConfrontYourBoss: 'Confront Your Boss',
  AdvanceYourCareer: 'Advance Your Career',
  Travel: 'Travel',
  GoOnADate: 'Go On a Date',
  CleanTheHouse: 'Clean the House',
  WorkInTheGarden: 'Garden',
  DoYourHair: 'Do Your Hair',
  DoYourNails: 'Do Your Nails',
  CheckYourHealth: 'Check Your Health',
  EnjoyFamilyTime: 'Family Time',
  SignAContract: 'Sign a Contract',
  MakeDecisions: 'Make Decisions',
  Invest: 'Invest',
  HomeRepair: 'Home Repair',
  GoShopping: 'Go Shopping',
  LeaveARelationship: 'Leave a Relationship',
  MakeAMajorPurchase: 'Major Purchase',
  HaveYourBaby: 'Have Your Baby',
  CookDinnerAtHome: 'Cook Dinner at Home',
  AttendReligiousActivity: 'Religious Activity',
  TakeLegalAction: 'Take Legal Action',
  HaveFuneral: 'Hold a Funeral',
  EnjoyAMovie: 'Enjoy a Movie',
  MeetYourFriends: 'Meet Friends',
};

export function groupActivities(activities = {}) {
  const groups = { Lucky: [], Unlucky: [], Normal: [] };
  for (const [key, verdict] of Object.entries(activities)) {
    if (groups[verdict]) groups[verdict].push(ACTIVITY_LABEL[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2'));
  }
  return groups;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatDay(date) {
  const [y, m, d] = date.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]} ${d} ${MONTHS[m - 1]}`;
}
