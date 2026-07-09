import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import FireHorseResult from '../../../../components/FireHorseResult';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import { calculatePillars, STEMS } from '../../../../lib/bazi';
import { computeFireHorseForecast } from '../../../../lib/fire-horse-forecast';
import { BAND_FOR } from '../../../../lib/fire-horse';
import dmScores from '../../../../data/fire-horse/day-master-scores.json';
import account from '../../../../styles/Account.module.css';

export default function FireHorseReading() {
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
        .select('name, birthday, birth_time')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data);
      setProfileLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const forecast = useMemo(() => {
    if (!profile?.birthday) return null;
    try {
      const pillars = calculatePillars(profile.birthday, profile.birth_time || null);
      const composed = computeFireHorseForecast(pillars);
      if (!composed) return null;
      const dayMasterStem = pillars.day?.gan ? STEMS[pillars.day.gan] : null;
      const dayMasterEntry = dayMasterStem
        ? dmScores.find((d) => d.stem === dayMasterStem.en)
        : null;
      return { composed, dayMasterStem, dayMasterEntry };
    } catch (_) {
      return null;
    }
  }, [profile?.birthday, profile?.birth_time]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Year of the Fire Horse | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
        <main>
          <div className={`container ${account.wrap}`}>
            <p className={account.breadcrumb}>
              <Link href="/member/dashboard/readings">← Readings</Link>
            </p>

            <h1 className={account.title}>Year of the Fire Horse</h1>
            <p className={account.lede}>
              2026 is the rarest and most polarized year in the 60-year cycle: double fire,
              all or nothing. This forecast reads the year against your sign, your birth
              element, and your Day Master.
            </p>

            {profileLoaded && !profile?.birthday && (
              <div className={account.placeholder} style={{ marginTop: '1.5rem' }}>
                <p style={{ margin: 0 }}>
                  Add your birth data on your <Link href="/member/profile">profile</Link> to see your forecast.
                </p>
              </div>
            )}
          </div>

          {forecast && (
            <FireHorseResult
              composed={forecast.composed}
              yearBand={BAND_FOR(forecast.composed.yearScore)}
              sign={forecast.composed.sign}
              effectiveElement={forecast.composed.effectiveElement}
              dayMasterStem={forecast.dayMasterStem}
              dayMasterEntry={forecast.dayMasterEntry}
            />
          )}

          <div className="container" style={{ paddingBottom: '2rem' }}>
            <p className={account.authFootnote} style={{ marginTop: '2rem' }}>
              <Link href="/year-of-the-fire-horse">Read the full Fire Horse story →</Link>
              {' '}· <Link href="/member/dashboard">← Back to dashboard</Link>
            </p>
          </div>
        </main>
        <Footer />
      </MemberShell>
    </>
  );
}
