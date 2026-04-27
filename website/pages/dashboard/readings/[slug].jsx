import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import CompatibilityReport from '../../../components/CompatibilityReport';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import styles from '../../../styles/Account.module.css';

export default function ReadingPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user, loading } = useAuth();
  const [reading, setReading] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !slug || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('readings')
        .select('*')
        .eq('user_id', user.id)
        .eq('slug', slug)
        .maybeSingle();
      if (cancelled) return;
      setReading(data);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user, slug]);

  if (loading || !user) return null;

  const handleDelete = async () => {
    if (!confirm('Delete this reading? This cannot be undone.')) return;
    const { error } = await supabase.from('readings').delete().eq('id', reading.id);
    if (!error) router.push('/dashboard/readings');
  };

  if (loaded && !reading) {
    return (
      <>
        <Head><title>Reading not found | Mahjong Tarot</title></Head>
        <Nav />
        <main className={`container ${styles.wrap}`}>
          <h1 className={styles.title}>Reading not found</h1>
          <p className={styles.lede}>That reading doesn&apos;t exist or isn&apos;t yours.</p>
          <p><Link href="/dashboard/readings">← Back to readings</Link></p>
        </main>
        <Footer />
      </>
    );
  }

  const dateLabel = reading?.created_at
    ? new Date(reading.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';
  const title = reading ? `${reading.person1_name || 'You'} × ${reading.person2_name || 'Partner'}` : '';

  return (
    <>
      <Head>
        <title>{title || 'Reading'} | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <p className={styles.authFootnote} style={{ marginBottom: '0.5rem' }}>
          <Link href="/dashboard/readings">← Saved readings</Link>
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lede}>Saved {dateLabel}</p>
          </div>
          <button type="button" onClick={handleDelete} className={styles.btnDanger}>
            Delete reading
          </button>
        </div>

        {reading?.report && (
          <div style={{ marginTop: '1.5rem' }}>
            <CompatibilityReport
              result={reading.report}
              person1Label={reading.person1_name || 'You'}
              person2Label={reading.person2_name || 'Partner'}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
