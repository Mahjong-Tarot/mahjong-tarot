import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BaziChart from '../../components/BaziChart';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { calculatePillars, tallyElements, dominantElement } from '../../lib/bazi';
import styles from '../../styles/Account.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, birthday, birth_time, pillars')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data);
      setProfileLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  const name = profile?.name || user.email?.split('@')[0] || '';
  const greeting = name ? `, ${name}` : '';
  const pillars = profile?.pillars
    || (profile?.birthday ? calculatePillars(profile.birthday, profile.birth_time) : null);
  const elements = pillars ? tallyElements(pillars) : null;
  const dominant = elements ? dominantElement(elements) : null;

  return (
    <>
      <Head>
        <title>Dashboard | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Welcome{greeting}</h1>
        <p className={styles.lede}>Your Mahjong Tarot home.</p>

        {profileLoaded && !profile?.birthday && (
          <div className={styles.placeholder}>
            <p style={{ margin: 0 }}>
              Add your birth data on your <Link href="/profile">profile</Link> to see your Four Pillars chart.
            </p>
          </div>
        )}

        {pillars && (
          <section style={{ marginTop: '1rem' }}>
            <h2 className={styles.subTitle}>Your Four Pillars</h2>
            <BaziChart pillars={pillars} elements={elements} dominantElement={dominant} />
          </section>
        )}

        <section style={{ marginTop: '2.5rem' }}>
          <h2 className={styles.subTitle}>Tools</h2>
          <div className={styles.cards}>
            <Link href="/dashboard/compatibility" className={styles.card}>
              <h2>Compatibility</h2>
              <p>Compare any two birth charts and see a relationship report.</p>
            </Link>
            <Link href="/dashboard/inner-circle" className={styles.card}>
              <h2>Inner Circle</h2>
              <p>Wife, parents, kids, GF — keep their charts and see how you match.</p>
            </Link>
            <Link href="/dashboard/readings" className={styles.card}>
              <h2>Your readings</h2>
              <p>Review past readings Bill has shared with you.</p>
            </Link>
            <Link href="/firepig" className={styles.card}>
              <h2>FirePig</h2>
              <p>Talk to Bill&apos;s AI guide.</p>
            </Link>
            <Link href="/profile" className={styles.card}>
              <h2>Profile</h2>
              <p>Manage your account and birth data.</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
