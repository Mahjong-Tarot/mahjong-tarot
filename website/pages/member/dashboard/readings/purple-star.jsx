import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import PurpleStarChart from '../../../../components/PurpleStarChart';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import { calculatePurpleStar } from '../../../../lib/purpleStar';
import { computePalaceOutlook } from '../../../../lib/purpleStarReport';
import accountStyles from '../../../../styles/Account.module.css';

const PALACE_MEANINGS = {
  Ming:     { role: 'The Self',          blurb: 'Your core character, temperament, and the essential lens through which you meet life.' },
  Body:     { role: 'How You Show Up',   blurb: 'How destiny gets enacted in real choices and habits over a lifetime.' },
  Parents:  { role: 'Family & Authority', blurb: 'Your relationship with parents, mentors, and figures of authority.' },
  Leisure:  { role: 'Inner Life',        blurb: 'Spiritual orientation, what brings you peace, hobbies that feed you.' },
  Property: { role: 'Home & Real Estate', blurb: 'Your home, lands, family fortune, where you put down roots.' },
  Career:   { role: 'Work & Reputation', blurb: 'Career arc, public standing, how the world sees your contribution.' },
  Servants: { role: 'Allies & Helpers',  blurb: 'Colleagues, friends, employees, the people who carry things with you.' },
  Travel:   { role: 'Movement & Change', blurb: 'Travel, relocation, the openness to new environments and opportunities.' },
  Health:   { role: 'Body & Vitality',   blurb: 'Physical health, energy levels, vulnerabilities to watch.' },
  Wealth:   { role: 'Money',             blurb: 'How money flows in and out, earning style, spending instincts.' },
  Children: { role: 'Children & Creativity', blurb: 'Children, students, creative output, what you bring forth.' },
  Marriage: { role: 'Partnership',       blurb: 'Romantic partner, the dynamic of marriage and committed love.' },
  Siblings: { role: 'Peers',             blurb: 'Siblings, close friends, the lateral relationships of your life.' },
};

const KEY_PALACES = ['Ming', 'Marriage', 'Career', 'Wealth', 'Health'];

const LUCK_COLOR = {
  'Most Lucky':        '#2c8a4a',
  'Generally Lucky':   '#3a7bb8',
  'Mixed Luck':        '#b88c4f',
  'Generally Unlucky': '#c0392b',
  'Least Lucky':       '#a01b0b',
};

function calculateAge(birthday) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--;
  return age;
}

function findCurrentDecadePalace(palaces, age) {
  if (age == null) return null;
  return palaces.find((p) => p.decade && age >= p.decade[0] && age <= p.decade[1]) || null;
}

