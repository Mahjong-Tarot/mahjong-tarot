import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import ConversionTable from '../../components/ConversionTable';
import SendNoteModal from '../../components/SendNoteModal';
import { supabase } from '../../lib/supabase';
import { requireAdmin } from '../../lib/requireAdmin';
import { listConversionTargets } from '../../lib/conversions';
import { markSubscription } from '../../lib/clients';
import adminStyles from '../../styles/PortalAdmin.module.css';
import styles from '../../styles/PortalConversions.module.css';

export async function getServerSideProps(ctx) {
  return requireAdmin(ctx);
}

// Top-level source: what kind of sale is being viewed.
const SOURCE_FILTERS = [
  { id: 'all',              label: 'All' },
  { id: 'subscriptions',    label: 'Subscriptions' },
  { id: 'books',            label: 'Books' },
  { id: 'private_readings', label: 'Private readings' },
];

// Sub-filter (only meaningful for subscription/private-reading sources;
// drives the existing client conversion-targets RPC).
const STATUS_FILTERS = [
  { id: 'targets',   label: 'Conversion targets' },
  { id: 'none',      label: 'Not subscribed' },
  { id: 'lapsed',    label: 'Lapsed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'active',    label: 'Subscribed' },
  { id: 'all',       label: 'All customers' },
];

const SORTS = [
  { id: 'warm',         label: 'Warm leads' },
  { id: 'recent',       label: 'Recent activity' },
  { id: 'alphabetical', label: 'A → Z' },
];

export default function SalesPage({ profile }) {
  const [rows, setRows] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('targets');
  const [sort, setSort] = useState('warm');
  const [busyClientId, setBusyClientId] = useState('');
  const [modalClient, setModalClient] = useState(null);
  const [toast, setToast] = useState('');

  const showsClientTable = sourceFilter === 'subscriptions' || sourceFilter === 'private_readings';
  const showsOrdersTable = sourceFilter === 'all' || sourceFilter === 'books';

  async function load() {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (showsClientTable) {
        const data = await listConversionTargets(supabase, { statusFilter, sort });
        setRows(data);
        setOrders([]);
      } else {
        const typeFilter = sourceFilter === 'books' ? 'book' : null;
        let q = supabase
          .from('orders')
          .select('id, type, amount, currency, paid_at, payment_method, product_title, notes, person_id, client_id, session_id, status')
          .eq('status', 'paid')
          .order('paid_at', { ascending: false });
        if (typeFilter) q = q.eq('type', typeFilter);
        const { data, error: e } = await q;
        if (e) throw e;
        setOrders(data ?? []);
        setRows([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load sales.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter, statusFilter, sort]);

  async function handleMarkSubscribed(row) {
    setBusyClientId(row.id);
    try {
      await markSubscription(supabase, row.id, 'active');
      setToast(`${row.full_name} marked as subscribed.`);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update subscription.');
    } finally {
      setBusyClientId('');
    }
  }

  function handleSendNote(row) {
    setModalClient(row);
  }

  function handleNoteSent({ client }) {
    setModalClient(null);
    setToast(`Note sent to ${client.full_name}.`);
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = rows.length;

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
            Every paid order across the practice — subscriptions, books, and private readings.
          </p>

          {/* Source filter — top-level */}
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

          {/* Sub-filter — only meaningful for client-based sources */}
          {showsClientTable && (
            <div className={styles.controls}>
              <div className={styles.chipRow} role="tablist" aria-label="Status filter">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === f.id}
                    className={statusFilter === f.id ? styles.chipActive : styles.chip}
                    onClick={() => setStatusFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <label className={styles.sortField}>
                <span className={styles.sortLabel}>Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={styles.sortSelect}
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {toast && <p className={styles.toast}>{toast}</p>}

          <p className={styles.count}>
            {loading
              ? 'Loading…'
              : showsClientTable
                ? `${rows.length} client${rows.length === 1 ? '' : 's'}`
                : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
          </p>

          {!loading && showsClientTable && (
            <ConversionTable
              rows={rows}
              onMarkSubscribed={handleMarkSubscribed}
              onSendNote={handleSendNote}
              busyClientId={busyClientId}
            />
          )}

          {!loading && showsOrdersTable && orders.length === 0 && (
            <p className={adminStyles.muted}>
              {sourceFilter === 'books'
                ? 'No book sales recorded yet.'
                : 'No paid orders recorded yet.'}
            </p>
          )}

          {!loading && showsOrdersTable && orders.length > 0 && (
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Paid</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.paid_at ? new Date(o.paid_at).toLocaleDateString() : '—'}</td>
                    <td>{o.type}</td>
                    <td>{o.product_title || o.notes || '—'}</td>
                    <td>{o.amount != null ? `${Number(o.amount).toFixed(2)} ${o.currency}` : '—'}</td>
                    <td>{o.payment_method || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </AdminShell>

      <SendNoteModal
        client={modalClient}
        onClose={() => setModalClient(null)}
        onSent={handleNoteSent}
      />
    </>
  );
}
