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
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Almanac Search</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Find a Good Day To…</h1>
            <p style={{
              marginTop: 'var(--space-sm)',
              color: 'var(--color-text-muted, #777)',
              fontSize: '0.95rem',
              maxWidth: 520,
              margin: 'var(--space-sm) auto 0',
            }}>
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
