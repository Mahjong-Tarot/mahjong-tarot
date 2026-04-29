import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAlmanacForDate, todayInLA, formatHumanDate } from '../lib/almanac';
import styles from './AlmanacToday.module.css';

const TOP_LIMIT = 4;

export default function AlmanacToday({ almanac: almanacProp, href = '/dashboard/almanac' }) {
  // Prop semantics:
  //   undefined → fetch on client (standalone usage)
  //   null      → server tried and got nothing — fall back to client fetch
  //               (the client may be authed and able to read where anon couldn't)
  //   object    → use as-is
  const propProvided = almanacProp !== undefined && almanacProp !== null;
  const [almanac, setAlmanac] = useState(almanacProp || null);
  const [loaded, setLoaded] = useState(propProvided);

  useEffect(() => {
    if (propProvided) return undefined;
    let cancelled = false;
    (async () => {
      const today = todayInLA();
      const a = await fetchAlmanacForDate(today);
      if (cancelled) return;
      setAlmanac(a);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [propProvided]);

  if (!loaded) {
    return <div className={styles.skeleton} aria-hidden />;
  }
  if (!almanac) {
    return null;
  }

  const { date, pillars, officer, score, tone, activities, holiday, auspicious_hours } = almanac;
  const ACTIVITY_ORDER = almanac.activity_order || Object.keys(activities);
  const LABELS = almanac.labels || {};

  const lucky = ACTIVITY_ORDER
    .filter((k) => activities[k] === 'Lucky')
    .slice(0, TOP_LIMIT)
    .map((k) => LABELS[k] || k);
  const unlucky = ACTIVITY_ORDER
    .filter((k) => activities[k] === 'Unlucky')
    .slice(0, TOP_LIMIT)
    .map((k) => LABELS[k] || k);

  const nextHour = pickNextAuspiciousHour(auspicious_hours);

  return (
    <Link href={href} className={`${styles.card} ${styles[`tone_${tone}`]}`}>
      <div className={styles.head}>
        <div>
          <div className={styles.dateLine}>{formatHumanDate(date)}</div>
          <div className={styles.pillarLine}>
            {pillars.day.element} {pillars.day.sign} day · {officer.english} <span className={styles.chinese}>{officer.chinese}</span>
          </div>
          {holiday && <div className={styles.holiday}>{holiday}</div>}
        </div>
        <div className={styles.scoreBlock}>
          <div className={styles.scoreNumber}>{score}<span>%</span></div>
          <div className={styles.toneLabel}>{tone}</div>
        </div>
      </div>

      <p className={styles.gloss}>{officer.gloss}</p>

      <div className={styles.stripsWrap}>
        {lucky.length > 0 && (
          <div className={styles.strip}>
            <span className={styles.stripLabel}>Lucky</span>
            <div className={styles.chips}>
              {lucky.map((l) => <span key={l} className={`${styles.chip} ${styles.chipLucky}`}>{l}</span>)}
            </div>
          </div>
        )}
        {unlucky.length > 0 && (
          <div className={styles.strip}>
            <span className={styles.stripLabel}>Avoid</span>
            <div className={styles.chips}>
              {unlucky.map((l) => <span key={l} className={`${styles.chip} ${styles.chipUnlucky}`}>{l}</span>)}
            </div>
          </div>
        )}
      </div>

      <div className={styles.foot}>
        {nextHour && (
          <span><strong>Next auspicious hour:</strong> {nextHour.range} ({nextHour.branch})</span>
        )}
        <span className={styles.cta}>View today&apos;s almanac →</span>
      </div>
    </Link>
  );
}

function pickNextAuspiciousHour(hours) {
  if (!Array.isArray(hours) || hours.length === 0) return null;
  const now = new Date();
  const localHour = now.getHours() + now.getMinutes() / 60;
  let bestFuture = null;
  let firstOfDay = null;
  for (const h of hours) {
    const [start] = h.range.split('-').map(Number);
    if (firstOfDay === null) firstOfDay = h;
    if (start >= localHour && (bestFuture === null || start < parseInt(bestFuture.range.split('-')[0], 10))) {
      bestFuture = h;
    }
  }
  return bestFuture || firstOfDay;
}
