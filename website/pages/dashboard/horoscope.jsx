import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import HoroscopeView from '../../components/HoroscopeView';
import { useAuth } from '../../lib/auth';
import { fetchHoroscopesForDate, todayInLA } from '../../lib/horoscopes';

export default function DashboardHoroscope({ date, horoscopes, today }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Daily Horoscope | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Daily</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Your Horoscope</h1>
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
