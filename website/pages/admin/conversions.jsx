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

const STATUS_FILTERS = [
  { id: 'targets',   label: 'Conversion targets' },
  { id: 'none',      label: 'Not subscribed' },
  { id: 'lapsed',    label: 'Lapsed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'active',    label: 'Subscribed' },
  { id: 'all',       label: 'All clients' },
];

const SORTS = [
  { id: 'warm',         label: 'Warm leads' },
  { id: 'recent',       label: 'Recent activity' },
  { id: 'alphabetical', label: 'A → Z' },
];

export default function ConversionsPage({ profile }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('targets');
  const [sort, setSort] = useState('warm');
  const [busyClientId, setBusyClientId] = useState('');
  const [modalClient, setModalClient] = useState(null);
  const [toast, setToast] = useState('');

  async function load() {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await listConversionTargets(supabase, { statusFilter, sort });
      setRows(data);
    } catch (err) {
      setError(err.message || 'Failed to load conversions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sort]);

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
        <title>Conversions | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <p className={adminStyles.pageEyebrow}>Admin · Conversions</p>
          <h1 className={adminStyles.pageTitle}>Conversion dashboard</h1>
          <p className={adminStyles.pageLede}>
            Every client across the portal, ranked by likelihood to convert.
            Send a note, mark them subscribed, or open the full profile.
          </p>

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

          {error && <p className={styles.error}>{error}</p>}
          {toast && <p className={styles.toast}>{toast}</p>}

          <p className={styles.count}>
            {loading ? 'Loading…' : `${counts} client${counts === 1 ? '' : 's'}`}
          </p>

          {!loading && (
            <ConversionTable
              rows={rows}
              onMarkSubscribed={handleMarkSubscribed}
              onSendNote={handleSendNote}
              busyClientId={busyClientId}
            />
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
