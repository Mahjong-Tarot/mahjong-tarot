import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import HoroscopeView from '../../components/HoroscopeView';
import { fetchHoroscopesForDate, todayInLA, isValidHoroscopeDate, LNY_2026 } from '../../lib/horoscopes';
import { ORGANIZATION, WEBSITE, graph, breadcrumb } from '../../lib/schema';

function formatHumanDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function HoroscopeDate({ date, horoscopes, today }) {
  const human = formatHumanDate(date);
  const jsonLd = graph([
    ORGANIZATION,
    WEBSITE,
    breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Horoscopes', url: '/horoscopes' },
      { name: human, url: `/horoscopes/${date}` },
    ]),
  ]);

  return (
    <>
      <SEO
        title={`Horoscope for ${human} | Mahjong Tarot`}
        description={`The daily horoscope for ${human}, drawn from Bill Hajdu's BaZi practice. General, Love, and Money for every Chinese zodiac sign.`}
        path={`/horoscopes/${date}`}
        jsonLd={jsonLd}
      />
      <Nav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Daily</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Horoscopes</h1>
          </div>
          <HoroscopeView date={date} horoscopes={horoscopes} today={today} />
        </section>
      </main>
      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  // Pre-build the most recent ~30 days, fall back to ISR for older dates.
  const today = todayInLA();
  const end = new Date(today + 'T12:00:00');
  const lny = new Date(LNY_2026 + 'T12:00:00');
  const paths = [];
  const cursor = new Date(end);
  for (let i = 0; i < 30 && cursor >= lny; i += 1) {
    paths.push({ params: { date: cursor.toISOString().slice(0, 10) } });
    cursor.setDate(cursor.getDate() - 1);
  }
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const date = params.date;
  if (!isValidHoroscopeDate(date)) {
    return { notFound: true };
  }
  const today = todayInLA();
  const horoscopes = await fetchHoroscopesForDate(date);
  return {
    props: { date, horoscopes, today },
    revalidate: date === today ? 300 : 3600,
  };
}
