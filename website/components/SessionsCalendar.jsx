import { useMemo, useState } from 'react';
import Link from 'next/link';
import SubscriptionIcon from './SubscriptionIcon';
import { addDays, mondayOf, sameDay, startOfDay } from '../lib/dates';
import styles from './SessionsCalendar.module.css';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function localDateKey(date) {
  const d = startOfDay(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function SessionsCalendar({ sessions, initialMonth }) {
  const [cursor, setCursor] = useState(() => {
    const base = initialMonth ? new Date(initialMonth) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = useMemo(() => startOfDay(new Date()), []);

  const sessionsByDay = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      const key = localDateKey(new Date(s.scheduled_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    }
    return map;
  }, [sessions]);

  const grid = useMemo(() => {
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const gridStart = mondayOf(monthStart);
    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  function shiftMonth(delta) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  function goToday() {
    const now = new Date();
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  return (
    <div className={styles.calendar}>
      <header className={styles.header}>
        <div className={styles.headerNav}>
          <button type="button" onClick={() => shiftMonth(-1)} className={styles.navBtn} aria-label="Previous month">
            ←
          </button>
          <h2 className={styles.monthLabel}>{monthLabel(cursor)}</h2>
          <button type="button" onClick={() => shiftMonth(1)} className={styles.navBtn} aria-label="Next month">
            →
          </button>
        </div>
        <button type="button" onClick={goToday} className={styles.todayBtn}>Today</button>
      </header>

      <div className={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className={styles.weekdayCell}>{label}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {grid.map((day) => {
          const inMonth = day.getMonth() === cursor.getMonth();
          const isToday = sameDay(day, today);
          const key = localDateKey(day);
          const daySessions = sessionsByDay.get(key) || [];
          const cellClasses = [
            styles.cell,
            !inMonth && styles.cellOutMonth,
            isToday && styles.cellToday,
          ].filter(Boolean).join(' ');

          return (
            <div key={key} className={cellClasses}>
              <div className={styles.cellHead}>
                <span className={styles.dayNum}>{day.getDate()}</span>
                {daySessions.length > 0 && (
                  <span className={styles.dayCount}>{daySessions.length}</span>
                )}
              </div>
              <ul className={styles.pillList}>
                {daySessions.map((s) => {
                  const c = s.client || {};
                  const time = new Date(s.scheduled_at).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/admin/private-readings/${c.id || s.client_id}`}
                        className={styles.pill}
                        title={`${time} — ${c.full_name || 'Client'}`}
                      >
                        <SubscriptionIcon status={c.subscription_status} />
                        <span className={styles.pillTime}>{time}</span>
                        <span className={styles.pillName}>{c.full_name || 'Client'}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
