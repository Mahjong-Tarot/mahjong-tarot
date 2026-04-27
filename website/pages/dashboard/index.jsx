import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BaziChart from '../../components/BaziChart';
import ThreeBlessings from '../../components/ThreeBlessings';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { calculatePillars, tallyElements, dominantElement } from '../../lib/bazi';
import { computeThreeBlessings } from '../../lib/three-blessings';
import styles from '../../styles/Account.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [members, setMembers] = useState([]);
  const [readings, setReadings] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, birthday, birth_time, gender, pillars')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setProfile(p.data);
      setProfileLoaded(true);
      setMembers(m.data || []);
      setReadings(r.data || []);

      if (p.data?.birthday) {
        const res = await fetch('/api/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              birthday: p.data.birthday,
              birthTime: p.data.birth_time ? p.data.birth_time.slice(0, 5) : null,
              gender: p.data.gender || 'M',
            },
            members: (m.data || []).map((mem) => ({
              id: mem.id,
              name: mem.name,
              relationship: mem.relationship,
              birthday: mem.birthday,
              birthTime: mem.birth_time ? mem.birth_time.slice(0, 5) : null,
              gender: mem.gender || 'F',
            })),
          }),
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setData(json);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  const pillars = profile?.pillars
    || (profile?.birthday ? calculatePillars(profile.birthday, profile.birth_time) : null);
  const elements = pillars ? tallyElements(pillars) : null;
  const dominant = elements ? dominantElement(elements) : null;
  const threeBlessings = pillars
    ? computeThreeBlessings({
        birthday: profile?.birthday,
        birthTime: profile?.birth_time,
        pillars,
      })
    : null;

  return (
    <>
      <Head>
        <title>My Dashboard | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${accountStyles.wrap}`}>
        <h1 className={accountStyles.title}>My Dashboard</h1>

        <section style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.subTitle}>Today</h2>
          <AlmanacToday />
        </section>

        {profileLoaded && !profile?.birthday && (
          <div className={accountStyles.placeholder} style={{ marginTop: '1rem' }}>
            <p style={{ margin: 0 }}>
              Add your birth data on your <Link href="/profile">profile</Link> to unlock your daily energy and chart.
            </p>
          </div>
        )}

        {/* Today's Energy */}
        {today && (
          <section className={styles.todayHero}>
            <div className={styles.todayDate}>
              <p className={styles.todayLabel}>Today · {todayLabel}</p>
              <p className={styles.todayPillar}>
                {today.pillars?.day?.gan}{today.pillars?.day?.zhi}
                <span className={styles.todayPillarEn}>
                  {today.pillars?.day?.stem?.polarity} {today.pillars?.day?.stem?.element} · {today.pillars?.day?.branch?.animal} day
                </span>
              </p>
            </div>
            {today.energy ? (
              <div className={styles.todayEnergy}>
                <h3 className={styles.todayHeadline}>{today.energy.headline}</h3>
                <p className={styles.todayLine}>{today.energy.line}</p>
              </div>
            ) : (
              <div className={styles.todayEnergy}>
                <p className={accountStyles.muted}>Add a birthday to your profile to see today&apos;s energy reading.</p>
              </div>
            )}
          </section>
        )}

        {threeBlessings && (
          <section style={{ marginTop: '2.5rem' }}>
            <h2 className={styles.subTitle}>Your Three Blessings</h2>
            <ThreeBlessings reading={threeBlessings} />
          </section>
        )}

        <section style={{ marginTop: '2.5rem' }}>
          <h2 className={styles.subTitle}>Quick links</h2>
          <div className={styles.cards}>
            <Link href="/dashboard/relationships" className={styles.card}>
              <h2>Relationships</h2>
              <p>Compare any two birth charts and generate a new reading.</p>
            </Link>
            <Link href="/dashboard/inner-circle" className={styles.card}>
              <h2>Inner Circle</h2>
              <p>Wife, parents, kids, GF — keep their charts close.</p>
            </Link>
            <Link href="/dashboard/three-blessings" className={styles.card}>
              <h2>Three Blessings</h2>
              <p>Phuc, Loc, Tho — your personal pattern of fortune.</p>
            </Link>
            <Link href="/dashboard/readings" className={styles.card}>
              <h2>My Readings</h2>
              <p>Every saved compatibility report you&apos;ve generated.</p>
            </Link>
            <Link href="/profile" className={styles.card}>
              <h2>Profile</h2>
              <p>Update your birth data and chart.</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
