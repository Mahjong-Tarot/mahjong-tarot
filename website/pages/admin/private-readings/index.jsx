import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminShell from '../../../components/AdminShell';
import { supabase } from '../../../lib/supabase';
import { requireStaff } from '../../../lib/requireStaff';
import adminStyles from '../../../styles/PortalAdmin.module.css';
import tableStyles from '../../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requireStaff(ctx);
}

const DATE_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const STATUS_LABEL = {
  pending_payment: 'Pending payment',
  paid:            'Paid',
  scheduled:       'Scheduled',
  completed:       'Completed',
  cancelled:       'Cancelled',
  refunded:        'Refunded',
};

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past',     label: 'Past' },
];

export default function PrivateReadingsListPage({ profile }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [tab, setTab]         = useState('upcoming');

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    supabase
      .from('bookings')
      .select('id, full_name, email, scheduled_at, duration_minutes, status, amount_cents, currency, astrologer_id, created_at')
      .order('scheduled_at', { ascending: false, nullsFirst: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const u = [];
    const p = [];
    for (const r of rows) {
      const t = r.scheduled_at ? new Date(r.scheduled_at).getTime() : null;
      const isPast =
        r.status === 'completed' ||
        r.status === 'cancelled' ||
        r.status === 'refunded' ||
        (t !== null && t < now);
      (isPast ? p : u).push(r);
    }
    u.sort((a, b) => (new Date(a.scheduled_at || 0) - new Date(b.scheduled_at || 0)));
    return { upcoming: u, past: p };
  }, [rows, now]);

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <Head>
        <title>Private readings | Mahjong Tarot Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <p className={adminStyles.pageEyebrow}>Admin</p>
        <h1 className={adminStyles.pageTitle}>Private readings</h1>
        <p className={adminStyles.pageLede}>
          Paid bookings — yours when you&apos;re signed in as an astrologer,
          everyone&apos;s when you&apos;re an admin.
        </p>

        {error && <p className="error-block">{error}</p>}

        <div className={tableStyles.controlsRow}>
          <div className={tableStyles.chipRow}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? tableStyles.chipActive : tableStyles.chip}
                onClick={() => setTab(t.id)}
              >
                {t.label}{' '}
                <span style={{ opacity: 0.6, marginLeft: 6 }}>
                  {t.id === 'upcoming' ? upcoming.length : past.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading && <p className={adminStyles.muted}>Loading…</p>}

        {!loading && list.length === 0 && (
          <p className={adminStyles.muted}>No {tab} readings yet.</p>
        )}

        {!loading && list.length > 0 && (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>When</th>
                  <th>Length</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/private-readings/${r.id}`} style={{ fontWeight: 500, textDecoration: 'none', color: 'inherit' }}>
                        {r.full_name || '—'}
                      </Link>
                      {r.email && <div className={tableStyles.muted}>{r.email}</div>}
                    </td>
                    <td>
                      {r.scheduled_at
                        ? DATE_FMT.format(new Date(r.scheduled_at))
                        : <span className={tableStyles.muted}>unscheduled</span>}
                    </td>
                    <td>{r.duration_minutes ? `${r.duration_minutes} min` : '—'}</td>
                    <td>
                      {typeof r.amount_cents === 'number'
                        ? `$${(r.amount_cents / 100).toFixed(2)}`
                        : '—'}
                    </td>
                    <td>{STATUS_LABEL[r.status] || r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </AdminShell>
    </>
  );
}
