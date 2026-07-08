import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import AlmanacView from '../../../../components/AlmanacView';
import { useAuth, tryRefreshSession } from '../../../../lib/auth';
import { fetchAlmanacForDate, todayInLA, isValidAlmanacDate, formatHumanDate } from '../../../../lib/almanac';

export default function AlmanacDate() {
  const router = useRouter();
  const { date } = router.query;
  const { user, loading } = useAuth();
  const [almanac, setAlmanac] = useState(null);
  const [today, setToday] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !date) return;
    if (!isValidAlmanacDate(date)) {
      setNotFound(true);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      let { data, error } = await fetchAlmanacForDate(date);
      if (error) {
        // Auth error (e.g. expired token → 401): recover the session and retry
        // once, then bounce to sign-in rather than showing a false empty state.
        if (cancelled) return;
        const recovered = await tryRefreshSession();
        if (cancelled) return;
        if (!recovered) { router.replace('/sign-in'); return; }
        ({ data, error } = await fetchAlmanacForDate(date));
        if (cancelled) return;
        if (error) { router.replace('/sign-in'); return; }
      }
      if (cancelled) return;
      setAlmanac(data);
      setToday(todayInLA());
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, date, router]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>
          {date && isValidAlmanacDate(date) ? `Almanac for ${formatHumanDate(date)}` : 'Almanac'} | Mahjong Tarot
        </title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
      <main>
        <section style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span className="overline">Daily</span>
            <h1 style={{ marginTop: 'var(--space-xs)' }}>Tong Shu Almanac</h1>
          </div>
          {loaded && !notFound && (
            <AlmanacView
              date={date}
              almanac={almanac}
              today={today}
              basePath="/member/dashboard/almanac"
              searchHref="/member/dashboard/almanac/search"
              monthlyHref={`/member/dashboard/almanac/calendar/${date.slice(0, 7)}`}
            />
          )}
          {loaded && notFound && (
            <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
              Date out of range. The Fire Horse year covers 2026-02-17 through 2027-02-05.
            </p>
          )}
        </section>
      </main>
      <Footer />
      </MemberShell>
    </>
  );
}
