import Link from 'next/link';
import { shiftDate, formatHumanDate, isValidAlmanacDate, LNY_2026 } from '../lib/almanac';
import styles from './AlmanacView.module.css';

const VERDICT_ORDER = { Lucky: 0, Normal: 1, Unlucky: 2 };

function groupActivities(activities, order, labels) {
  const groups = { Lucky: [], Normal: [], Unlucky: [] };
  for (const key of order) {
    const verdict = activities[key];
    if (!verdict) continue;
    groups[verdict].push({ key, label: labels[key] || key });
  }
  return groups;
}

export default function AlmanacView({ date, almanac, today }) {
  if (!almanac) {
    return (
      <div className={styles.container}>
        <div className={styles.dateStrip}>
          <span className={styles.navArrowDisabled} aria-hidden>‹</span>
          <div className={styles.dateLabel}>
            <div className={styles.dateText}>{formatHumanDate(date)}</div>
          </div>
          <span className={styles.navArrowDisabled} aria-hidden>›</span>
        </div>
        <p className={styles.empty}>No almanac record for this date.</p>
      </div>
    );
  }

  const prevDate = shiftDate(date, -1);
  const nextDate = shiftDate(date, 1);
  const isToday = date === today;
  const canGoBack = isValidAlmanacDate(prevDate);
  const canGoForward = isValidAlmanacDate(nextDate);

  const { pillars, officer, year_conflict, auspicious_hours, activities, score, tone, holiday } = almanac;
  const ACTIVITY_ORDER = almanac.activity_order || Object.keys(activities);
  const LABELS = almanac.labels || Object.fromEntries(ACTIVITY_ORDER.map((k) => [k, k]));
  const groups = groupActivities(activities, ACTIVITY_ORDER, LABELS);

  return (
    <div className={styles.container}>
      <Link href="/dashboard/almanac/search" className={styles.searchCta}>
        <span className={styles.searchCtaIcon} aria-hidden>🔍</span>
        <span className={styles.searchCtaLabel}>Find a Good Day To…</span>
        <span className={styles.searchCtaArrow} aria-hidden>›</span>
      </Link>

      <div className={styles.dateStrip}>
        {canGoBack ? (
          <Link href={`/dashboard/almanac/${prevDate}`} className={styles.navArrow} aria-label="Previous day">‹</Link>
        ) : <span className={styles.navArrowDisabled} aria-hidden>‹</span>}
        <div className={styles.dateLabel}>
          <div className={styles.dateText}>{formatHumanDate(date)}</div>
          {isToday && <div className={styles.todayBadge}>Today</div>}
          {holiday && <div className={styles.holiday}>{holiday}</div>}
        </div>
        {canGoForward ? (
          <Link href={`/dashboard/almanac/${nextDate}`} className={styles.navArrow} aria-label="Next day">›</Link>
        ) : <span className={styles.navArrowDisabled} aria-hidden>›</span>}
      </div>

      <div className={styles.pillarStrip}>
        <span>Year <strong>{pillars.year.element} {pillars.year.sign}</strong></span>
        <span>Month <strong>{pillars.month.element} {pillars.month.sign}</strong></span>
        <span>Day <strong>{pillars.day.element} {pillars.day.sign}</strong></span>
      </div>

      <section className={`${styles.officerCard} ${styles[`tone_${tone}`]}`}>
        <div className={styles.officerHead}>
          <div>
            <div className={styles.officerLabel}>Day Officer</div>
            <div className={styles.officerName}>
              <span className={styles.officerEnglish}>{officer.english}</span>
              <span className={styles.officerChinese}>{officer.chinese}</span>
              <span className={styles.officerPinyin}>{officer.pinyin}</span>
            </div>
          </div>
          <div className={styles.scoreBlock}>
            <div className={styles.scoreNumber}>{score}<span>%</span></div>
            <div className={styles.toneLabel}>{tone}</div>
          </div>
        </div>
        <p className={styles.officerGloss}>{officer.gloss}</p>
        <div className={styles.officerMeta}>
          <span><strong>Conflicts with:</strong> {year_conflict}</span>
          <span><strong>Lunar:</strong> month {almanac.lunar_month}, day {almanac.lunar_day}</span>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Auspicious Hours</h2>
        <div className={styles.hoursGrid}>
          {auspicious_hours.map((h) => (
            <div key={h.range} className={styles.hourCell}>
              <div className={styles.hourRange}>{h.range}</div>
              <div className={styles.hourBranch}>
                <span>{h.chinese}</span> {h.branch}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionLabel}>Activities</h2>

        {groups.Lucky.length > 0 && (
          <div className={styles.activityGroup}>
            <div className={`${styles.activityHeader} ${styles.headerLucky}`}>
              Lucky <span className={styles.count}>{groups.Lucky.length}</span>
            </div>
            <ul className={styles.activityList}>
              {groups.Lucky.map((a) => (
                <li key={a.key} className={`${styles.activityItem} ${styles.lucky}`}>{a.label}</li>
              ))}
            </ul>
          </div>
        )}

        {groups.Unlucky.length > 0 && (
          <div className={styles.activityGroup}>
            <div className={`${styles.activityHeader} ${styles.headerUnlucky}`}>
              Avoid <span className={styles.count}>{groups.Unlucky.length}</span>
            </div>
            <ul className={styles.activityList}>
              {groups.Unlucky.map((a) => (
                <li key={a.key} className={`${styles.activityItem} ${styles.unlucky}`}>{a.label}</li>
              ))}
            </ul>
          </div>
        )}

        {groups.Normal.length > 0 && (
          <div className={styles.activityGroup}>
            <div className={`${styles.activityHeader} ${styles.headerNormal}`}>
              Normal <span className={styles.count}>{groups.Normal.length}</span>
            </div>
            <ul className={styles.activityList}>
              {groups.Normal.map((a) => (
                <li key={a.key} className={`${styles.activityItem} ${styles.normal}`}>{a.label}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className={styles.calendarLink}>
        <Link href={`/dashboard/almanac/calendar/${date.slice(0, 7)}`}>View Monthly Calendar →</Link>
      </div>
    </div>
  );
}
