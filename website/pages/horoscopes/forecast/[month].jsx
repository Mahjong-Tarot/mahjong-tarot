import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import { fetchDaySummariesForMonth, todayInLA, LNY_2026 } from '../../../lib/horoscopes';
import styles from './Forecast.module.css';

function shiftMonth(yyyymm, delta) {
  const [y, m] = yyyymm.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthHuman(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function buildCalendar(yyyymm, summaries) {
  const [y, m] = yyyymm.split('-').map(Number);
  const firstDay = new Date(Date.UTC(y, m - 1, 1));
  const lastDay = new Date(Date.UTC(y, m, 0));
  const daysInMonth = lastDay.getUTCDate();
  // Monday-start: 0=Mon ... 6=Sun
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  const summaryByDate = {};
  for (const s of summaries) summaryByDate[s.date] = s;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, date: dateStr, summary: summaryByDate[dateStr] });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MonthlyForecast({ month, summaries, today }) {
  const human = monthHuman(month);
  const cells = buildCalendar(month, summaries);
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const todayMonth = today.slice(0, 7);
  const canGoBack = prevMonth >= LNY_2026.slice(0, 7);
  const canGoForward = month < todayMonth;

  return (
    <>
      <SEO
        title={`${human} Forecast | Mahjong Tarot`}
        description={`Monthly horoscope forecast for ${human}. Day-by-day energy, match days, and what's coming up in the Year of the Fire Horse.`}
        path={`/horoscopes/forecast/${month}`}
      />
      <Nav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Monthly Forecast</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>{human}</h1>
          </div>

          <div className={styles.container}>
            <div className={styles.monthNav}>
              {canGoBack ? (
                <Link href={`/horoscopes/forecast/${prevMonth}`}>‹ {monthHuman(prevMonth)}</Link>
              ) : <span />}
              <Link href="/horoscopes" className={styles.todayLink}>Today</Link>
              {canGoForward ? (
                <Link href={`/horoscopes/forecast/${nextMonth}`}>{monthHuman(nextMonth)} ›</Link>
              ) : <span />}
            </div>

            <div className={styles.weekheader}>
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>

            <div className={styles.calendar}>
              {cells.map((c, i) => {
                if (!c) return <div key={i} className={styles.empty} />;
                const tone = c.summary?.general_tone;
                const score = c.summary?.general_score;
                const matchDay = c.summary?.match_day && c.summary.match_day.length > 0;
                const western = c.summary?.western_moment;
                const isToday = c.date === today;
                const inFuture = c.date > today;
                const cell = (
                  <div className={`${styles.cell} ${tone ? styles[`tone_${tone}`] : ''} ${isToday ? styles.cellToday : ''} ${inFuture ? styles.cellFuture : ''}`}>
                    <div className={styles.dayNum}>{c.day}</div>
                    {typeof score === 'number' && <div className={styles.score}>{score}%</div>}
                    <div className={styles.flags}>
                      {matchDay && <span className={styles.matchDot} title="Match day">●</span>}
                      {western && <span className={styles.westernDot} title={western}>◆</span>}
                    </div>
                  </div>
                );
                return inFuture ? (
                  <div key={i}>{cell}</div>
                ) : (
                  <Link key={i} href={`/horoscopes/${c.date}`}>{cell}</Link>
                );
              })}
            </div>

            <div className={styles.legend}>
              <span><span className={`${styles.swatch} ${styles.tone_auspicious}`} /> Auspicious</span>
              <span><span className={`${styles.swatch} ${styles.tone_favorable}`} /> Favorable</span>
              <span><span className={`${styles.swatch} ${styles.tone_neutral}`} /> Neutral</span>
              <span><span className={`${styles.swatch} ${styles.tone_cautionary}`} /> Cautionary</span>
              <span><span className={`${styles.swatch} ${styles.tone_challenging}`} /> Challenging</span>
              <span>● Match day</span>
              <span>◆ Calendar moment</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  // Pre-build current month + previous month, fall back to ISR for older.
  const today = todayInLA();
  const tm = today.slice(0, 7);
  return {
    paths: [
      { params: { month: tm } },
      { params: { month: shiftMonth(tm, -1) } },
    ],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const month = params.month;
  if (!/^\d{4}-\d{2}$/.test(month)) return { notFound: true };
  if (month < LNY_2026.slice(0, 7)) return { notFound: true };
  const today = todayInLA();
  if (month > today.slice(0, 7)) return { notFound: true };
  const summaries = await fetchDaySummariesForMonth(month);
  return {
    props: { month, summaries, today },
    revalidate: 3600,
  };
}
