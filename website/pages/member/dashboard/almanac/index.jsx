import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import AlmanacView from '../../../../components/AlmanacView';
import { useAuth, tryRefreshSession } from '../../../../lib/auth';
import { fetchAlmanacForDate, todayInLA } from '../../../../lib/almanac';

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
      let { data, error } = await fetchAlmanacForDate(today);
      if (error) {
        // An auth error (e.g. an expired token surfacing as a 401) must not be
        // shown as "No almanac record". Refresh the session and retry once; if
        // it can't be recovered, send the member to sign in.
        if (cancelled) return;
        const recovered = await tryRefreshSession();
        if (cancelled) return;
        if (!recovered) { router.replace('/sign-in'); return; }
        ({ data, error } = await fetchAlmanacForDate(today));
        if (cancelled) return;
        if (error) { router.replace('/sign-in'); return; }
      }
      if (cancelled) return;
      setDate(today);
      setAlmanac(data);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Almanac | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
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
      </MemberShell>
    </>
  );
}
