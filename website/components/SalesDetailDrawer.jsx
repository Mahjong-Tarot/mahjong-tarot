import { useEffect, useState } from 'react';
import Link from 'next/link';

// ── Shelf primitives (mirror PersonEditShelf) ──────────────────────
const shelfBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60,
};
const shelfPanel = {
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 'min(440px, 92vw)', background: '#fff', boxShadow: '-12px 0 32px rgba(0,0,0,0.15)',
  padding: 20, overflowY: 'auto', zIndex: 61,
};
const shelfHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #e5e7eb',
};
const shelfClose = {
  background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer',
  lineHeight: 1, color: '#6b7280', padding: '0 4px',
};
const shelfErr = {
  background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6,
  fontSize: 13, marginBottom: 12,
};
const shelfOk = {
  background: '#ecfdf5', color: '#065f46', padding: '8px 12px', borderRadius: 6,
  fontSize: 13, marginBottom: 12,
};

const eyebrow = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 500, margin: 0,
};
const sectionTitle = {
  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 600, margin: '20px 0 8px',
};
const rowGrid = {
  display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 8, columnGap: 12,
  fontSize: 14, alignItems: 'baseline',
};
const labelCell = { color: '#6b7280', fontSize: 12 };
const valueCell = { color: '#111827', wordBreak: 'break-word' };
const monoValue = {
  ...valueCell, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
};
const badgeWon = {
  display: 'inline-block', background: '#ecfdf5', color: '#065f46',
  padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.04em',
};
const badgeRefunded = {
  display: 'inline-block', background: '#f3f4f6', color: '#4b5563',
  padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.04em',
};
const linkBtn = {
  display: 'inline-block', padding: '8px 12px', borderRadius: 6,
  border: '1px solid #d1d5db', background: '#fff', color: '#111827',
  textDecoration: 'none', fontSize: 13, fontWeight: 500, marginRight: 8,
  marginTop: 6,
};
const refundBtn = {
  display: 'block', width: '100%', padding: '10px 14px', borderRadius: 6,
  border: '1px solid #b91c1c', background: '#b91c1c', color: '#fff',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 12,
};
const refundBtnBusy = { ...refundBtn, opacity: 0.7, cursor: 'wait' };

function fmtCurrency(cents, currency) {
  const amount = (cents ?? 0) / 100;
  const code = (currency || 'usd').toUpperCase();
  return `$${amount.toFixed(2)} ${code}`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// Middle-truncate a long ID so both ends stay visible.
function truncateMiddle(s, head = 10, tail = 8) {
  if (!s) return '—';
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export default function SalesDetailDrawer({ deal, onClose, onRefunded }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');

  // Esc closes; body scroll-lock while open. Mirrors PersonEditShelf usage.
  useEffect(() => {
    if (!deal) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [deal, busy, onClose]);

  if (!deal) return null;

  const customerLabel = deal.people?.name || deal.people?.email || '—';
  const isRefunded = deal.status === 'refunded';
  const canRefund =
    deal.status === 'won' && !!deal.stripe_payment_intent_id && !okMsg;

  async function handleRefund() {
    const amountStr = fmtCurrency(deal.amount_cents, deal.currency);
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Refund ${amountStr} via Stripe? This cannot be undone.`)) {
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const res = await fetch(`/api/admin/deals/${deal.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(body.error || `Refund failed (${res.status}).`);
        setBusy(false);
        return;
      }
      setOkMsg('Refunded. Closing…');
      onRefunded?.(deal.id);
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (e) {
      setErr(e.message || 'Network error.');
      setBusy(false);
    }
  }

  return (
    <>
      <div onClick={() => !busy && onClose?.()} style={shelfBackdrop} />
      <aside style={shelfPanel} onClick={(e) => e.stopPropagation()}>
        <header style={shelfHeader}>
          <div>
            <p style={eyebrow}>Sale details</p>
            <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600 }}>
              {deal.person_id ? (
                <Link
                  href={`/admin/people?focus=${deal.person_id}`}
                  style={{ color: '#111827', textDecoration: 'none' }}
                >
                  {customerLabel}
                </Link>
              ) : (
                customerLabel
              )}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              Won {fmtDate(deal.won_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose?.()}
            aria-label="Close"
            style={shelfClose}
            disabled={busy}
          >
            ×
          </button>
        </header>

        {err && <p style={shelfErr}>{err}</p>}
        {okMsg && <p style={shelfOk}>{okMsg}</p>}

        <h3 style={sectionTitle}>Transaction</h3>
        <div style={rowGrid}>
          <span style={labelCell}>Amount</span>
          <span style={valueCell}>{fmtCurrency(deal.amount_cents, deal.currency)}</span>
          <span style={labelCell}>Source</span>
          <span style={valueCell}>{deal.source || '—'}</span>
          <span style={labelCell}>Status</span>
          <span style={valueCell}>
            <span style={isRefunded ? badgeRefunded : badgeWon}>
              {deal.status}
            </span>
          </span>
          <span style={labelCell}>Payment intent</span>
          <span style={monoValue} title={deal.stripe_payment_intent_id || ''}>
            {truncateMiddle(deal.stripe_payment_intent_id)}
          </span>
          {deal.stripe_session_id && (
            <>
              <span style={labelCell}>Session</span>
              <span style={monoValue} title={deal.stripe_session_id}>
                {truncateMiddle(deal.stripe_session_id)}
              </span>
            </>
          )}
          <span style={labelCell}>Notes</span>
          <span style={valueCell}>{deal.notes || '—'}</span>
        </div>

        {deal.booking_id && (
          <>
            <h3 style={sectionTitle}>Linked records</h3>
            <Link
              href={`/admin/private-readings/${deal.booking_id}`}
              style={linkBtn}
            >
              View private reading →
            </Link>
          </>
        )}

        {canRefund && (
          <>
            <h3 style={sectionTitle}>Actions</h3>
            <button
              type="button"
              onClick={handleRefund}
              disabled={busy}
              style={busy ? refundBtnBusy : refundBtn}
            >
              {busy ? 'Refunding…' : 'Refund via Stripe'}
            </button>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
              Full refund only. Cannot be undone.
            </p>
          </>
        )}
      </aside>
    </>
  );
}
