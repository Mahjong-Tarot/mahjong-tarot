import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import AlmanacView from '../../../components/AlmanacView';
import { useAuth } from '../../../lib/auth';
import { fetchAlmanacForDate, todayInLA } from '../../../lib/almanac';

export default function AlmanacToday() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [date, setDate] = useState(null);
  const [almanac, setAlmanac] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const today = todayInLA();
      const a = await fetchAlmanacForDate(today);
      if (cancelled) return;
      setDate(today);
      setAlmanac(a);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Almanac | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Daily</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Tong Shu Almanac</h1>
          </div>
          {loaded && date && (
            <AlmanacView date={date} almanac={almanac} today={date} />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
