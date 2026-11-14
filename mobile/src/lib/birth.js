import AsyncStorage from '@react-native-async-storage/async-storage';

// The guest's birth details stay on the phone until they start a trial or
// sign in. Shape: { date: 'YYYY-MM-DD', time: 'HH:MM' | null, gender: 'f' | 'm' | null, name }
const KEY = 'birth-details-v1';

export async function loadBirth() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveBirth(birth) {
  await AsyncStorage.setItem(KEY, JSON.stringify(birth));
}

export async function clearBirth() {
  await AsyncStorage.removeItem(KEY);
}

// profiles row (birthday 'YYYY-MM-DD', birth_time 'HH:MM:SS', gender 'F'|'M') → local shape
export function birthFromProfile(p) {
  if (!p?.birthday) return null;
  return {
    date: p.birthday,
    time: p.birth_time ? String(p.birth_time).slice(0, 5) : null,
    gender: p.gender === 'F' ? 'f' : p.gender === 'M' ? 'm' : null,
    name: p.name || null,
  };
}

// local shape → profiles columns a member may write
export function profileFromBirth(b) {
  if (!b?.date) return {};
  return {
    birthday: b.date,
    birth_time: b.time || null,
    gender: b.gender === 'f' ? 'F' : b.gender === 'm' ? 'M' : null,
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatBirth(b) {
  if (!b?.date) return '';
  const [y, m, d] = b.date.split('-').map(Number);
  const parts = [`${d} ${MONTHS[m - 1]} ${y}`];
  if (b.time) parts.push(b.time);
  if (b.gender) parts.push(b.gender === 'f' ? 'Female' : 'Male');
  return parts.join(' · ');
}
