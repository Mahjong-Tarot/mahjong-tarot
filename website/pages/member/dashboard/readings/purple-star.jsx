import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MemberShell from '../../../../components/MemberShell';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import accountStyles from '../../../../styles/Account.module.css';

import { data } from '../../../../lib/ps/data.mjs';
import { scoreChart, buildFullReport, buildPalaceReading, PALACE_LABEL } from '../../../../lib/ps/engine.mjs';
import { buildChartFromBirth, chineseAge } from '../../../../lib/ps/chart.mjs';
import { renderFullReport, renderPalaceReading } from '../../../../lib/ps/render.mjs';

const PALACE_KEYS = Object.keys(PALACE_LABEL);

// "1972-09-01" -> "1972-9-1" (iztro-friendly); "13:42:00" -> 13
const toSolar = (d) => d.split('-').map(Number).join('-');
const toHour = (t) => (t ? parseInt(String(t).split(':')[0], 10) : null);

export default function PurpleStarReading() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('full'); // 'full' | palaceKey
  const [frameHeight, setFrameHeight] = useState(900);
  const frameRef = useRef(null);

  useEffect(() => { if (!loading && !user) router.replace('/sign-in'); }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data: p } = await supabase
        .from('profiles')
        .select('name, birthday, birth_time, birth_place, gender')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled) { setProfile(p ?? null); setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // auto-resize the report iframe to its content
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data && typeof e.data.psrHeight === 'number') setFrameHeight(e.data.psrHeight + 24);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const hasBirth = profile && profile.birthday && profile.birth_time && profile.gender;

  // Build the chart + every report once, client-side.
  const reports = useMemo(() => {
    if (!hasBirth) return null;
    try {
      const chart = buildChartFromBirth({
        solarDate: toSolar(profile.birthday),
        hour: toHour(profile.birth_time),
        gender: profile.gender === 'F' ? 'female' : 'male',
      }, data);
      chart.name = (profile.name || 'Your').split(' ')[0];
      chart.currentAge = chineseAge(toSolar(profile.birthday));
      scoreChart(chart, data);
      const full = renderFullReport(chart, buildFullReport(chart, data));
      const palaces = {};
      for (const k of PALACE_KEYS) palaces[k] = renderPalaceReading(chart, buildPalaceReading(chart, k, data));
      return { full, palaces };
    } catch (e) {
      return { error: e.message };
    }
  }, [hasBirth, profile]);

  const srcDoc = reports && !reports.error
    ? (view === 'full' ? reports.full : reports.palaces[view])
    : null;

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Purple Star Reading | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <MemberShell>
        <main className={`container ${accountStyles.wrap}`}>
          <p className={accountStyles.breadcrumb}>
            <Link href="/member/dashboard/readings">← Readings</Link>
          </p>
          <h1 className={accountStyles.title}>Purple Star · 紫微斗數</h1>
          <p className={accountStyles.muted}>
            Your Zi Wei Dou Shu reading, generated from your birth chart. Choose your full life reading,
            or focus on a single palace.
          </p>

          {!loaded && <p className={accountStyles.muted}>Loading your chart…</p>}

          {loaded && !hasBirth && (
            <div className={`${accountStyles.compatCard} ${accountStyles.blockGap}`}>
              <h3 className={accountStyles.cardHeadFlush}>We need your birth details</h3>
              <p>Purple Star needs your <strong>date, time, and place of birth</strong> — the hour is essential,
                 because the chart shifts completely from one two-hour period to the next.</p>
              <p><Link href="/member/profile">Add your birth details →</Link></p>
            </div>
          )}

          {reports && reports.error && (
            <div className={`${accountStyles.compatCard} ${accountStyles.blockGap}`}>
              <p>Sorry — we couldn’t generate your chart ({reports.error}). Please double-check your birth details.</p>
            </div>
          )}

          {reports && !reports.error && (
            <>
              <div className={accountStyles.psTabs}>
                <button type="button" onClick={() => setView('full')} className={tabClass(view === 'full')}>
                  Full Fate &amp; Luck Report
                </button>
                <select
                  value={PALACE_KEYS.includes(view) ? view : ''}
                  onChange={(e) => e.target.value && setView(e.target.value)}
                  aria-label="Single palace reading"
                  className={`${tabClass(PALACE_KEYS.includes(view))} ${accountStyles.psTabSelect}`}
                >
                  <option value="">Single Palace Reading…</option>
                  {PALACE_KEYS.map((k) => <option key={k} value={k}>{PALACE_LABEL[k]} Palace</option>)}
                </select>
              </div>

              <iframe
                ref={frameRef}
                title="Purple Star report"
                srcDoc={srcDoc}
                className={accountStyles.psFrame}
                style={{ height: frameHeight }}
              />
            </>
          )}
        </main>
        <Footer />
      </MemberShell>
    </>
  );
}

function tabClass(active) {
  return active ? `${accountStyles.psTab} ${accountStyles.psTabActive}` : accountStyles.psTab;
}
