import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import MemberNav from '../../components/MemberNav';
import Footer from '../../components/Footer';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { computeThreeBlessings } from '../../lib/three-blessings';
import styles from '../../styles/ThreeBlessingsReport.module.css';
import account from '../../styles/Account.module.css';

const ORDER = ['phuc', 'loc', 'tho'];
const ORNAMENTS = { phuc: '福', loc: '禄', tho: '寿' };

export default function ThreeBlessingsReport() {
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

  const reading = profile?.birthday
    ? computeThreeBlessings({
        birthday: profile.birthday,
        birthTime: profile.birth_time,
        pillars: profile.pillars,
      })
    : null;

  const displayName = profile?.name || user.email?.split('@')[0] || 'You';

  return (
    <>
      <Head>
        <title>Your Three Blessings | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <MemberNav />
      <main className={`container ${account.wrap}`}>
        <p className={account.authFootnote} style={{ marginBottom: '0.5rem' }}>
          <Link href="/dashboard">← Dashboard</Link>
        </p>

        <h1 className={account.title}>Your Three Blessings</h1>
        <p className={account.lede}>
          Phuc, Loc, Tho, Happiness, Prosperity, Longevity. The three pillars of
          Vietnamese and Chinese aspiration, each carried by a sacred dragon. The
          full pattern is the rarest reading in the deck. Yours, derived from your
          birth chart, is a personal expression of all three.
        </p>

        {profileLoaded && !profile?.birthday && (
          <div className={account.placeholder} style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0 }}>
              Add your birth data on your <Link href="/profile">profile</Link> to see your reading.
            </p>
          </div>
        )}

        {reading && (
          <>
            <div className={styles.triangle}>
              {ORDER.map((key) => {
                const b = reading[key];
                if (!b) return null;
                const { position, card } = b;
                return (
                  <div key={key} className={styles.tileCol}>
                    <span className={styles.ornament} aria-hidden="true">{ORNAMENTS[key]}</span>
                    <span className={styles.position}>
                      Position {position.order} · {position.name}
                    </span>
                    <span className={styles.positionLabel}>{position.label}</span>
                    <div className={styles.tileImage}>
                      <Image
                        src={`/images/cards/${card?.slug}.webp`}
                        alt={card?.name || ''}
                        width={300}
                        height={400}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <h3 className={styles.cardName}>{card?.name}</h3>
                    <p className={styles.cardShort}>{card?.short}</p>
                  </div>
                );
              })}
            </div>

            <div className={styles.report}>
              {ORDER.map((key) => {
                const b = reading[key];
                if (!b) return null;
                const { position, card, sourceLabel, personalLine } = b;
                return (
                  <section key={key} className={styles.section}>
                    <header className={styles.sectionHeader}>
                      <span className={styles.sectionOrnament}>{ORNAMENTS[key]}</span>
                      <div>
                        <h2 className={styles.sectionTitle}>
                          {position.name}, {position.label}
                        </h2>
                        <p className={styles.sectionSource}>
                          From your {sourceLabel} · drawn as <strong>{card?.name}</strong>
                        </p>
                      </div>
                    </header>

                    <p className={styles.bodyPara}>{position.description}</p>

                    {personalLine && (
                      <p className={styles.personalLine}>{personalLine}</p>
                    )}

                    {card?.summary && (
                      <p className={styles.bodyPara}>
                        <strong>{card.name}.</strong> {card.summary}
                      </p>
                    )}

                    {card?.reading && (
                      <blockquote className={styles.quote}>{card.reading}</blockquote>
                    )}
                  </section>
                );
              })}

              <section className={styles.legend}>
                <h2 className={styles.sectionTitle}>The reading behind your reading</h2>
                <p>
                  In nearly four decades of practice, the full Three Blessings, Green
                  Dragon at Phuc, Red Dragon at Loc, White Dragon at Tho, has never
                  been witnessed in a complete spread. The legend holds that the
                  pattern appears once in roughly 140,000 readings, reserved for a
                  soul whose time has truly come.
                </p>
                <p>
                  What you hold here, {displayName}, is not the legendary trio. It is
                  something more useful, your personal pattern of blessing,
                  prosperity, and legacy, drawn from the year you arrived, the day
                  you were born, and the elemental balance you carry.
                </p>
                <p>
                  Read it as a map, not a guarantee. The blessing is not in the
                  outcome. It is in seeing clearly the shape your good fortune
                  already takes.
                </p>
              </section>
            </div>
          </>
        )}

        <p className={account.authFootnote} style={{ marginTop: '2.5rem' }}>
          <Link href="/dashboard">← Back to dashboard</Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
