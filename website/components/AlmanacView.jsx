import Link from 'next/link';
import { shiftDate, formatHumanDate, isValidAlmanacDate } from '../lib/almanac';
import styles from './AlmanacView.module.css';

const NORMAL_PREVIEW = 6;

const TONE_LABEL = {
  auspicious: 'Auspicious day',
  favorable: 'Favorable day',
  neutral: 'Neutral day',
  cautionary: 'Cautionary day',
  challenging: 'Challenging day',
};

function groupActivities(activities, order, labels) {
  const groups = { Lucky: [], Normal: [], Unlucky: [] };
  for (const key of order) {
    const verdict = activities[key];
    if (!verdict || !groups[verdict]) continue;
    groups[verdict].push({ key, label: labels[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2') });
  }
  return groups;
}

function article(word) {
  return /^[aeiou]/i.test(word || '') ? 'an' : 'a';
}

function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`;
}

function shortDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

// "23-01" → "11 pm to 1 am". Anything unexpected is shown as stored.
function clock(h) {
  const hour = ((h % 24) + 24) % 24;
  const suffix = hour < 12 ? 'am' : 'pm';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return { twelve, suffix };
}
function formatHourRange(range) {
  const [a, b] = String(range).split('-').map((x) => parseInt(x, 10));
  if (Number.isNaN(a) || Number.isNaN(b)) return range;
  const s = clock(a);
  const e = clock(b);
  return s.suffix === e.suffix
    ? `${s.twelve} to ${e.twelve} ${e.suffix}`
    : `${s.twelve} ${s.suffix} to ${e.twelve} ${e.suffix}`;
}

export default function AlmanacView({ date, almanac, today, basePath = '/member/dashboard/almanac', searchHref = '/member/dashboard/almanac/search', monthlyHref, asPageTitle = false }) {
  const Heading = asPageTitle ? 'h1' : 'h2';

  if (!almanac) {
    return (
      <div className={styles.container}>
        <div className={styles.eyebrow}>The Tong Shu almanac · {formatHumanDate(date)}</div>
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
  const LABELS = almanac.labels || {};
  const groups = groupActivities(activities, ACTIVITY_ORDER, LABELS);

  const luckyCount = groups.Lucky.length;
  const unluckyCount = groups.Unlucky.length;
  const normalCount = groups.Normal.length;
  const totalCount = luckyCount + unluckyCount + normalCount;
  const normalShown = groups.Normal.slice(0, NORMAL_PREVIEW);
  const normalMore = groups.Normal.slice(NORMAL_PREVIEW);
  const hours = Array.isArray(auspicious_hours) ? auspicious_hours : [];

  return (
    <div className={`${styles.container} ${styles[`tone_${tone}`] || ''}`}>
      {/* ── Date navigation ── */}
      <nav className={styles.dayNav} aria-label="Almanac day">
        {canGoBack ? (
          <Link href={`${basePath}/${prevDate}`} className={styles.dayNavLink}>‹ Previous day</Link>
        ) : <span className={styles.dayNavDisabled} aria-hidden>‹ Previous day</span>}
        {searchHref && (
          <Link href={searchHref} className={styles.searchCta}>Find a good day to… →</Link>
        )}
        {canGoForward ? (
          <Link href={`${basePath}/${nextDate}`} className={styles.dayNavLink}>Next day ›</Link>
        ) : <span className={styles.dayNavDisabled} aria-hidden>Next day ›</span>}
      </nav>

      {/* ── Headline + score card ── */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>
            The Tong Shu almanac · {formatHumanDate(date)}
            {isToday && <span className={styles.todayBadge}>Today</span>}
          </div>
          <Heading className={styles.headline}>
            {isToday ? 'Today' : shortDate(date)} is {article(officer.english)} <em>{officer.english}</em> day.
          </Heading>
          <p className={styles.gloss}>{officer.gloss}</p>
          <p className={styles.officerLine}>
            Day Officer <span className={styles.chinese}>{officer.chinese}</span>{' '}
            <span className={styles.pinyin}>{officer.pinyin}</span>
          </p>
          {holiday && <p className={styles.holiday}>{holiday}</p>}
        </div>

        <div className={styles.scoreCard}>
          <div className={styles.factLabel}>{isToday ? 'Today’s score' : 'Day score'}</div>
          <div className={styles.scoreRow}>
            <span className={styles.scoreNumber}>{score}</span>
            <span className={styles.scoreOutOf}>out of 100</span>
          </div>
          <progress className={styles.scoreBar} value={score} max={100} aria-label={`Score ${score} out of 100`} />
          <div className={styles.toneLabel}>{TONE_LABEL[tone] || tone}</div>
        </div>
      </div>

      {/* ── Facts row ── */}
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Day</dt>
          <dd className={styles.factValue}>{pillars.day.element} {pillars.day.sign}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Month</dt>
          <dd className={styles.factValue}>{pillars.month.element} {pillars.month.sign}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Year</dt>
          <dd className={styles.factValue}>{pillars.year.element} {pillars.year.sign}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Lunar date</dt>
          <dd className={styles.factValue}>{ordinal(Number(almanac.lunar_month))} month, day {almanac.lunar_day}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Conflicts with</dt>
          <dd className={styles.factValue}>{year_conflict}</dd>
        </div>
      </dl>

      <details className={styles.whyScore}>
        <summary className={styles.whySummary}>Why this score?</summary>
        <div className={styles.whyBody}>
          <p>
            The score weighs each of the {totalCount} traditional activities by the
            day&apos;s verdict: Lucky counts as 1, Normal as 0.5, Unlucky as 0. This day
            scored <strong>{score} out of 100</strong> with <strong>{luckyCount} Lucky</strong>,{' '}
            <strong>{normalCount} Normal</strong>, and <strong>{unluckyCount} Unlucky</strong>.
          </p>
          <p>
            The verdicts come from the 12 Day Officer cycle (this is{' '}
            <strong>{officer.english}</strong>, <span className={styles.chinese}>{officer.chinese}</span>{' '}
            {officer.pinyin}) crossed against the year, month, and day pillars
            ({pillars.year.element} {pillars.year.sign} · {pillars.month.element} {pillars.month.sign} · {pillars.day.element} {pillars.day.sign}).
            Same date, same inputs, same answer: the calculation is deterministic, not divined.
          </p>
        </div>
      </details>

      {/* ── Activities ── */}
      <section className={styles.section}>
        <div className={styles.sectionLabel}>What the day favors</div>
        <div className={styles.boxes}>
          {luckyCount > 0 && (
            <div className={`${styles.box} ${styles.boxLucky}`}>
              <h3 className={`${styles.boxLabel} ${styles.labelLucky}`}>Lucky · good for these</h3>
              <ul className={styles.strongList}>
                {groups.Lucky.map((a) => <li key={a.key}>{a.label}</li>)}
              </ul>
            </div>
          )}
          {unluckyCount > 0 && (
            <div className={`${styles.box} ${styles.boxUnlucky}`}>
              <h3 className={`${styles.boxLabel} ${styles.labelUnlucky}`}>Unlucky · put these off</h3>
              <ul className={styles.strongList}>
                {groups.Unlucky.map((a) => <li key={a.key}>{a.label}</li>)}
              </ul>
            </div>
          )}
          {normalCount > 0 && (
            <div className={`${styles.box} ${styles.boxNormal}`}>
              <h3 className={styles.boxLabel}>
                Normal · {normalCount} {luckyCount + unluckyCount > 0 ? 'other ' : ''}activit{normalCount === 1 ? 'y' : 'ies'}
              </h3>
              <ul className={styles.normalList}>
                {normalShown.map((a) => <li key={a.key}>{a.label}</li>)}
              </ul>
              {normalMore.length > 0 && (
                <details className={styles.more}>
                  <summary className={styles.moreSummary}>See all {normalCount} normal activities</summary>
                  <ul className={styles.normalList}>
                    {normalMore.map((a) => <li key={a.key}>{a.label}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {hours.length > 0 && (
          <>
            <h3 className={styles.hoursTitle}>Auspicious hours</h3>
            <div className={styles.hoursGrid}>
              {hours.map((h) => (
                <div key={h.range} className={styles.hourCell}>
                  <div className={styles.hourRange}>{formatHourRange(h.range)}</div>
                  <div className={styles.hourBranch}>
                    <span className={styles.chinese}>{h.chinese}</span> {h.branch} hour
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {monthlyHref && (
        <div className={styles.calendarLink}>
          <Link href={monthlyHref}>View the monthly calendar →</Link>
        </div>
      )}
    </div>
  );
}
