import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../../components/AdminShell';
import SessionsList from '../../../components/SessionsList';
import SessionsCalendar from '../../../components/SessionsCalendar';
import { supabase } from '../../../lib/supabase';
import { requirePortalUser } from '../../../lib/requirePortalUser';
import { listSessionsWithClient } from '../../../lib/sessions';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import homeStyles from '../../../styles/PortalHome.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

const ROLE_LABEL = {
  astrologer: 'Astrologer',
  admin: 'Operator',
};

const RANGES = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past',     label: 'Past' },
];

const VIEWS = [
  { id: 'list',     label: 'List' },
  { id: 'calendar', label: 'Calendar' },
];

export default function PortalHome({ profile }) {
  const firstName = profile?.name?.split(' ')[0];
  const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome back';
  const roleLabel = ROLE_LABEL[profile?.role] || 'Portal';

  const [range, setRange] = useState('upcoming');
  const [view, setView] = useState('list');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }

    // Stale-promise guard: if the user toggles the range tab fast,
    // ignore older in-flight results so we never commit them to state
    // and never leave loading stuck on a result that arrived out of
    // order.
    let cancelled = false;
    setLoading(true);
    setError('');

    // Watchdog: if the request doesn't return in 15s, surface an
    // error so the UI never hangs forever. This guards against the
    // navigator.locks deadlock the Supabase browser client can hit
    // when a previous tab / request held the auth lock.
    const watchdog = setTimeout(() => {
      if (cancelled) return;
      // eslint-disable-next-line no-console
      console.error('[portal] sessions query timed out after 15s', { range });
      setError('Loading is taking longer than expected. Try refreshing the page.');
      setLoading(false);
    }, 15000);

    listSessionsWithClient(supabase, { range })
      .then((rows) => {
        if (cancelled) return;
        setSessions(rows);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('[portal] sessions query failed', { range, err });
        setError(err?.message || 'Failed to load sessions.');
      })
      .finally(() => {
        if (cancelled) return;
        clearTimeout(watchdog);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
    };
  }, [range]);

  const emptyMessage = range === 'upcoming'
    ? 'No upcoming sessions scheduled.'
    : 'No past sessions on record.';

  return (
    <>
      <Head>
        <title>Portal | Mahjong Tarot</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <p className={adminStyles.pageEyebrow}>{roleLabel} · Sessions</p>
          <h1 className={adminStyles.pageTitle}>{greeting}</h1>
          <p className={adminStyles.pageLede}>
            All sessions, grouped by week. Switch to calendar view for a month overview.
          </p>

          <div className={homeStyles.controls}>
            <div className={homeStyles.tabs} role="tablist" aria-label="Session range">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={range === r.id}
                  className={range === r.id ? homeStyles.tabActive : homeStyles.tab}
                  onClick={() => setRange(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className={homeStyles.toggle} role="tablist" aria-label="View mode">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={view === v.id}
                  className={view === v.id ? homeStyles.toggleActive : homeStyles.toggleBtn}
                  onClick={() => setView(v.id)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={adminStyles.error}>{error}</p>}

          {loading ? (
            <p className={adminStyles.muted}>Loading sessions…</p>
          ) : view === 'calendar' ? (
            <SessionsCalendar sessions={sessions} />
          ) : (
            <SessionsList sessions={sessions} emptyMessage={emptyMessage} />
          )}
      </AdminShell>
    </>
  );
}
