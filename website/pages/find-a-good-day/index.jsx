import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AlmanacSearch from '../../components/AlmanacSearch';
import { activityKeyToSlug, activitySlugToKey } from '../../lib/almanac';
import { ORGANIZATION, WEBSITE, graph } from '../../lib/schema';
import styles from '../../styles/FindAGoodDay.module.css';

export default function FindAGoodDay() {
  const router = useRouter();
  // ?activity=<slug> (from the almanac's quick links) preselects an activity.
  const slug = router.isReady && typeof router.query.activity === 'string' ? router.query.activity : null;
  const initialActivityKey = slug ? activitySlugToKey(slug) : null;

  function buildResultHref(date, activity) {
    const slug = activityKeyToSlug(activity.key);
    return `/find-a-good-day/${slug}/${date}`;
  }

  const jsonLd = graph([
    ORGANIZATION,
    WEBSITE,
    {
      '@type': 'WebPage',
      '@id': 'https://www.mahjongtarot.com/find-a-good-day#page',
      url: 'https://www.mahjongtarot.com/find-a-good-day',
      name: 'Find a Good Day | Mahjong Tarot',
      description: 'Search the Chinese almanac for auspicious days to marry, move, sign a contract, travel, and more — based on the Tong Shu day-officer cycle.',
      isPartOf: { '@id': 'https://www.mahjongtarot.com/#website' },
    },
  ]);

  return (
    <>
      <SEO
        title="Find a Good Day | Mahjong Tarot"
        description="Search the Chinese almanac for auspicious days to marry, move, sign a contract, travel, and more — based on the Tong Shu day-officer cycle."
        path="/find-a-good-day"
        jsonLd={jsonLd}
      />
      <Nav />
      <main>
        <section className={styles.intro}>
          <div className="container">
            <span className="overline">Almanac search</span>
            <h1 className={styles.title}>Find a good day to&hellip;</h1>
            <p className={styles.lead}>
              Search auspicious dates for any activity: a wedding, a move, a
              business launch, and more.
            </p>
          </div>
        </section>
        <section className={styles.searchSection}>
          <AlmanacSearch
            key={initialActivityKey || 'none'}
            buildResultHref={buildResultHref}
            initialActivityKey={initialActivityKey}
            backHref="/almanac"
            backLabel="← Back to today’s almanac"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
