import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import { buildFourPillarsChart } from '../../../../lib/fp/chart.mjs';
import { buildFourPillarsReading } from '../../../../lib/fp/engine.mjs';
import { content as fpContent } from '../../../../lib/fp/content.mjs';
import { renderFourPillarsReading } from '../../../../lib/fp/render.mjs';
import account from '../../../../styles/Account.module.css';

export default function FourPillarsReading() {
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

  const readingHtml = useMemo(() => {
    if (!profile?.birthday) return null;
    try {
      const chart = buildFourPillarsChart({ birthday: profile.birthday, birthTime: profile.birth_time });
      const reading = buildFourPillarsReading(chart, fpContent);
      return renderFourPillarsReading(reading, { hideHeading: true, name: profile.name });
    } catch (_) {
      return null;
    }
  }, [profile?.birthday, profile?.birth_time, profile?.name]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Your Four Pillars | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
        <main className={`container ${account.wrap}`}>
          <p className={account.breadcrumb}>
            <Link href="/member/dashboard/readings">← Readings</Link>
          </p>

          <h1 className={account.title}>Your Four Pillars</h1>
          <p className={account.lede}>
            The Four Pillars of Destiny. Your year, month, day, and hour pillars set the
            elements you were dealt at birth, and the life cycle that unfolds from them.
          </p>

          {profileLoaded && !profile?.birthday && (
            <div className={account.placeholder} style={{ marginTop: '1.5rem' }}>
              <p style={{ margin: 0 }}>
                Add your birth data on your <Link href="/member/profile">profile</Link> to see your reading.
              </p>
            </div>
          )}

          {readingHtml && <div dangerouslySetInnerHTML={{ __html: readingHtml }} />}

          <p className={account.authFootnote} style={{ marginTop: '2.5rem' }}>
            <Link href="/member/dashboard">← Back to dashboard</Link>
          </p>
        </main>
        <Footer />
      </MemberShell>
    </>
  );
}
