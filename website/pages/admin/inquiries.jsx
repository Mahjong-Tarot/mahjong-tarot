import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import InquiryListTable from '../../components/InquiryListTable';
import InquiryKanbanBoard from '../../components/InquiryKanbanBoard';
import InquiryDetailDrawer from '../../components/InquiryDetailDrawer';
import MarkWonModal from '../../components/MarkWonModal';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import { STAGES, TYPES } from '../../lib/admin-inquiries';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';
import kanbanStyles from '../../styles/PortalAdminKanban.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

export default function AdminInquiries({ profile }) {
  const [rows, setRows]         = useState([]);
  const [view, setView]         = useState('list'); // 'list' | 'kanban'
  const [typeFilter, setType]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy]         = useState('');
  const [toast, setToast]       = useState('');
  // When the user moves an inquiry to 'won', we intercept and open a
  // small modal to capture the deal amount. The endpoint then writes
  // a public.deals row + bumps people.lifecycle_stage to 'customer'.
  const [winning, setWinning]   = useState(null); // {inquiry, amount, closeDate, notes}
  const [winSubmitting, setWinSubmitting] = useState(false);

  async function load() {
    if (!supabase) {
      setError('Supabase not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: e } = await supabase.rpc('get_inquiries', {
        p_type:        typeFilter || null,
        p_status:      null,
        p_source_site: null,
        p_limit:       500,
        p_offset:      0,
      });
      if (e) throw e;
      setRows(data ?? []);
    } catch (e) {
      setError(e.message || 'Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [typeFilter]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function changeStatus(inquiryId, newStatus) {
    // Won is special: we need the deal amount before flipping status.
    if (newStatus === 'won') {
      const inquiry = rows.find((r) => r.id === inquiryId);
      if (inquiry) {
        setWinning({
          inquiry,
          amount: '',
          closeDate: new Date().toISOString().slice(0, 10),
          notes: '',
        });
      }
      return;
    }
    setBusy(inquiryId);
    try {
      const { error: e } = await supabase.rpc('update_inquiry_status', {
        p_inquiry_id: inquiryId,
        p_status:     newStatus,
      });
      if (e) throw e;
      setRows((prev) => prev.map((r) => r.id === inquiryId ? { ...r, status: newStatus } : r));
      if (selected?.id === inquiryId) setSelected({ ...selected, status: newStatus });
      setToast(`Moved to ${STAGES.find((s) => s.id === newStatus)?.label || newStatus}`);
    } catch (e) {
      setError(e.message || 'Failed to update status.');
    } finally {
      setBusy('');
    }
  }

  async function submitMarkWon() {
    if (!winning) return;
    const dollars = parseFloat(winning.amount);
    if (!Number.isFinite(dollars) || dollars < 0) {
      setError('Enter a valid amount.');
      return;
    }
    setWinSubmitting(true);
    setError('');
    try {
      const r = await fetch('/api/admin/inquiries/mark-won', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: winning.inquiry.id,
          amount_cents: Math.round(dollars * 100),
          currency: 'usd',
          close_date: winning.closeDate,
          notes: winning.notes || null,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || 'Mark Won failed');
      // Update local state.
      setRows((prev) => prev.map((row) =>
        row.id === winning.inquiry.id ? { ...row, status: 'won' } : row,
      ));
      if (selected?.id === winning.inquiry.id) {
        setSelected({ ...selected, status: 'won' });
      }
      setToast(json.reused
        ? `Already marked Won earlier — opened that deal.`
        : `Won! Deal recorded for $${dollars.toFixed(2)}.`);
      setWinning(null);
    } catch (e) {
      setError(e.message || 'Mark Won failed');
    } finally {
      setWinSubmitting(false);
    }
  }

  const grouped = useMemo(() => {
    const g = {};
    for (const s of STAGES) g[s.id] = [];
    for (const r of rows) {
      if (g[r.status]) g[r.status].push(r);
    }
    return g;
  }, [rows]);

  return (
    <>
      <Head>
        <title>Inquiries | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <p className={styles.pageEyebrow}>Admin</p>
          <h1 className={styles.pageTitle}>Inquiries</h1>
          <p className={styles.pageLede}>
            Pipeline view of every contact form, booking and newsletter signup.
          </p>

          {error && <p className="error-block">{error}</p>}

          <div className={tableStyles.controlsRow}>
            <div className={tableStyles.chipRow}>
              <button
                type="button"
                className={view === 'list' ? tableStyles.chipActive : tableStyles.chip}
                onClick={() => setView('list')}
              >
                List
              </button>
              <button
                type="button"
                className={view === 'kanban' ? tableStyles.chipActive : tableStyles.chip}
                onClick={() => setView('kanban')}
              >
                Kanban
              </button>
            </div>

            <div className={tableStyles.chipRow}>
              <select
                value={typeFilter}
                onChange={(e) => setType(e.target.value)}
                className={kanbanStyles.select}
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <p className={tableStyles.count}>
                {loading ? 'Loading…' : `${rows.length} inquiries`}
              </p>
            </div>
          </div>

          {!loading && rows.length === 0 && (
            <p className={styles.muted}>No inquiries match this filter.</p>
          )}

          {!loading && view === 'list' && rows.length > 0 && (
            <InquiryListTable
              rows={rows}
              busy={busy}
              onSelect={setSelected}
              onChangeStatus={changeStatus}
            />
          )}

          {!loading && view === 'kanban' && rows.length > 0 && (
            <InquiryKanbanBoard grouped={grouped} onSelect={setSelected} />
          )}

        {selected && (
          <InquiryDetailDrawer
            inquiry={selected}
            busy={busy === selected.id}
            onClose={() => setSelected(null)}
            onChangeStatus={(s) => changeStatus(selected.id, s)}
          />
        )}

        {toast && <div className={kanbanStyles.toast}>{toast}</div>}

        <MarkWonModal
          winning={winning}
          submitting={winSubmitting}
          onChange={setWinning}
          onCancel={() => setWinning(null)}
          onSubmit={submitMarkWon}
        />
      </AdminShell>
    </>
  );
}
