import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import MemberNav from '../../../components/MemberNav';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import styles from '../../../styles/Account.module.css';

const PERSONAL_READINGS = [
  {
    key: 'fire-horse',
    title: 'Year of the Fire Horse',
    blurb: "Your full year ahead, read against your day master.",
    href: '/year-of-the-fire-horse',
    available: true,
  },
  {
    key: 'purple-star',
    title: 'Purple Star (Zi Wei Dou Shu)',
    blurb: 'The 12-palace map of your life themes and seasons.',
    href: '/dashboard/readings/purple-star',
    available: true,
  },
  {
    key: 'three-blessings',
    title: 'Three Blessings',
    blurb: 'Your stars of wealth, prosperity, and longevity.',
    href: '/dashboard/three-blessings',
    available: false,
  },
];

export default function ReadingsList() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const [profileRes, readingsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('birthday')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('readings')
          .select('id, slug, type, person1_name, person2_name, rating, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setProfile(profileRes.data);
      setReadings(readingsRes.data || []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  const hasBirthday = !!profile?.birthday;

  return (
    <>
      <Head>
        <title>Your readings | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <MemberNav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Your readings</h1>

        <section style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.subTitle}>Personal readings</h2>

          {loaded && !hasBirthday && (
            <div className={styles.placeholder} style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>
                Add your birthday to your <Link href="/profile">profile</Link> to unlock your personal readings.
              </p>
            </div>
          )}

          {loaded && hasBirthday && (
            <div className={styles.cards}>
              {PERSONAL_READINGS.map((r) =>
                r.available ? (
                  <Link key={r.key} href={r.href} className={styles.card}>
                    <h2>{r.title}</h2>
                    <p>{r.blurb}</p>
                  </Link>
                ) : (
                  <div key={r.key} className={styles.cardDisabled}>
                    <span className={styles.comingSoonBadge}>Coming soon</span>
                    <h2>{r.title}</h2>
                    <p>{r.blurb}</p>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className={styles.subTitle} style={{ margin: 0 }}>Compatibility reports</h2>
            <Link href="/dashboard/relationships" className={styles.authSubmit} style={{ textDecoration: 'none', display: 'inline-block' }}>
              + New reading
            </Link>
          </div>

          {loaded && readings.length === 0 && (
            <div className={styles.placeholder} style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>
                No readings yet. <Link href="/dashboard/relationships">Generate your first one</Link>.
              </p>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            {readings.map((r) => {
              const date = new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              return (
                <Link key={r.id} href={`/dashboard/readings/${r.slug}`} className={styles.icMember} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                  <div className={styles.icMemberInfo}>
                    <h3>{r.person1_name || 'You'} × {r.person2_name || 'Partner'}</h3>
                    <span>{date}{r.rating != null ? ` · ${Math.round(r.rating)}% match` : ''}</span>
                  </div>
                  <span className={styles.btnGhost} style={{ textDecoration: 'none' }}>View →</span>
                </Link>
              );
            })}
          </div>
        </section>

        <p className={styles.authFootnote} style={{ marginTop: '2rem' }}>
          <Link href="/dashboard">← Back to dashboard</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
