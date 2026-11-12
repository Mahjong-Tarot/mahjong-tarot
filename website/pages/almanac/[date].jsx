import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AlmanacView from '../../components/AlmanacView';
import {
  fetchAlmanacForDate,
  fetchAlmanacSummariesForMonth,
  isValidAlmanacDate,
  todayInLA,
  formatHumanDate,
  shiftDate,
  getActivityByKey,
  ALMANAC_RANGE_START,
} from '../../lib/almanac';
import { ORGANIZATION, WEBSITE, graph, breadcrumb } from '../../lib/schema';
import styles from '../../styles/Almanac.module.css';

const TONE_WORD = {
  auspicious: 'Auspicious',
  favorable: 'Favorable',
  neutral: 'Neutral',
  cautionary: 'Cautionary',
  challenging: 'Challenging',
};

// Quick links into the good-day search, in the mockup's order.
const QUICK_ACTIVITIES = ['GetMarried', 'MoveHomes', 'StartABusiness', 'Travel', 'GoOnADate']
  .map(getActivityByKey)
  .filter(Boolean);

function weekLabel(iso) {
  const d = new Date(iso + 'T12:00:00');
  return `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`;
}

export default function PublicAlmanacDate({ date, almanac, today, week }) {
  const human = formatHumanDate(date);
  const jsonLd = graph([
    ORGANIZATION,
    WEBSITE,
    breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Almanac', url: '/almanac' },
      { name: human, url: `/almanac/${date}` },
    ]),
  ]);

  const description = almanac
    ? `Tong Shu almanac for ${human}: ${almanac.officer.english} day, ${almanac.score}% (${almanac.tone}). ${almanac.officer.gloss}`
    : `Tong Shu almanac for ${human}. Day Officer, score, lucky and unlucky activities, drawn from Bill Hajdu's BaZi practice.`;

  return (
    <>
      <SEO
        title={`Almanac for ${human} | Mahjong Tarot`}
        description={description}
        path={`/almanac/${date}`}
        jsonLd={jsonLd}
      />
      <Nav />
      <main>
        {/* ── The day ── */}
        <section className={styles.day}>
          <AlmanacView
            date={date}
            almanac={almanac}
            today={today}
            basePath="/almanac"
            searchHref={null}
            asPageTitle
          />
        </section>

        {/* ── This week ── */}
        {week.length > 0 && (
          <section className={`${styles.band} ${styles.tint}`}>
            <div className="container">
              <div className={styles.bandLabel}>
                <span>This week</span>
                <Link href={`/member/dashboard/almanac/calendar/${date.slice(0, 7)}`} className={styles.bandLink}>
                  Open the calendar →
                </Link>
              </div>
              <div className={styles.week}>
                {week.map((d) => {
                  const current = d.date === date;
                  return (
                    <Link
                      key={d.date}
                      href={`/almanac/${d.date}`}
                      className={`${styles.weekDay} ${current ? styles.weekDayCurrent : ''}`}
                      aria-current={current ? 'date' : undefined}
                    >
                      <span className={`${styles.weekDate} ${current ? styles.weekDateCurrent : ''}`}>
                        {weekLabel(d.date)}{d.date === today ? ' · today' : ''}
                      </span>
                      <span className={styles.weekScore}>{d.score}</span>
                      <span className={styles.weekOfficer}>{d.officer_english}</span>
                      <span className={`${styles.weekTone} ${styles[`tone_${d.tone}`] || ''}`}>
                        {TONE_WORD[d.tone] || d.tone}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Find a good day ── */}
        <section className={styles.band}>
          <div className="container">
            <div className={styles.bandLabel}><span>Find a good day</span></div>
            <div className={styles.find}>
              <h2 className={styles.findTitle}>Planning something? Pick the day for it.</h2>
              <div className={styles.findLinks}>
                {QUICK_ACTIVITIES.map((a) => (
                  <Link key={a.key} href={`/find-a-good-day?activity=${a.slug}`} className={styles.btnOutline}>
                    {a.label}
                  </Link>
                ))}
                <Link href="/find-a-good-day" className={styles.btnPrimary}>All activities →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Membership ── */}
        <section className={styles.member}>
          <div className={`container ${styles.memberInner}`}>
            <div className={styles.memberText}>
              <h2 className={styles.memberTitle}>The day is the same for everyone. Your chart is not.</h2>
              <p className={styles.memberBody}>
                Members get the full calendar and unlimited readings built from
                their own birth details.
              </p>
            </div>
            <Link href="/membership" className={styles.btnPrimary}>See membership</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  // Pre-build the most recent ~30 days; older dates fall back to ISR.
  const today = todayInLA();
  const start = new Date(ALMANAC_RANGE_START + 'T12:00:00');
  const end = new Date(today + 'T12:00:00');
  const paths = [];
  const cursor = new Date(end);
  for (let i = 0; i < 30 && cursor >= start; i += 1) {
    paths.push({ params: { date: cursor.toISOString().slice(0, 10) } });
    cursor.setDate(cursor.getDate() - 1);
  }
  return { paths, fallback: 'blocking' };
}

// Monday-to-Sunday week around `date`, from the day-summary view. Best
// effort: an error just hides the strip.
async function loadWeek(date) {
  const weekday = (new Date(date + 'T12:00:00').getDay() + 6) % 7; // Mon = 0
  const monday = shiftDate(date, -weekday);
  const sunday = shiftDate(monday, 6);
  const months = [...new Set([monday.slice(0, 7), sunday.slice(0, 7)])];
  const rows = (await Promise.all(months.map(fetchAlmanacSummariesForMonth))).flat();
  return rows
    .filter((r) => r.date >= monday && r.date <= sunday)
    .map((r) => ({
      date: r.date,
      score: r.score,
      tone: r.tone,
      officer_english: r.officer_english,
    }));
}

export async function getStaticProps({ params }) {
  const date = params.date;
  if (!isValidAlmanacDate(date)) {
    return { notFound: true };
  }
  const today = todayInLA();
  const [{ data: almanac }, week] = await Promise.all([
    fetchAlmanacForDate(date),
    loadWeek(date).catch(() => []),
  ]);
  if (!almanac) {
    return { notFound: true, revalidate: 300 };
  }
  return {
    props: { date, almanac, today, week },
    revalidate: date === today ? 300 : 3600,
  };
}
