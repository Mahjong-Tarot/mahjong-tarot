import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminShell from '../../components/AdminShell';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import adminStyles from '../../styles/PortalAdmin.module.css';
import styles from '../../styles/PortalConversions.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

// Source filter — what kind of sale to surface. All read from
// public.deals (the canonical money record).
const SOURCE_FILTERS = [
  { id: 'all',              label: 'All' },
  { id: 'private_readings', label: 'Private readings' },
  { id: 'subscriptions',    label: 'Subscriptions' },
  { id: 'books',            label: 'Books' },
];

function kindOf(d) {
  if (d.booking_id) return 'reading';
  if (d.member_subscription_id) return 'subscription';
  if ((d.notes || '').toLowerCase().startsWith('book order')) return 'book';
  return 'other';
}

export default function SalesPage({ profile }) {
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    let q = supabase
      .from('deals')
      .select('id, amount_cents, currency, won_at, source, notes, person_id, booking_id, member_subscription_id, status, people(name, email)')
      .eq('status', 'won')
      .order('won_at', { ascending: false });
    if (sourceFilter === 'books')            q = q.ilike('notes', 'Book order%');
    if (sourceFilter === 'subscriptions')    q = q.not('member_subscription_id', 'is', null);
    if (sourceFilter === 'private_readings') q = q.not('booking_id', 'is', null);
    q.then(({ data, error: e }) => {
      if (e) setError(e.message);
      else   setDeals(data ?? []);
      setLoading(false);
    });
  }, [sourceFilter]);

  const totalCents = deals.reduce((s, d) => s + (d.amount_cents || 0), 0);

  return (
    <>
      <Head>
        <title>Sales | Mahjong Tarot Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
        <p className={adminStyles.pageEyebrow}>Admin</p>
        <h1 className={adminStyles.pageTitle}>Sales</h1>
        <p className={adminStyles.pageLede}>
          Every won deal — Stripe, manual, all sources. One row per sale.
        </p>

        <div className={styles.controls}>
          <div className={styles.chipRow} role="tablist" aria-label="Source">
            {SOURCE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={sourceFilter === f.id}
                className={sourceFilter === f.id ? styles.chipActive : styles.chip}
                onClick={() => setSourceFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.count}>
          {loading
            ? 'Loading…'
            : `${deals.length} deal${deals.length === 1 ? '' : 's'} · $${(totalCents / 100).toFixed(2)} total`}
        </p>

        {!loading && deals.length === 0 && (
          <p className={adminStyles.muted}>No sales in this view yet.</p>
        )}

        {!loading && deals.length > 0 && (
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Won</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Amount</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => {
                const customerLabel = d.people?.name || d.people?.email || '—';
                const href = d.booking_id ? `/admin/private-readings/${d.booking_id}` : null;
                return (
                  <tr
                    key={d.id}
                    onClick={href ? () => router.push(href) : undefined}
                    style={href ? { cursor: 'pointer' } : undefined}
                  >
                    <td>{d.won_at ? new Date(d.won_at).toLocaleDateString() : '—'}</td>
                    <td>{customerLabel}</td>
                    <td>{kindOf(d)}</td>
                    <td>{d.notes || '—'}</td>
                    <td>${((d.amount_cents ?? 0) / 100).toFixed(2)} {(d.currency || 'usd').toUpperCase()}</td>
                    <td>{d.source}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </AdminShell>
    </>
  );
}