export default function PurpleStarReading() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, birthday, birth_time, gender')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  const chart = profile?.birthday && profile?.birth_time
    ? calculatePurpleStar({
        birthday: profile.birthday,
        birthTime: profile.birth_time,
        gender: profile.gender,
      })
    : null;

  const age = profile?.birthday ? calculateAge(profile.birthday) : null;
  const currentDecade = chart ? findCurrentDecadePalace(chart.palaces, age) : null;
  const mingPalace = chart?.palaces.find((p) => p.isMing) || null;
  const bodyPalace = chart?.palaces.find((p) => p.isBody) || null;
  const palaceByName = (n) => chart?.palaces.find((p) => p.name === n) || null;
  const outlook = chart ? computePalaceOutlook(chart) : null;
  const outlookByName = (n) => outlook?.palaces.find((p) => p.name === n) || null;

  return (
    <>
      <Head>
        <title>Purple Star Reading | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
      <main className={`container ${accountStyles.wrap}`}>
        <p className={accountStyles.authFootnote} style={{ marginBottom: '0.5rem', textAlign: 'left' }}>
          <Link href="/member/dashboard/readings">← Saved readings</Link>
        </p>

        <h1 className={accountStyles.title}>Purple Star · Zi Wei Dou Shu</h1>

        {loaded && !chart && (
          <div className={accountStyles.placeholder} style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0 }}>
              {!profile?.birthday
                ? <>Add your birthday to your <Link href="/member/profile">profile</Link> to unlock this reading.</>
                : <>Purple Star needs your <strong>birth time</strong>. Add it to your <Link href="/member/profile">profile</Link> to generate the chart.</>
              }
            </p>
          </div>
        )}

        {chart && (
          <>
            {/* Hero */}
            <section style={{ marginTop: '1rem' }}>
              <p className={accountStyles.lede}>
                The 12-palace map of your life themes, derived from your birth moment in the lunar calendar.
                Read this as a portrait, not a prediction, the palaces show <em>where</em> your energy concentrates.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                <div className={accountStyles.compatCard}>
                  <p className={accountStyles.muted} style={{ margin: 0 }}>Soul Star</p>
                  <p style={{ margin: '0.3rem 0 0 0', fontFamily: "var(--serif)", fontSize: '1.5rem' }}>
                    {chart.soulStar || '–'}
                  </p>
                </div>
                <div className={accountStyles.compatCard}>
                  <p className={accountStyles.muted} style={{ margin: 0 }}>Body Star</p>
                  <p style={{ margin: '0.3rem 0 0 0', fontFamily: "var(--serif)", fontSize: '1.5rem' }}>
                    {chart.bodyStar || '–'}
                  </p>
                </div>
                <div className={accountStyles.compatCard}>
                  <p className={accountStyles.muted} style={{ margin: 0 }}>Five Elements Class</p>
                  <p style={{ margin: '0.3rem 0 0 0', fontFamily: "var(--serif)", fontSize: '1.5rem' }}>
                    {chart.fiveElementsClass || '–'}
                  </p>
                </div>
                <div className={accountStyles.compatCard}>
                  <p className={accountStyles.muted} style={{ margin: 0 }}>Sign</p>
                  <p style={{ margin: '0.3rem 0 0 0', fontFamily: "var(--serif)", fontSize: '1.5rem' }}>
                    {chart.zodiac || chart.sign || '–'}
                  </p>
                </div>
              </div>
            </section>

            {/* Ming + Body summary */}
            {(mingPalace || bodyPalace) && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className={accountStyles.subTitle}>Ming &amp; Body</h2>
                <div className={accountStyles.compatGrid}>
                  {mingPalace && (
                    <div className={accountStyles.compatCard}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>Ming · {mingPalace.animal} {mingPalace.branchHan}</h3>
                      <p className={accountStyles.muted} style={{ margin: 0 }}>{PALACE_MEANINGS.Ming.blurb}</p>
                      {mingPalace.majorStars.length > 0 && (
                        <p style={{ marginTop: '0.75rem' }}>
                          <strong>Major stars:</strong>{' '}
                          {mingPalace.majorStars.map((s) => s.name).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                  {bodyPalace && bodyPalace !== mingPalace && (
                    <div className={accountStyles.compatCard}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>Body · {bodyPalace.animal} {bodyPalace.branchHan}</h3>
                      <p className={accountStyles.muted} style={{ margin: 0 }}>{PALACE_MEANINGS.Body.blurb}</p>
                      <p style={{ marginTop: '0.75rem' }}>
                        Lives in your <strong>{bodyPalace.name}</strong> palace, that&apos;s where destiny tends to enact itself in your life.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Current decade */}
            {currentDecade && age != null && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className={accountStyles.subTitle}>Your current decade · age {age}</h2>
                <div className={accountStyles.compatCard}>
                  <p style={{ margin: 0 }}>
                    You&apos;re currently in the <strong>{currentDecade.name}</strong> palace decade
                    {currentDecade.decade && (
                      <> ({currentDecade.decade[0]}–{currentDecade.decade[1]})</>
                    )}.
                  </p>
                  {PALACE_MEANINGS[currentDecade.name] && (
                    <p className={accountStyles.muted} style={{ marginTop: '0.5rem' }}>
                      Theme: <strong>{PALACE_MEANINGS[currentDecade.name].role}</strong>, {PALACE_MEANINGS[currentDecade.name].blurb}
                    </p>
                  )}
                  {currentDecade.majorStars.length > 0 && (
                    <p style={{ marginTop: '0.5rem' }}>
                      Stars at work this decade: {currentDecade.majorStars.map((s) => s.name).join(', ')}.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Full chart */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 className={accountStyles.subTitle}>The 12-palace chart</h2>
              <PurpleStarChart chart={chart} name={profile?.name} />
            </section>

            {/* Luck outlook — Bill's authored palace narratives */}
            {outlook && (outlook.luckiest || outlook.unluckiest) && (
              <section style={{ marginTop: '2.5rem' }}>
                <h2 className={accountStyles.subTitle}>Where your luck concentrates</h2>
                <p className={accountStyles.lede} style={{ marginTop: '0.5rem' }}>
                  Read this as a forecast, not a verdict, the palaces show where fortune leans,
                  what you do with it is still yours.
                </p>
                <div className={accountStyles.compatGrid} style={{ marginTop: '1rem' }}>
                  {outlook.luckiest && (
                    <div className={accountStyles.compatCard}>
                      <p className={accountStyles.muted} style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>Your luckiest palace</p>
                      <h3 style={{ margin: '0.3rem 0 0.5rem 0' }}>
                        {outlook.luckiest.name}
                        {PALACE_MEANINGS[outlook.luckiest.name] && (
                          <span className={accountStyles.muted} style={{ fontWeight: 400 }}> · {PALACE_MEANINGS[outlook.luckiest.name].role}</span>
                        )}
                      </h3>
                      <p style={{ margin: 0 }}>{outlook.luckiest.extremeNarrative}</p>
                    </div>
                  )}
                  {outlook.unluckiest && (
                    <div className={accountStyles.compatCard}>
                      <p className={accountStyles.muted} style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.06em' }}>Your most challenging palace</p>
                      <h3 style={{ margin: '0.3rem 0 0.5rem 0' }}>
                        {outlook.unluckiest.name}
                        {PALACE_MEANINGS[outlook.unluckiest.name] && (
                          <span className={accountStyles.muted} style={{ fontWeight: 400 }}> · {PALACE_MEANINGS[outlook.unluckiest.name].role}</span>
                        )}
                      </h3>
                      <p style={{ margin: 0 }}>{outlook.unluckiest.extremeNarrative}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Key palaces */}
            <section style={{ marginTop: '2.5rem' }}>
              <h2 className={accountStyles.subTitle}>Key palaces in your life</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {KEY_PALACES.map((name) => {
                  const p = palaceByName(name);
                  const meaning = PALACE_MEANINGS[name];
                  const o = outlookByName(name);
                  if (!p || !meaning) return null;
                  return (
                    <div key={name} className={accountStyles.compatCard}>
                      <h3 style={{ margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span>{name} · {meaning.role}</span>
                        {o && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff', background: LUCK_COLOR[o.label] || '#6b6258', borderRadius: '999px', padding: '0.12rem 0.55rem' }}>
                            {o.label}
                          </span>
                        )}
                        <span className={accountStyles.muted} style={{ fontWeight: 400 }}>{p.animal} {p.branchHan}</span>
                      </h3>
                      {o ? (
                        <p style={{ margin: '0 0 0.5rem 0' }}>{o.narrative}</p>
                      ) : (
                        <p className={accountStyles.muted} style={{ margin: '0 0 0.5rem 0' }}>{meaning.blurb}</p>
                      )}
                      {p.majorStars.length > 0 ? (
                        <p className={accountStyles.muted} style={{ margin: 0, fontSize: '0.9rem' }}>
                          <strong>Major stars:</strong> {p.majorStars.map((s) => s.name + (s.mutagen ? ` (${s.mutagen})` : '')).join(', ')}
                        </p>
                      ) : (
                        <p className={accountStyles.muted} style={{ margin: 0, fontSize: '0.9rem' }}>
                          No major stars here, read from the opposite palace and supporting stars.
                        </p>
                      )}
                      {p.minorStars.length > 0 && (
                        <p className={accountStyles.muted} style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem' }}>
                          <strong>Minor:</strong> {p.minorStars.slice(0, 4).map((s) => s.name).join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <p className={accountStyles.authFootnote} style={{ marginTop: '2.5rem' }}>
              Want a deeper read of a specific palace? <Link href="/readings#book">Book a session with Bill</Link>.
            </p>
          </>
        )}
      </main>
      <Footer />
      </MemberShell>
    </>
  );
}
