import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { saveReading } from '../../lib/readings';
import styles from '../../styles/Account.module.css';

export default function CompatibilityPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [p1, setP1] = useState({ name: 'You',     birthday: '', birthTime: '', gender: 'M' });
  const [p2, setP2] = useState({ name: 'Partner', birthday: '', birthTime: '', gender: 'F' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  // Pre-fill person 1 from the user's profile if available
  useEffect(() => {
    if (!user || !supabase) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, birthday, birth_time, gender')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.birthday) {
        setP1({
          name: data.name || 'You',
          birthday: data.birthday || '',
          birthTime: data.birth_time ? data.birth_time.slice(0, 5) : '',
          gender: data.gender || 'M',
        });
      }
    })();
  }, [user]);

  if (loading || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person1: p1, person2: p2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');

      const saved = await saveReading({
        userId: user.id,
        person1: p1,
        person2: p2,
        report: data,
      });
      router.push(`/dashboard/readings/${saved.slug}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  const personForm = (label, person, setter) => (
    <div className={styles.compatCard}>
      <h3>{label}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
        <label className={styles.authLabel}>
          Name
          <input type="text" value={person.name} onChange={(e) => setter({ ...person, name: e.target.value })} className={styles.authInput} />
        </label>
        <label className={styles.authLabel}>
          Birthday
          <input type="date" value={person.birthday} onChange={(e) => setter({ ...person, birthday: e.target.value })} required className={styles.authInput} />
        </label>
        <label className={styles.authLabel}>
          Birth time (optional)
          <input type="time" value={person.birthTime} onChange={(e) => setter({ ...person, birthTime: e.target.value })} className={styles.authInput} />
        </label>
        <label className={styles.authLabel}>
          Gender
          <select value={person.gender} onChange={(e) => setter({ ...person, gender: e.target.value })} className={styles.authInput}>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Relationships | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Relationships</h1>
        <p className={styles.lede}>
          Enter two people. We&apos;ll save the report to your dashboard with its
          own page so you can come back to it.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.compatGrid}>
            {personForm('Person 1', p1, setP1)}
            {personForm('Person 2', p2, setP2)}
          </div>

          {error && <p className={styles.authError} style={{ marginTop: '1rem' }}>{error}</p>}

          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" disabled={submitting} className={styles.authSubmit}>
              {submitting ? 'Calculating & saving…' : 'Generate reading'}
            </button>
          </div>
        </form>

        <p className={styles.authFootnote} style={{ marginTop: '2.5rem' }}>
          <Link href="/dashboard/readings">View saved readings</Link> · <Link href="/dashboard">← Dashboard</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
