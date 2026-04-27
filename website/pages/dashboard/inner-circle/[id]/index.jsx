import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../../../components/Nav';
import Footer from '../../../../components/Footer';
import CompatibilityReport from '../../../../components/CompatibilityReport';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import styles from '../../../../styles/Account.module.css';

export default function MemberDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [member, setMember]   = useState(null);
  const [profile, setProfile] = useState(null);
  const [report, setReport]   = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError]     = useState('');
  const [loadedMember, setLoadedMember] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !id || !supabase) return;
    let cancelled = false;
    (async () => {
      const [m, p] = await Promise.all([
        supabase.from('inner_circle').select('*').eq('id', id).eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('name, birthday, birth_time, gender').eq('user_id', user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setMember(m.data);
      setProfile(p.data);
      setLoadedMember(true);

      if (m.data?.birthday && p.data?.birthday) {
        setLoadingReport(true);
        try {
          const res = await fetch('/api/compatibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              person1: {
                name: p.data.name || 'You',
                birthday: p.data.birthday,
                birthTime: p.data.birth_time ? p.data.birth_time.slice(0, 5) : null,
                gender: p.data.gender || 'M',
              },
              person2: {
                name: m.data.name,
                birthday: m.data.birthday,
                birthTime: m.data.birth_time ? m.data.birth_time.slice(0, 5) : null,
                gender: m.data.gender || 'F',
              },
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          if (!cancelled) setReport(data);
        } catch (e) {
          if (!cancelled) setError(e.message);
        } finally {
          if (!cancelled) setLoadingReport(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user, id]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>{member?.name || 'Member'} | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        {loadedMember && !member ? (
          <>
            <h1 className={styles.title}>Not found</h1>
            <p className={styles.lede}>That person isn&apos;t in your inner circle.</p>
            <p><Link href="/dashboard/inner-circle">← Back to inner circle</Link></p>
          </>
        ) : (
          <>
            <h1 className={styles.title}>{member?.name}</h1>
            <p className={styles.lede}>{member?.relationship} · {member?.birthday}</p>

            <div style={{ display: 'flex', gap: '0.75rem', margin: '1rem 0' }}>
              <Link href={`/dashboard/inner-circle/${id}/edit`} className={styles.btnGhost} style={{ textDecoration: 'none' }}>
                Edit
              </Link>
              <Link href="/dashboard/inner-circle" className={styles.btnGhost} style={{ textDecoration: 'none' }}>
                Back to circle
              </Link>
            </div>

            {!profile?.birthday && (
              <div className={styles.placeholder}>
                <p style={{ margin: 0 }}>
                  Add your own birth data on <Link href="/profile">your profile</Link> to see a compatibility report.
                </p>
              </div>
            )}

            {loadingReport && <p className={styles.muted}>Calculating compatibility…</p>}
            {error && <p className={styles.authError}>{error}</p>}

            {report && (
              <section style={{ marginTop: '1.5rem' }}>
                <h2 className={styles.subTitle}>Your compatibility</h2>
                <CompatibilityReport
                  result={report}
                  person1Label={profile?.name || 'You'}
                  person2Label={member?.name}
                />
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
