import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import { READINGS, memberReadingHref } from '../../../../lib/reading-meta';
import styles from '../../../../styles/Account.module.css';

// Canonical names, slugs, and blurbs come from lib/reading-meta.js.
// Compatibility has its own section below (saved reports + new-reading form).
const PERSONAL_READINGS = READINGS
  .filter((r) => r.key !== 'compatibility')
  .map((r) => ({ key: r.slug, title: r.label, blurb: r.blurb, href: memberReadingHref(r) }));

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
      <MemberShell>
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Your readings</h1>

        <section style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.subTitle}>Personal readings</h2>

          {loaded && !hasBirthday && (
            <div className={styles.placeholder} style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>
                Add your birthday to your <Link href="/member/profile">profile</Link> to unlock your personal readings.
              </p>
            </div>
          )}

          {loaded && hasBirthday && (
            <div className={styles.cards}>
              {PERSONAL_READINGS.map((r) => (
                <Link key={r.key} href={r.href} className={styles.card}>
                  <h2>{r.title}</h2>
                  <p>{r.blurb}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className={styles.subTitle} style={{ margin: 0 }}>Compatibility readings</h2>
            <Link href="/member/dashboard/readings/compatibility" className={styles.authSubmit} style={{ textDecoration: 'none', display: 'inline-block' }}>
              + New reading
            </Link>
          </div>

          {loaded && readings.length === 0 && (
            <div className={styles.placeholder} style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0 }}>
                No readings yet. <Link href="/member/dashboard/readings/compatibility">Generate your first one</Link>.
              </p>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            {readings.map((r) => {
              const date = new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
              return (
                <Link key={r.id} href={`/member/dashboard/readings/${r.slug}`} className={styles.icMember} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
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
          <Link href="/member/dashboard">← Back to dashboard</Link>
        </p>
      </main>
      <Footer />
      </MemberShell>
    </>
  );
}
