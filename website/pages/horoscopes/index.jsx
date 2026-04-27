import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import HoroscopeView from '../../components/HoroscopeView';
import { fetchHoroscopesForDate, todayInLA } from '../../lib/horoscopes';
import { ORGANIZATION, WEBSITE, graph, breadcrumb } from '../../lib/schema';

export default function HoroscopesToday({ date, horoscopes, today }) {
  const jsonLd = graph([
    ORGANIZATION,
    WEBSITE,
    breadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Horoscopes', url: '/horoscopes' },
    ]),
  ]);

  return (
    <>
      <SEO
        title="Today's Horoscope | Mahjong Tarot"
        description="A daily horoscope for the Year of the Fire Horse, drawn from Bill Hajdu's BaZi practice. General, Love, and Money for every Chinese zodiac sign."
        path="/horoscopes"
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

export async function getStaticProps() {
  const today = todayInLA();
  const horoscopes = await fetchHoroscopesForDate(today);
  return {
    props: { date: today, horoscopes, today },
    revalidate: 300,
  };
}
