import { useEffect, useState } from 'react';
import Head from 'next/head';
import PortalNav from '../../components/PortalNav';
import SessionsList from '../../components/SessionsList';
import SessionsCalendar from '../../components/SessionsCalendar';
import { supabase } from '../../lib/supabase';
import { requirePortalUser } from '../../lib/requirePortalUser';
import { listSessionsWithClient } from '../../lib/sessions';
import portalStyles from '../../styles/Portal.module.css';
import homeStyles from '../../styles/PortalHome.module.css';

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
    setLoading(true);
    setError('');
    listSessionsWithClient(supabase, { range })
      .then((rows) => setSessions(rows))
      .catch((err) => setError(err.message || 'Failed to load sessions.'))
      .finally(() => setLoading(false));
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

      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />

        <main className={portalStyles.main}>
          <p className={portalStyles.eyebrow}>{roleLabel} · Sessions</p>
          <h1 className={portalStyles.h1}>{greeting}</h1>
          <p className={portalStyles.lede}>
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

          {error && <p className={portalStyles.error}>{error}</p>}

          {loading ? (
            <p className={portalStyles.muted}>Loading sessions…</p>
          ) : view === 'calendar' ? (
            <SessionsCalendar sessions={sessions} />
          ) : (
            <SessionsList sessions={sessions} emptyMessage={emptyMessage} />
          )}
        </main>
      </div>
    </>
  );
}
