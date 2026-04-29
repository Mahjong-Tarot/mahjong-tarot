import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AlmanacView from '../../components/AlmanacView';
import {
  fetchAlmanacForDate,
  isValidAlmanacDate,
  todayInLA,
  formatHumanDate,
  ALMANAC_RANGE_START,
} from '../../lib/almanac';
import { ORGANIZATION, WEBSITE, graph, breadcrumb } from '../../lib/schema';

export default function PublicAlmanacDate({ date, almanac, today }) {
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
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Daily</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Tong Shu Almanac</h1>
          </div>
          <AlmanacView
            date={date}
            almanac={almanac}
            today={today}
            basePath="/almanac"
            searchHref={null}
          />
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

export async function getStaticProps({ params }) {
  const date = params.date;
  if (!isValidAlmanacDate(date)) {
    return { notFound: true };
  }
  const today = todayInLA();
  const almanac = await fetchAlmanacForDate(date);
  if (!almanac) {
    return { notFound: true, revalidate: 300 };
  }
  return {
    props: { date, almanac, today },
    revalidate: date === today ? 300 : 3600,
  };
}
