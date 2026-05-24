import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import SalesDetailDrawer from '../../components/SalesDetailDrawer';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import adminStyles from '../../styles/PortalAdmin.module.css';
import styles from '../../styles/PortalAdminTable.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

function kindOf(d) {
  if (d.booking_id) return 'reading';
  if (d.member_subscription_id) return 'subscription';
  if ((d.notes || '').toLowerCase().startsWith('book order')) return 'book';
  return 'other';
}

function fmtMoney(cents) {
  return `$${((cents ?? 0) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function SalesPage({ profile }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    supabase
      .from('deals')
      .select('id, amount_cents, currency, won_at, source, notes, person_id, booking_id, member_subscription_id, status, stripe_payment_intent_id, people(name, email)')
      .eq('status', 'won')
      .order('won_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else   setDeals(data ?? []);
        setLoading(false);
      });
  }, []);

  // Bucket totals for the stat cards. One pass over the deals list.
  const totals = deals.reduce(
    (acc, d) => {
      const cents = d.amount_cents || 0;
      acc.total.cents += cents;
      acc.total.count += 1;
      const k = kindOf(d);
      if (k === 'subscription') {
        acc.subscription.cents += cents;
        acc.subscription.count += 1;
      } else if (k === 'book') {
        acc.book.cents += cents;
        acc.book.count += 1;
      } else if (k === 'reading') {
        acc.reading.cents += cents;
        acc.reading.count += 1;
      }
      return acc;
    },
    {
      total:        { cents: 0, count: 0 },
      subscription: { cents: 0, count: 0 },
      book:         { cents: 0, count: 0 },
      reading:      { cents: 0, count: 0 },
    },
  );

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

        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <div className={adminStyles.statRow}>
            <div className={adminStyles.statCard}>
              <p className={adminStyles.statLabel}>Total Sales</p>
              <p className={adminStyles.statValue}>{fmtMoney(totals.total.cents)}</p>
              <p className={adminStyles.statHint}>
                {totals.total.count} sale{totals.total.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className={adminStyles.statCard}>
              <p className={adminStyles.statLabel}>Premium Subscription</p>
              <p className={adminStyles.statValue}>{fmtMoney(totals.subscription.cents)}</p>
              <p className={adminStyles.statHint}>
                {totals.subscription.count} sale{totals.subscription.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className={adminStyles.statCard}>
              <p className={adminStyles.statLabel}>Book</p>
              <p className={adminStyles.statValue}>{fmtMoney(totals.book.cents)}</p>
              <p className={adminStyles.statHint}>
                {totals.book.count} sale{totals.book.count === 1 ? '' : 's'}
              </p>
            </div>
            <div className={adminStyles.statCard}>
              <p className={adminStyles.statLabel}>Private Readings</p>
              <p className={adminStyles.statValue}>{fmtMoney(totals.reading.cents)}</p>
              <p className={adminStyles.statHint}>
                {totals.reading.count} sale{totals.reading.count === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        )}

        {loading && <p className={adminStyles.muted}>Loading…</p>}

        {!loading && deals.length === 0 && (
          <p className={adminStyles.muted}>No sales yet.</p>
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
                return (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDeal(d)}
                    style={{ cursor: 'pointer' }}
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

        <SalesDetailDrawer
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onRefunded={(dealId) => {
            // Update local row state so the badge flips immediately.
            // The next filter pass will drop refunded rows naturally
            // because the query is .eq('status', 'won').
            setDeals((prev) =>
              prev.map((d) =>
                d.id === dealId ? { ...d, status: 'refunded' } : d,
              ),
            );
            setSelectedDeal((curr) =>
              curr && curr.id === dealId ? { ...curr, status: 'refunded' } : curr,
            );
          }}
        />
      </AdminShell>
    </>
  );
}
