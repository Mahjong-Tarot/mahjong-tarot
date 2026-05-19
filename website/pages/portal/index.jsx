import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import PortalNav from '../../components/PortalNav';
import { supabase } from '../../lib/supabase';
import { requirePortalUser } from '../../lib/requirePortalUser';
import { listUpcomingSessions } from '../../lib/sessions';
import portalStyles from '../../styles/Portal.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

const ROLE_LABEL = {
  astrologer: 'Astrologer',
  admin: 'Operator',
};

const SUB_LABEL = {
  none: 'Not subscribed',
  active: 'Subscribed',
  lapsed: 'Lapsed',
  cancelled: 'Cancelled',
};

const SUB_CLASS = {
  none: 'subNone',
  active: 'subActive',
  lapsed: 'subLapsed',
  cancelled: 'subCancelled',
};

function formatWhen(iso) {
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  const dayStr = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
  const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${dayStr} · ${timeStr}`;
}

function relativeDay(iso) {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (date) => {
    const x = new Date(date);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const days = Math.round((startOfDay(d) - startOfDay(now)) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1 && days < 7) return `In ${days} days`;
  if (days >= 7) return `In ${Math.round(days / 7)} week${days >= 14 ? 's' : ''}`;
  return null;
}

function ageFromBirthday(birthday) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export default function PortalHome({ profile }) {
  const firstName = profile?.name?.split(' ')[0];
  const greeting = firstName ? `Welcome back, ${firstName}` : 'Welcome back';
  const roleLabel = ROLE_LABEL[profile?.role] || 'Portal';

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterUnsubscribed, setFilterUnsubscribed] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    listUpcomingSessions(supabase, { withinDays: 14 })
      .then((rows) => setSessions(rows))
      .catch((err) => setError(err.message || 'Failed to load upcoming sessions.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!filterUnsubscribed) return sessions;
    return sessions.filter((s) => s.client?.subscription_status !== 'active');
  }, [sessions, filterUnsubscribed]);

  const unsubscribedCount = useMemo(
    () => sessions.filter((s) => s.client?.subscription_status !== 'active').length,
    [sessions],
  );

  return (
    <>
      <Head>
        <title>Portal | Mahjong Tarot</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={portalStyles.shell}>
        <PortalNav profile={profile} />

        <main className={portalStyles.main}>
          <p className={portalStyles.eyebrow}>{roleLabel} · Portal home</p>
          <h1 className={portalStyles.h1}>{greeting}</h1>
          <p className={portalStyles.lede}>
            Upcoming sessions in the next two weeks. Tap a card for prep notes,
            birth info, and history.
          </p>

          <div className={portalStyles.toolbar}>
            <div className={portalStyles.chips}>
              <button
                type="button"
                className={filterUnsubscribed ? portalStyles.chipActive : portalStyles.chip}
                onClick={() => setFilterUnsubscribed((v) => !v)}
                aria-pressed={filterUnsubscribed}
              >
                Not yet subscribed
                {unsubscribedCount > 0 && (
                  <span className={portalStyles.chipCount}>{unsubscribedCount}</span>
                )}
              </button>
            </div>
            <span className={portalStyles.toolbarCount}>
              {loading ? '…' : `${filtered.length} session${filtered.length === 1 ? '' : 's'}`}
            </span>
          </div>

          {error && <p className={portalStyles.error}>{error}</p>}

          {loading ? (
            <p className={portalStyles.muted}>Loading upcoming sessions…</p>
          ) : sessions.length === 0 ? (
            <div className={portalStyles.empty}>
              <h2 className={portalStyles.emptyHeading}>No sessions in the next two weeks.</h2>
              <p className={portalStyles.emptyBody}>
                Once you schedule readings they will appear here, oldest first.
              </p>
              <Link href="/portal/clients" className={portalStyles.emptyAction}>
                Browse clients →
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className={portalStyles.empty}>
              <p className={portalStyles.emptyBody}>
                All upcoming clients in the next two weeks are already subscribed.
              </p>
            </div>
          ) : (
            <ul className={portalStyles.sessionList}>
              {filtered.map((s) => {
                const c = s.client || {};
                const age = ageFromBirthday(c.birthday);
                return (
                  <li key={s.id} className={portalStyles.sessionCard}>
                    <Link href={`/portal/clients/${c.id || s.client_id}`} className={portalStyles.sessionLink}>
                      <div className={portalStyles.sessionWhen}>
                        <span className={portalStyles.sessionRel}>{relativeDay(s.scheduled_at)}</span>
                        <span className={portalStyles.sessionTime}>{formatWhen(s.scheduled_at)}</span>
                      </div>
                      <div className={portalStyles.sessionMain}>
                        <h3 className={portalStyles.sessionName}>{c.full_name || 'Unknown client'}</h3>
                        <div className={portalStyles.sessionMeta}>
                          {c.birthday && <span>Born {c.birthday}{age != null ? ` · ${age}` : ''}</span>}
                          {c.birth_place && <span>{c.birth_place}</span>}
                          {c.email && <span>{c.email}</span>}
                          {c.phone && <span>{c.phone}</span>}
                          {s.duration_minutes && <span>{s.duration_minutes} min</span>}
                        </div>
                        {s.prep_notes && (
                          <p className={portalStyles.sessionNotes}>{s.prep_notes}</p>
                        )}
                      </div>
                      <span className={`${portalStyles.badge} ${portalStyles[SUB_CLASS[c.subscription_status]] || ''}`}>
                        {SUB_LABEL[c.subscription_status] || c.subscription_status || 'Unknown'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    </>
  );
}
