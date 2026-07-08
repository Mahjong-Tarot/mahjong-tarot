import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MemberShell from '../../../components/MemberShell';
import Footer from '../../../components/Footer';
import ThreeBlessingsReportView from '../../../components/ThreeBlessingsReportView';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import { buildFourPillarsChart } from '../../../lib/fp/chart.mjs';
import { computeThreeBlessings } from '../../../lib/tb/engine.mjs';
import { tables } from '../../../lib/tb/data.mjs';
import account from '../../../styles/Account.module.css';

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
        .select('name, birthday, birth_time')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setProfile(data);
      setProfileLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const reading = useMemo(() => {
    if (!profile?.birthday) return null;
    try {
      const chart = buildFourPillarsChart({ birthday: profile.birthday, birthTime: profile.birth_time });
      return computeThreeBlessings(chart, tables, profile.birthday);
    } catch (_) {
      return null;
    }
  }, [profile?.birthday, profile?.birth_time]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Your Three Blessings | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
        <main className={`container ${account.wrap}`}>
          <p className={account.authFootnote} style={{ marginBottom: '0.5rem' }}>
            <Link href="/member/dashboard">← Dashboard</Link>
          </p>

          <h1 className={account.title}>Your Three Blessings</h1>
          <p className={account.lede}>
            Phúc, Lộc, Thọ. Happiness, Prosperity, Longevity, the Fu Lu Shou. Each blessing is
            weighed across ten indicators drawn from your Four Pillars: your elements, your
            animal signs, and the chi of your life stages. Here is how fate has dealt each one.
          </p>

          {profileLoaded && !profile?.birthday && (
            <div className={account.placeholder} style={{ marginTop: '1.5rem' }}>
              <p style={{ margin: 0 }}>
                Add your birth data on your <Link href="/member/profile">profile</Link> to see your reading.
              </p>
            </div>
          )}

          <ThreeBlessingsReportView reading={reading} />

          <p className={account.authFootnote} style={{ marginTop: '2.5rem' }}>
            <Link href="/member/dashboard">← Back to dashboard</Link>
          </p>
        </main>
        <Footer />
      </MemberShell>
    </>
  );
}
