import { useEffect, useState } from 'react';
import Link from 'next/link';
import shelf from './Shelf.module.css';

// Shelf styles: Shelf.module.css (shared with PersonEditShelf).

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
      <div onClick={() => !busy && onClose?.()} className={shelf.backdrop} />
      <aside className={shelf.panel} onClick={(e) => e.stopPropagation()}>
        <header className={`${shelf.header} ${shelf.headerLoose}`}>
          <div>
            <p className={shelf.eyebrow}>Sale details</p>
            <h2 className={`${shelf.title} ${shelf.titleSpaced}`}>
              {deal.person_id ? (
                <Link
                  href={`/admin/people?focus=${deal.person_id}`}
                  className={shelf.titleLink}
                >
                  {customerLabel}
                </Link>
              ) : (
                customerLabel
              )}
            </h2>
            <p className={shelf.subline}>
              Won {fmtDate(deal.won_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose?.()}
            aria-label="Close"
            className={shelf.close}
            disabled={busy}
          >
            ×
          </button>
        </header>

        {err && <p className={shelf.err}>{err}</p>}
        {okMsg && <p className={shelf.ok}>{okMsg}</p>}

        <h3 className={`${shelf.sectionTitle} ${shelf.sectionTitleLoose}`}>Transaction</h3>
        <div className={shelf.rowGrid}>
          <span className={shelf.labelCell}>Amount</span>
          <span className={shelf.valueCell}>{fmtCurrency(deal.amount_cents, deal.currency)}</span>
          <span className={shelf.labelCell}>Source</span>
          <span className={shelf.valueCell}>{deal.source || '—'}</span>
          <span className={shelf.labelCell}>Status</span>
          <span className={shelf.valueCell}>
            <span className={`${shelf.badge} ${isRefunded ? shelf.badgeRefunded : shelf.badgeWon}`}>
              {deal.status}
            </span>
          </span>
          <span className={shelf.labelCell}>Payment intent</span>
          <span className={shelf.monoValue} title={deal.stripe_payment_intent_id || ''}>
            {truncateMiddle(deal.stripe_payment_intent_id)}
          </span>
          {deal.stripe_session_id && (
            <>
              <span className={shelf.labelCell}>Session</span>
              <span className={shelf.monoValue} title={deal.stripe_session_id}>
                {truncateMiddle(deal.stripe_session_id)}
              </span>
            </>
          )}
          <span className={shelf.labelCell}>Notes</span>
          <span className={shelf.valueCell}>{deal.notes || '—'}</span>
        </div>

        {deal.booking_id && (
          <>
            <h3 className={`${shelf.sectionTitle} ${shelf.sectionTitleLoose}`}>Linked records</h3>
            <Link
              href={`/admin/private-readings/${deal.booking_id}`}
              className={shelf.linkBtn}
            >
              View private reading →
            </Link>
          </>
        )}

        {canRefund && (
          <>
            <h3 className={`${shelf.sectionTitle} ${shelf.sectionTitleLoose}`}>Actions</h3>
            <button
              type="button"
              onClick={handleRefund}
              disabled={busy}
              className={shelf.dangerBtn}
            >
              {busy ? 'Refunding…' : 'Refund via Stripe'}
            </button>
            <p className={shelf.hint}>
              Full refund only. Cannot be undone.
            </p>
          </>
        )}
      </aside>
    </>
  );
}
