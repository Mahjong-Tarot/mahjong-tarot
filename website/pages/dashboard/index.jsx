import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BaziChart from '../../components/BaziChart';
import ProfileCompletion from '../../components/ProfileCompletion';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { calculatePillars, tallyElements, dominantElement, elementInteraction } from '../../lib/bazi';
import { calculatePurpleStar } from '../../lib/purpleStar';
import accountStyles from '../../styles/Account.module.css';
import styles from '../../styles/Dashboard.module.css';

const PALACE_ROLE = {
  Ming: 'The Self', Body: 'How You Show Up', Parents: 'Family & Authority',
  Leisure: 'Inner Life', Property: 'Home & Real Estate', Career: 'Work & Reputation',
  Servants: 'Allies & Helpers', Travel: 'Movement & Change', Health: 'Body & Vitality',
  Wealth: 'Money & Resources', Children: 'Creativity & Children', Marriage: 'Partnership', Siblings: 'Peers',
};

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

function calculateAge(birthday) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
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

  // Always compute today's cosmic pillars client-side — available before API responds
  const todayStr = new Date().toISOString().split('T')[0];
  const cosmicPillars = calculatePillars(todayStr, '12:00');
  const dayPillar   = data?.today?.pillars?.day   || cosmicPillars?.day;
  const monthPillar = data?.today?.pillars?.month || cosmicPillars?.month;
  const yearPillar  = data?.today?.pillars?.year  || cosmicPillars?.year;

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const monthLabel = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Personalized energies (require birthday via API)
  const todayEnergy  = data?.today?.energy;
  const yearForecast = data?.fireHorseForecast;

  // Month elemental interaction vs user's day master
  const userDayElement = data?.userPillars?.day?.stem?.element;
  const monthElement   = monthPillar?.stem?.element;
  const monthEnergy    = userDayElement && monthElement
    ? elementInteraction(userDayElement, monthElement)
    : null;

  // Four Pillars
  const userPillars  = profile?.pillars || data?.userPillars || (profile?.birthday ? calculatePillars(profile.birthday, profile.birth_time) : null);
  const userElements = userPillars ? tallyElements(userPillars) : null;
  const userDominant = userElements ? dominantElement(userElements) : null;

  // Purple Star — current decade only, no full chart on dashboard
  const purpleStar = profile?.birthday && profile?.birth_time
    ? calculatePurpleStar({ birthday: profile.birthday, birthTime: profile.birth_time, gender: profile.gender })
    : null;
  const age           = profile?.birthday ? calculateAge(profile.birthday) : null;
  const currentDecade = purpleStar
    ? purpleStar.palaces.find((p) => p.decade && age >= p.decade[0] && age <= p.decade[1]) || null
    : null;

  // Inner Circle
  const upcomingBirthdays = members
    .filter((m) => m.birthday)
    .map((m) => ({ ...m, daysUntil: daysUntilBirthday(m.birthday) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  return (
    <>
      <Head>
        <title>My Dashboard | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${accountStyles.wrap}`}>

        {/* ── 1. Greeting ───────────────────────────────────────── */}
        <div className={styles.greeting}>
          <h1 className={styles.greetingHeadline}>{greeting(profile?.name)}</h1>
          <p className={styles.greetingDate}>{todayLabel}</p>
        </div>

        {/* ── 2. Profile completion nudge ───────────────────────── */}
        {profileLoaded && <ProfileCompletion profile={profile} />}

        {/* ── 3. TODAY HERO ─────────────────────────────────────── */}
        {dayPillar && (
          <div className={styles.todayHero}>
            <div className={styles.todayLeft}>
              <p className={styles.heroLabel}>Today</p>
              <p className={styles.heroChinese}>{dayPillar.gan}{dayPillar.zhi}</p>
              <p className={styles.heroSub}>
                {dayPillar.stem?.polarity} {dayPillar.stem?.element} · {dayPillar.branch?.animal} day
              </p>
            </div>
            <div className={styles.todayRight}>
              {todayEnergy ? (
                <>
                  <h2 className={styles.heroHeadline}>{todayEnergy.headline}</h2>
                  <p className={styles.heroLine}>{todayEnergy.line}</p>
                </>
              ) : (
                <p className={styles.heroMuted}>
                  {profileLoaded && !profile?.birthday
                    ? <><Link href="/profile">Add your birthday</Link> for your personal energy reading.</>
                    : ' '
                  }
                </p>
              )}
              <Link href="/dashboard/almanac" className={styles.heroLink}>
                View today&apos;s almanac →
              </Link>
            </div>
          </div>
        )}

        {/* ── 4. THIS MONTH | THIS YEAR ─────────────────────────── */}
        <div className={styles.periodRow}>

          {/* Month */}
          <div className={styles.periodCard}>
            <p className={styles.periodLabel}>This month · {monthLabel}</p>
            <p className={styles.periodChinese}>{monthPillar?.gan}{monthPillar?.zhi}</p>
            <p className={styles.periodName}>
              {monthPillar?.stem?.polarity} {monthPillar?.stem?.element} {monthPillar?.branch?.animal} Month
            </p>
            {monthEnergy && (
              <p className={styles.periodTagline}>{monthEnergy.headline}</p>
            )}
            {!monthEnergy && profileLoaded && !profile?.birthday && (
              <p className={styles.periodMuted}>
                <Link href="/profile">Add your birthday</Link> for your monthly energy.
              </p>
            )}
          </div>

          {/* Year */}
          <div className={styles.periodCard}>
            <p className={styles.periodLabel}>This year · Fire Horse</p>
            <p className={styles.periodChinese}>{yearPillar?.gan}{yearPillar?.zhi}</p>
            <p className={styles.periodName}>
              {yearPillar?.stem?.polarity} {yearPillar?.stem?.element} {yearPillar?.branch?.animal} Year
            </p>
            {yearForecast ? (
              <>
                <p className={styles.periodScore}>
                  {Math.round(yearForecast.rating)}<span>%</span>
                </p>
                <p className={styles.periodFav}>Your year favorability</p>
                <Link href="/year-of-the-fire-horse" className={styles.periodLink}>
                  Full year reading →
                </Link>
              </>
            ) : profileLoaded && !profile?.birthday ? (
              <p className={styles.periodMuted}>
                <Link href="/profile">Add your birthday</Link> to see your favorability.
              </p>
            ) : null}
          </div>
        </div>

        {/* ── 5. YOUR FOUR PILLARS ──────────────────────────────── */}
        {userPillars && (
          <div className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Four Pillars</h2>
            </div>
            <BaziChart pillars={userPillars} elements={userElements} dominantElement={userDominant} />
          </div>
        )}

        {/* ── 6. PURPLE STAR · NOW ──────────────────────────────── */}
        {purpleStar && currentDecade && (
          <div className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Purple Star · Now</h2>
              <Link href="/dashboard/readings/purple-star" className={styles.sectionLink}>
                Full chart →
              </Link>
            </div>
            <div className={styles.decadeCard}>
              <div className={styles.decadeLeft}>
                <p className={styles.decadeLabel}>Current decade palace</p>
                <p className={styles.decadeName}>{currentDecade.name}</p>
                {PALACE_ROLE[currentDecade.name] && (
                  <p className={styles.decadeRole}>{PALACE_ROLE[currentDecade.name]}</p>
                )}
                {currentDecade.decade && (
                  <p className={styles.decadeRange}>
                    Ages {currentDecade.decade[0]}–{currentDecade.decade[1]}
                    {age != null && ` · you are ${age}`}
                  </p>
                )}
              </div>
              {currentDecade.majorStars?.length > 0 && (
                <div className={styles.decadeRight}>
                  <p className={styles.decadeStarsLabel}>Major stars this decade</p>
                  <p className={styles.decadeStars}>
                    {currentDecade.majorStars.map((s) => s.name + (s.mutagen ? ` (${s.mutagen})` : '')).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 7. INNER CIRCLE + BIRTHDAYS ───────────────────────── */}
        {(data?.memberRatings?.length > 0 || upcomingBirthdays.length > 0) && (
          <div className={styles.twoCol}>

            {data?.memberRatings?.length > 0 && (
              <div className={styles.circleCol}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Inner circle</h2>
                  <Link href="/dashboard/inner-circle" className={styles.sectionLink}>Manage →</Link>
                </div>
                <ul className={styles.gridList}>
                  {data.memberRatings.map((m) => (
                    <li key={m.id}>
                      <Link href={`/dashboard/inner-circle/${m.id}`}>
                        <span className={styles.gridName}>
                          {m.name}
                          {m.relationship && <small>· {m.relationship}</small>}
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
              </div>
            )}

            {upcomingBirthdays.length > 0 && (
              <div className={styles.circleCol}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 'var(--space-md)' }}>
                  Upcoming birthdays
                </h2>
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
              </div>
            )}
          </div>
        )}

        {/* ── 8. RECENT READINGS ────────────────────────────────── */}
        {readings.length > 0 && (
          <div className={styles.chartSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent readings</h2>
              <Link href="/dashboard/readings" className={styles.sectionLink}>View all →</Link>
            </div>
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
          </div>
        )}

        {/* ── 9. ALMANAC CTA ────────────────────────────────────── */}
        <div className={styles.almanacTeaser}>
          <div>
            <h3 className={styles.teaserTitle}>Tong Shu Almanac</h3>
            <p className={styles.teaserSub}>Daily guidance · auspicious activities and what to avoid</p>
          </div>
          <Link href="/dashboard/almanac" className={styles.periodLink}>
            View today in the almanac →
          </Link>
        </div>

      </main>
      <Footer />
    </>
  );
}
