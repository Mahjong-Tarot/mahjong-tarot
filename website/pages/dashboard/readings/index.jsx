import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import styles from '../../../styles/Account.module.css';

export default function ReadingsList() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('readings')
        .select('id, slug, type, person1_name, person2_name, rating, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setReadings(data || []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Your readings | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>Your readings</h1>
            <p className={styles.lede}>Compatibility reports you&apos;ve generated. Click any to revisit.</p>
          </div>
          <Link href="/dashboard/relationships" className={styles.authSubmit} style={{ textDecoration: 'none', display: 'inline-block' }}>
            + New reading
          </Link>
        </div>

        {loaded && readings.length === 0 && (
          <div className={styles.placeholder} style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0 }}>
              No readings yet. <Link href="/dashboard/relationships">Generate your first one</Link>.
            </p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
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

        <p className={styles.authFootnote} style={{ marginTop: '2rem' }}>
          <Link href="/dashboard">← Back to dashboard</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
