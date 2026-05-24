import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import { supabase } from '../../lib/supabase';
import { requirePage } from '../../lib/guards';
import styles from '../../styles/PortalAdmin.module.css';
import tableStyles from '../../styles/PortalAdminTable.module.css';
import kanbanStyles from '../../styles/PortalAdminKanban.module.css';

export async function getServerSideProps(ctx) {
  return requirePage('admin')(ctx);
}

const STAGES = [
  { id: 'new_lead',       label: 'New lead' },
  { id: 'contacted',      label: 'Contacted' },
  { id: 'discovery_call', label: 'Discovery call' },
  { id: 'proposal',       label: 'Proposal' },
  { id: 'won',            label: 'Won' },
  { id: 'lost',           label: 'Lost' },
  { id: 'archived',       label: 'Archived' },
];

const TYPES = [
  { id: '',             label: 'All types' },
  { id: 'contact',      label: 'Contact' },
  { id: 'newsletter',   label: 'Newsletter' },
  { id: 'booking',      label: 'Booking' },
  { id: 'reading',      label: 'Reading' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'general',      label: 'General' },
];

const TYPE_LABELS = TYPES.reduce((acc, t) => ({ ...acc, [t.id]: t.label }), {});

function relTime(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

          {error && <p className={styles.error}>{error}</p>}

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
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Type</th>
                    <th>Person</th>
                    <th>Subject</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                      <td className={tableStyles.cellMuted}>{relTime(r.created_at)}</td>
                      <td>
                        <span className={tableStyles.tag}>{TYPE_LABELS[r.type] || r.type}</span>
                      </td>
                      <td className={tableStyles.cellPrimary}>
                        {r.person_name || r.person_email}
                        {r.person_name && <span className={kanbanStyles.subtle}> · {r.person_email}</span>}
                      </td>
                      <td className={tableStyles.cellSecondary}>
                        {r.subject || r.message?.slice(0, 60) || '—'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          value={r.status}
                          disabled={busy === r.id}
                          onChange={(e) => changeStatus(r.id, e.target.value)}
                          className={kanbanStyles.stageSelect}
                          data-stage={r.status}
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && view === 'kanban' && rows.length > 0 && (
            <div className={kanbanStyles.board}>
              {STAGES.filter((s) => s.id !== 'archived').map((stage) => (
                <div key={stage.id} className={kanbanStyles.column} data-stage={stage.id}>
                  <header className={kanbanStyles.colHeader}>
                    <span className={kanbanStyles.colLabel}>{stage.label}</span>
                    <span className={kanbanStyles.colCount}>{grouped[stage.id].length}</span>
                  </header>
                  <ul className={kanbanStyles.cardList}>
                    {grouped[stage.id].map((r) => (
                      <li key={r.id} className={kanbanStyles.card}>
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className={kanbanStyles.cardButton}
                        >
                          <p className={kanbanStyles.cardName}>{r.person_name || r.person_email}</p>
                          <p className={kanbanStyles.cardMeta}>
                            <span className={tableStyles.tag}>{TYPE_LABELS[r.type] || r.type}</span>
                            <span className={kanbanStyles.subtle}>{relTime(r.created_at)}</span>
                          </p>
                          {r.subject && <p className={kanbanStyles.cardSubject}>{r.subject}</p>}
                        </button>
                      </li>
                    ))}
                    {grouped[stage.id].length === 0 && (
                      <li className={kanbanStyles.emptyCol}>—</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}

        {selected && (
          <DetailDrawer
            inquiry={selected}
            busy={busy === selected.id}
            onClose={() => setSelected(null)}
            onChangeStatus={(s) => changeStatus(selected.id, s)}
          />
        )}

        {toast && <div className={kanbanStyles.toast}>{toast}</div>}
      {winning && (
        <div className={kanbanStyles.modalBackdrop} onClick={() => !winSubmitting && setWinning(null)}>
          <div className={kanbanStyles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={kanbanStyles.modalTitle}>Mark as Won</h3>
            <p className={kanbanStyles.modalSub}>
              {winning.inquiry.person_name || winning.inquiry.person_email || 'Inquiry'} ·{' '}
              {TYPE_LABELS[winning.inquiry.type] || winning.inquiry.type}
            </p>

            <label className={kanbanStyles.modalLabel}>
              Amount (USD)
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoFocus
                value={winning.amount}
                onChange={(e) => setWinning({ ...winning, amount: e.target.value })}
                placeholder="70.00"
                className={kanbanStyles.modalInput}
              />
            </label>

            <label className={kanbanStyles.modalLabel}>
              Close date
              <input
                type="date"
                value={winning.closeDate}
                onChange={(e) => setWinning({ ...winning, closeDate: e.target.value })}
                className={kanbanStyles.modalInput}
              />
            </label>

            <label className={kanbanStyles.modalLabel}>
              Notes (optional)
              <textarea
                rows={3}
                value={winning.notes}
                onChange={(e) => setWinning({ ...winning, notes: e.target.value })}
                placeholder="Payment method, channel, anything worth remembering"
                className={kanbanStyles.modalInput}
              />
            </label>

            <div className={kanbanStyles.modalActions}>
              <button
                type="button"
                onClick={() => setWinning(null)}
                disabled={winSubmitting}
                className={kanbanStyles.modalCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitMarkWon}
                disabled={winSubmitting || !winning.amount}
                className={kanbanStyles.modalSubmit}
              >
                {winSubmitting ? 'Recording…' : 'Mark Won'}
              </button>
            </div>
          </div>
        </div>
      )}
      </AdminShell>
    </>
  );
}

function DetailDrawer({ inquiry, busy, onClose, onChangeStatus }) {
  return (
    <div className={kanbanStyles.drawerBackdrop} onClick={onClose}>
      <aside
        className={kanbanStyles.drawer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={kanbanStyles.drawerHeader}>
          <button type="button" onClick={onClose} className={kanbanStyles.drawerClose} aria-label="Close">×</button>
          <p className={kanbanStyles.drawerEyebrow}>
            {TYPE_LABELS[inquiry.type] || inquiry.type} · {relTime(inquiry.created_at)}
          </p>
          <h2 className={kanbanStyles.drawerTitle}>
            {inquiry.person_name || inquiry.person_email}
          </h2>
          <p className={kanbanStyles.drawerSub}>{inquiry.person_email}</p>
        </header>

        <div className={kanbanStyles.drawerBody}>
          {inquiry.subject && (
            <>
              <p className={kanbanStyles.drawerLabel}>Subject</p>
              <p className={kanbanStyles.drawerText}>{inquiry.subject}</p>
            </>
          )}
          {inquiry.message && (
            <>
              <p className={kanbanStyles.drawerLabel}>Message</p>
              <p className={kanbanStyles.drawerMessage}>{inquiry.message}</p>
            </>
          )}

          <p className={kanbanStyles.drawerLabel}>Stage</p>
          <select
            value={inquiry.status}
            onChange={(e) => onChangeStatus(e.target.value)}
            className={kanbanStyles.stageSelect}
            data-stage={inquiry.status}
            disabled={busy}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <p className={kanbanStyles.drawerLabel}>Source</p>
          <p className={kanbanStyles.drawerText}>
            {inquiry.source ? `${inquiry.source} · ` : ''}{inquiry.source_site || '—'}
          </p>

          {inquiry.person_company && (
            <>
              <p className={kanbanStyles.drawerLabel}>Company</p>
              <p className={kanbanStyles.drawerText}>{inquiry.person_company}</p>
            </>
          )}
          {inquiry.person_phone && (
            <>
              <p className={kanbanStyles.drawerLabel}>Phone</p>
              <p className={kanbanStyles.drawerText}>{inquiry.person_phone}</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
