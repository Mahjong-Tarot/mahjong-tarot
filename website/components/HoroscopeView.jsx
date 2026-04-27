import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './HoroscopeView.module.css';

const SIGNS = [
  { id: 'rat',     label: 'Rat'     },
  { id: 'ox',      label: 'Ox'      },
  { id: 'tiger',   label: 'Tiger'   },
  { id: 'rabbit',  label: 'Rabbit'  },
  { id: 'dragon',  label: 'Dragon'  },
  { id: 'snake',   label: 'Snake'   },
  { id: 'horse',   label: 'Horse'   },
  { id: 'sheep',   label: 'Sheep'   },
  { id: 'monkey',  label: 'Monkey'  },
  { id: 'rooster', label: 'Rooster' },
  { id: 'dog',     label: 'Dog'     },
  { id: 'pig',     label: 'Pig'     },
];

const CATEGORIES = [
  { id: 'general', label: 'General' },
  { id: 'love',    label: 'Love'    },
  { id: 'money',   label: 'Money'   },
];

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shiftDate(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const LNY_2026 = '2026-02-17';

export default function HoroscopeView({ date, horoscopes, today }) {
  const [activeSign, setActiveSign] = useState(null);
  const [dayCategory, setDayCategory] = useState('general');
  const [signCategory, setSignCategory] = useState('general');

  const byKey = useMemo(() => {
    const m = {};
    for (const h of horoscopes || []) {
      m[`${h.scope}:${h.category}`] = h;
    }
    return m;
  }, [horoscopes]);

  const dayLevel = (cat) => byKey[`general:${cat}`];
  const signLevel = (sign, cat) => byKey[`${sign}:${cat}`];

  const dayActive = dayLevel(dayCategory);
  const dayPillars = dayActive?.signal_payload?.pillars;

  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);
  const isToday = date === today;
  const canGoBack = date > LNY_2026;
  const canGoForward = !isToday;

  return (
    <div className={styles.container}>
      <div className={styles.dateStrip}>
        {canGoBack ? (
          <Link href={`/horoscopes/${prevDate}`} className={styles.navArrow} aria-label="Previous day">‹</Link>
        ) : <span className={styles.navArrowDisabled} aria-hidden>‹</span>}
        <div className={styles.dateLabel}>
          <div className={styles.dateText}>{formatDate(date)}</div>
          {isToday && <div className={styles.todayBadge}>Today</div>}
        </div>
        {canGoForward ? (
          <Link href={`/horoscopes/${nextDate}`} className={styles.navArrow} aria-label="Next day">›</Link>
        ) : <span className={styles.navArrowDisabled} aria-hidden>›</span>}
      </div>

      {dayPillars && (
        <div className={styles.pillarStrip}>
          <span>Year <strong>{dayPillars.year.element} {dayPillars.year.sign}</strong></span>
          <span>Month <strong>{dayPillars.month.element} {dayPillars.month.sign}</strong></span>
          <span>Day <strong>{dayPillars.day.element} {dayPillars.day.sign}</strong></span>
        </div>
      )}

      <section className={styles.daySection}>
        <h2 className={styles.sectionLabel}>The Day</h2>
        <div className={styles.tabs} role="tablist">
          {CATEGORIES.map((c) => {
            const h = dayLevel(c.id);
            const score = h?.score;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={dayCategory === c.id}
                className={`${styles.tab} ${dayCategory === c.id ? styles.tabActive : ''}`}
                onClick={() => setDayCategory(c.id)}
              >
                <span>{c.label}</span>
                {typeof score === 'number' && <span className={styles.tabScore}>{score}%</span>}
              </button>
            );
          })}
        </div>
        <div className={styles.proseCard}>
          {dayActive ? (
            <p className={styles.prose}>{dayActive.text}</p>
          ) : (
            <p className={styles.empty}>Not yet published.</p>
          )}
        </div>
      </section>

      <section className={styles.signSection}>
        <h2 className={styles.sectionLabel}>Your Sign</h2>
        <div className={styles.signGrid}>
          {SIGNS.map((s) => {
            const h = signLevel(s.id, 'general');
            const tone = h?.tone || 'unknown';
            return (
              <button
                key={s.id}
                onClick={() => { setActiveSign(s.id); setSignCategory('general'); }}
                className={`${styles.signTile} ${activeSign === s.id ? styles.signTileActive : ''} ${styles[`tone_${tone}`] || ''}`}
                aria-label={`${s.label}, ${tone}`}
              >
                <span className={styles.signLabel}>{s.label}</span>
                {typeof h?.score === 'number' && <span className={styles.signScore}>{h.score}%</span>}
              </button>
            );
          })}
        </div>

        {activeSign && (
          <div className={styles.signDetail}>
            <div className={styles.signDetailHeader}>
              <h3>{SIGNS.find((s) => s.id === activeSign)?.label}</h3>
              <button onClick={() => setActiveSign(null)} className={styles.closeButton} aria-label="Close">×</button>
            </div>
            <div className={styles.tabs} role="tablist">
              {CATEGORIES.map((c) => {
                const h = signLevel(activeSign, c.id);
                const score = h?.score;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={signCategory === c.id}
                    className={`${styles.tab} ${signCategory === c.id ? styles.tabActive : ''}`}
                    onClick={() => setSignCategory(c.id)}
                  >
                    <span>{c.label}</span>
                    {typeof score === 'number' && <span className={styles.tabScore}>{score}%</span>}
                  </button>
                );
              })}
            </div>
            <div className={styles.proseCard}>
              {signLevel(activeSign, signCategory) ? (
                <p className={styles.prose}>{signLevel(activeSign, signCategory).text}</p>
              ) : (
                <p className={styles.empty}>Not yet published.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <div className={styles.forecastLink}>
        <Link href={`/horoscopes/forecast/${date.slice(0, 7)}`}>View Monthly Forecast →</Link>
      </div>
    </div>
  );
}
