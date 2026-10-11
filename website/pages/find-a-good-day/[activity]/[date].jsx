import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import AlmanacView from '../../../components/AlmanacView';
import ShareRow from '../../../components/ShareRow';
import {
  fetchAlmanacForDate,
  isValidAlmanacDate,
  todayInLA,
  formatHumanDate,
  getActivityBySlug,
} from '../../../lib/almanac';
import { explainScore } from '../../../lib/explainScore';
import { trackResultViewed } from '../../../lib/analytics';
import styles from '../../../styles/FindAGoodDay.module.css';

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

  // Fire e2_result_viewed once per (activity, date) mount.
  const viewedRef = useRef(null);
  useEffect(() => {
    const key = `${activity.key}|${date}`;
    if (viewedRef.current === key) return;
    viewedRef.current = key;
    trackResultViewed({
      activityKey: activity.key,
      date,
      score: almanac?.score,
    });
  }, [activity.key, date, almanac?.score]);

  return (
    <>
      <SEO
        title={title}
        description={description}
        path={`/find-a-good-day/${activity.slug}/${date}`}
      />
      <Nav />
      <main>
        <section className="page-section">
          <div className="page-intro">
            <span className="overline">Almanac · {activity.label}</span>
            <h1>{humanDate}</h1>
            {verdictPhrase && (
              <p className={styles.verdict}>
                The almanac reads this as <strong>{verdictPhrase}</strong> for{' '}
                <strong>{activity.label.toLowerCase()}</strong>.
              </p>
            )}
          </div>
          {explanation && (
            <div className={styles.explain}>
              <div className="label-mono">
                Why this date scores the way it does
              </div>
              <p>{explanation}</p>
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
            <p className="empty-note">
              No almanac record for {humanDate}.
            </p>
          )}
          {almanac && (
            <ShareRow
              path={`/find-a-good-day/${activity.slug}/${date}`}
              title={`${humanDate} for ${activity.label} — Mahjong Tarot Almanac`}
              activityKey={activity.key}
              date={date}
            />
          )}
          <div className={styles.backLink}>
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
  const { data: almanac } = await fetchAlmanacForDate(date);
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
