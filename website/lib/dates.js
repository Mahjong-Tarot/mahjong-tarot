export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function mondayOf(date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function sameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function formatSessionWhen(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const dayStr = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
  const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${dayStr} · ${timeStr}`;
}

export function relativeDay(iso) {
  const days = Math.round((startOfDay(iso) - startOfDay(new Date())) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1 && days < 7) return `In ${days} days`;
  if (days < -1 && days > -7) return `${-days} days ago`;
  if (days >= 7) return `In ${Math.round(days / 7)} week${days >= 14 ? 's' : ''}`;
  if (days <= -7) return `${Math.round(-days / 7)} week${days <= -14 ? 's' : ''} ago`;
  return null;
}

export function ageFromBirthday(birthday) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export function weekLabel(weekStart) {
  const today = mondayOf(new Date());
  const diff = Math.round((startOfDay(weekStart) - today) / 86400000);
  if (diff === 0) return 'This week';
  if (diff === 7) return 'Next week';
  if (diff === -7) return 'Last week';
  const sameYear = weekStart.getFullYear() === new Date().getFullYear();
  return `Week of ${weekStart.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })}`;
}

export function groupSessionsByWeek(sessions) {
  const groups = new Map();
  for (const s of sessions) {
    const monday = mondayOf(new Date(s.scheduled_at));
    const key = monday.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, { weekStart: monday, sessions: [] });
    groups.get(key).sessions.push(s);
  }
  return [...groups.values()];
}
