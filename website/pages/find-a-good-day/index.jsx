import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AlmanacSearch from '../../components/AlmanacSearch';
import { activityKeyToSlug } from '../../lib/almanac';
import { ORGANIZATION, WEBSITE, graph } from '../../lib/schema';

export default function FindAGoodDay() {
  const router = useRouter();

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
        <section className="page-section">
          <div className="page-intro">
            <span className="overline">Almanac Search</span>
            <h1>Find a Good Day To…</h1>
            <p className="page-intro-lede">
              Search auspicious dates for any activity, wedding, move, business launch, and more.
            </p>
          </div>

          <AlmanacSearch buildResultHref={buildResultHref} />
        </section>
      </main>
      <Footer />
    </>
  );
}
