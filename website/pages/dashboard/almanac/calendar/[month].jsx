import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../../components/Nav';
import MemberNav from '../../../../components/MemberNav';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../lib/auth';
import {
  fetchAlmanacSummariesForMonth,
  todayInLA,
  shiftMonth,
  formatMonthHuman,
  LNY_2026,
  ALMANAC_RANGE_END_EXCLUSIVE,
} from '../../../../lib/almanac';
import styles from './AlmanacCalendar.module.css';

function buildCalendar(yyyymm, summaries) {
  const [y, m] = yyyymm.split('-').map(Number);
  const firstDay = new Date(Date.UTC(y, m - 1, 1));
  const lastDay = new Date(Date.UTC(y, m, 0));
  const daysInMonth = lastDay.getUTCDate();
  const firstWeekday = (firstDay.getUTCDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  const byDate = {};
  for (const s of summaries) byDate[s.date] = s;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, date: dateStr, summary: byDate[dateStr] });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function AlmanacCalendar() {
  const router = useRouter();
  const { month } = router.query;
  const { user, loading } = useAuth();
  const [summaries, setSummaries] = useState([]);
  const [today, setToday] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !month) return;
    if (!/^\d{4}-\d{2}$/.test(month)) return;
    let cancelled = false;
    (async () => {
      const s = await fetchAlmanacSummariesForMonth(month);
      if (cancelled) return;
      setSummaries(s);
      setToday(todayInLA());
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, month]);

  if (loading || !user || !month) return null;

  const human = formatMonthHuman(month);
  const cells = buildCalendar(month, summaries);
  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);
  const lnyMonth = LNY_2026.slice(0, 7);
  const endMonth = ALMANAC_RANGE_END_EXCLUSIVE.slice(0, 7);
  const canGoBack = prevMonth >= lnyMonth;
  const canGoForward = nextMonth < endMonth;

  return (
    <>
      <Head>
        <title>{human} Almanac | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <MemberNav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Almanac Calendar</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>{human}</h1>
          </div>

          <div className={styles.container}>
            <div className={styles.monthNav}>
              {canGoBack ? (
                <Link href={`/dashboard/almanac/calendar/${prevMonth}`}>‹ {formatMonthHuman(prevMonth)}</Link>
              ) : <span />}
              <Link href="/dashboard/almanac" className={styles.todayLink}>Today</Link>
              {canGoForward ? (
                <Link href={`/dashboard/almanac/calendar/${nextMonth}`}>{formatMonthHuman(nextMonth)} ›</Link>
              ) : <span />}
            </div>

            <div className={styles.weekheader}>
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>

            <div className={styles.calendar}>
              {cells.map((c, i) => {
                if (!c) return <div key={i} className={styles.empty} />;
                const tone = c.summary?.tone;
                const officer = c.summary?.officer_chinese;
                const score = c.summary?.score;
                const matchDay = Array.isArray(c.summary?.match_day) && c.summary.match_day.length > 0;
                const western = c.summary?.western_moment;
                const isToday = c.date === today;
                const beforeRange = c.date < LNY_2026 || c.date >= ALMANAC_RANGE_END_EXCLUSIVE;
                const cell = (
                  <div className={`${styles.cell} ${tone ? styles[`tone_${tone}`] : ''} ${isToday ? styles.cellToday : ''} ${beforeRange ? styles.cellOut : ''}`}>
                    <div className={styles.dayNum}>{c.day}</div>
                    {officer && <div className={styles.officer}>{officer}</div>}
                    {typeof score === 'number' && <div className={styles.score}>{score}%</div>}
                    <div className={styles.flags}>
                      {matchDay && <span className={styles.matchDot} title="Match day">●</span>}
                      {western && <span className={styles.westernDot} title={western}>◆</span>}
                    </div>
                  </div>
                );
                return c.summary ? (
                  <Link key={i} href={`/dashboard/almanac/${c.date}`}>{cell}</Link>
                ) : (
                  <div key={i}>{cell}</div>
                );
              })}
            </div>

            {loaded && summaries.length === 0 && (
              <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#888', marginTop: 'var(--space-lg)' }}>
                No almanac records for this month yet.
              </p>
            )}

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
