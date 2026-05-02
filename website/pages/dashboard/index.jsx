import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import MemberNav from '../../components/MemberNav';
import Footer from '../../components/Footer';
import BaziChart from '../../components/BaziChart';
import PurpleStarChart from '../../components/PurpleStarChart';
import ProfileCompletion from '../../components/ProfileCompletion';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { calculatePillars, tallyElements, dominantElement } from '../../lib/bazi';
import { calculatePurpleStar } from '../../lib/purpleStar';
import accountStyles from '../../styles/Account.module.css';
import styles from '../../styles/Dashboard.module.css';

function ratingColor(rating) {
  if (rating == null) return '#b0b0b0';
  if (rating >= 80) return '#2A8A48';
  if (rating >= 70) return '#3a7bb8';
  if (rating >= 60) return '#b88c4f';
  if (rating >= 50) return '#cc7a3a';
  return '#c0392b';
}

function daysUntilBirthday(birthday) {
  if (!birthday) return null;
  const [, mo, d] = birthday.split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), mo - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, mo - 1, d);
  return Math.round((next - today) / (1000 * 60 * 60 * 24));
}

function greeting(name) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  return name ? `Good ${time}, ${name.split(' ')[0]}` : `Good ${time}`;
}

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
      const [p, m, r] = await Promise.all([
        supabase.from('profiles').select('name, birthday, birth_time, gender, pillars').eq('user_id', user.id).maybeSingle(),
        supabase.from('inner_circle').select('id, name, relationship, birthday, birth_time, gender').eq('user_id', user.id),
        supabase.from('readings').select('id, slug, person1_name, person2_name, rating, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);
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

  const today = data?.today;
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const upcomingBirthdays = members
    .filter((m) => m.birthday)
    .map((m) => ({ ...m, daysUntil: daysUntilBirthday(m.birthday) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  const userPillars = profile?.pillars || data?.userPillars || (profile?.birthday ? calculatePillars(profile.birthday, profile.birth_time) : null);
  const userElements = userPillars ? tallyElements(userPillars) : null;
  const userDominant = userElements ? dominantElement(userElements) : null;

  const purpleStar = profile?.birthday && profile?.birth_time
    ? calculatePurpleStar({
        birthday: profile.birthday,
        birthTime: profile.birth_time,
        gender: profile.gender,
      })
    : null;

  return (
    <>
      <Head>
        <title>My Dashboard | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <MemberNav />
      <main className={`container ${accountStyles.wrap}`}>

        {/* Greeting header */}
        <div className={styles.greeting}>
          <h1 className={styles.greetingHeadline}>{greeting(profile?.name)}</h1>
          <p className={styles.greetingDate}>{todayLabel}</p>
        </div>

        {/* Profile completion nudge — consolidated from scattered per-section messages */}
        {profileLoaded && <ProfileCompletion profile={profile} />}

        {/* Today's Energy hero */}
        {today && (
          <section className={styles.todayHero}>
            <div className={styles.todayDate}>
              <p className={styles.todayLabel}>Today's energy</p>
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
                <p className={accountStyles.muted}>Add a birthday on your profile to see today&apos;s personalized energy.</p>
              </div>
            )}
          </section>
        )}

        {/* Two cards: Fire Horse + Birthdays */}
        {(data?.fireHorseForecast || profileLoaded) && (
          <section className={styles.twoCol}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Year of the Fire Horse</h3>
              <p className={styles.cardSubtitle}>Your year ahead</p>
              {data?.fireHorseForecast ? (
                <>
                  <p className={styles.bigRating}>
                    {Math.round(data.fireHorseForecast.rating)}<span>%</span>
                  </p>
                  <p className={styles.cardBody}>
                    {(data.fireHorseForecast.narrative || '').slice(0, 240)}
                    {(data.fireHorseForecast.narrative || '').length > 240 ? '…' : ''}
                  </p>
                  <Link href="/year-of-the-fire-horse" className={styles.cardLink}>
                    Read the full year ahead →
                  </Link>
                </>
              ) : (
                <p className={accountStyles.muted}>Add your birthday on your profile to see your Fire Horse forecast.</p>
              )}
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Upcoming birthdays</h3>
              <p className={styles.cardSubtitle}>From your inner circle</p>
              {upcomingBirthdays.length > 0 ? (
                <ul className={styles.bdayList}>
                  {upcomingBirthdays.map((m) => (
                    <li key={m.id}>
                      <Link href={`/dashboard/inner-circle/${m.id}`}>
                        <strong>{m.name}</strong>
                        <span className={styles.bdayMeta}>· {m.relationship}</span>
                        <span className={styles.bdayDays}>
                          {m.daysUntil === 0 ? 'today' : m.daysUntil === 1 ? 'tomorrow' : `in ${m.daysUntil} days`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={accountStyles.muted}>
                  <Link href="/dashboard/inner-circle/new">Add to your Inner Circle</Link> to see upcoming birthdays.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Inner Circle compatibility grid */}
        {data?.memberRatings?.length > 0 && (
          <section className={styles.section}>
            <h2 className={accountStyles.subTitle}>Your inner circle · at a glance</h2>
            <ul className={styles.gridList}>
              {data.memberRatings.map((m) => (
                <li key={m.id}>
                  <Link href={`/dashboard/inner-circle/${m.id}`}>
                    <span>
                      <span className={styles.gridName}>
                        {m.name}
                        <small>· {m.relationship}{m.sign ? ` · ${m.sign}` : ''}</small>
                      </span>
                    </span>
                    {m.rating != null ? (
                      <span className={styles.gridRating} style={{ background: ratingColor(m.rating) }}>
                        {Math.round(m.rating)}%
                      </span>
                    ) : (
                      <span className={accountStyles.muted}>–</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Your Four Pillars */}
        {userPillars && (
          <section className={styles.section}>
            <h2 className={accountStyles.subTitle}>Your Four Pillars</h2>
            <BaziChart pillars={userPillars} elements={userElements} dominantElement={userDominant} />
          </section>
        )}

        {/* Purple Star Chart */}
        {purpleStar && (
          <section className={styles.section}>
            <h2 className={accountStyles.subTitle}>Your Purple Star Chart</h2>
            <PurpleStarChart chart={purpleStar} name={profile?.name} />
          </section>
        )}

        {/* Recent readings */}
        {readings.length > 0 && (
          <section className={styles.section}>
            <h2 className={accountStyles.subTitle}>Recent readings</h2>
            <ul className={styles.recentList}>
              {readings.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/readings/${r.slug}`}>
                    <strong>{r.person1_name || 'You'} × {r.person2_name || 'Partner'}</strong>
                    <span className={styles.recentDate}>
                      {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {r.rating != null && (
                      <span className={styles.recentRating}>{Math.round(r.rating)}%</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '1rem' }}>
              <Link href="/dashboard/readings" className={styles.cardLink}>View all readings →</Link>
            </p>
          </section>
        )}

        {/* Almanac link — replaces the embedded AlmanacToday widget */}
        <section className={styles.section}>
          <div className={styles.almanacTeaser}>
            <div>
              <h3 className={styles.cardTitle}>Tong Shu Almanac</h3>
              <p className={styles.cardSubtitle}>Daily guidance · what to do and what to avoid</p>
            </div>
            <Link href="/dashboard/almanac" className={styles.cardLink}>
              View today in the almanac →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
