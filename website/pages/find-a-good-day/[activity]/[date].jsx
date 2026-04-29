import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import AlmanacView from '../../../components/AlmanacView';
import {
  fetchAlmanacForDate,
  isValidAlmanacDate,
  todayInLA,
  formatHumanDate,
  getActivityBySlug,
} from '../../../lib/almanac';
import { explainScore } from '../../../lib/explainScore';

const VERDICT_PHRASE = {
  Lucky: 'a favourable day',
  Normal: 'a neutral day',
  Unlucky: 'a day to avoid',
};

export default function FindAGoodDayResult({ activity, date, almanac, today }) {
  const humanDate = formatHumanDate(date);
  const verdict = almanac?.activities?.[activity.key] || null;
  const verdictPhrase = verdict ? VERDICT_PHRASE[verdict] : null;
  const explanation = almanac ? explainScore({ almanac, activity }) : null;
  const title = `${humanDate} for ${activity.label} | Mahjong Tarot Almanac`;
  const description = verdictPhrase
    ? `${humanDate} is ${verdictPhrase} for ${activity.label.toLowerCase()} in the Chinese almanac. Score ${almanac?.score}%, day-officer ${almanac?.officer?.english}.`
    : `Almanac reading for ${humanDate} with focus on ${activity.label.toLowerCase()}.`;

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={`/find-a-good-day/${activity.slug}/${date}`}
      />
      <Nav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Almanac · {activity.label}</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>{humanDate}</h1>
            {verdictPhrase && (
              <p style={{
                marginTop: 'var(--space-sm)',
                fontSize: '1rem',
                color: 'var(--color-text-muted, #555)',
              }}>
                The almanac reads this as <strong>{verdictPhrase}</strong> for{' '}
                <strong>{activity.label.toLowerCase()}</strong>.
              </p>
            )}
          </div>
          {explanation && (
            <div style={{
              maxWidth: 720,
              margin: '0 auto var(--space-xl)',
              padding: 'var(--space-lg) var(--space-xl)',
              background: 'var(--color-surface, #f8f6f0)',
              borderRadius: 14,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--color-text)',
            }}>
              <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted, #888)',
                fontWeight: 600,
                marginBottom: 'var(--space-sm)',
              }}>
                Why this date scores the way it does
              </div>
              <p style={{ margin: 0 }}>{explanation}</p>
            </div>
          )}
          {almanac ? (
            <AlmanacView
              date={date}
              almanac={almanac}
              today={today}
              basePath={`/find-a-good-day/${activity.slug}`}
              searchHref={null}
            />
          ) : (
            <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
              No almanac record for {humanDate}.
            </p>
          )}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.9rem' }}>
            <Link href="/find-a-good-day">← Search for another activity</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { activity: activitySlug, date } = params;
  const activity = getActivityBySlug(activitySlug);
  if (!activity || !isValidAlmanacDate(date)) {
    return { notFound: true };
  }
  const almanac = await fetchAlmanacForDate(date);
  return {
    props: {
      activity,
      date,
      almanac: almanac || null,
      today: todayInLA(),
    },
    revalidate: 86400,
  };
}
