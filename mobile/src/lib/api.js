import { Platform } from 'react-native';
import { SITE_URL } from './config';
import { supabase } from './supabase';

// Web preview goes through the dev server's /api proxy (metro.config.js).
const BASE = Platform.OS === 'web' && __DEV__ ? '' : SITE_URL;

async function call(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw Object.assign(new Error('No connection. Check your internet and try again.'), { status: 0 });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(json.error || 'Something went wrong. Please try again.'), { status: res.status, body: json });
  }
  return json;
}

// The website's free chart (/chart page): { sign, dayMaster, fourPillars, purpleStar, purpleStarNeeds, threeBlessings, fireHorse }
export function fetchChart({ date, time, gender }) {
  return call('/api/chart', { method: 'POST', body: { date, time: time || undefined, gender: time ? gender : undefined } });
}

export function fetchCompatibility(person1, person2) {
  return call('/api/compatibility', { method: 'POST', body: { person1, person2 } });
}

export function fetchPurpleStar() {
  return call('/api/member/purple-star', { auth: true });
}

export function deleteAccount() {
  return call('/api/account/delete', { method: 'POST', auth: true });
}

export function fetchMobileConfig() {
  return call('/api/mobile/config');
}
