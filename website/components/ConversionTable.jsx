import Link from 'next/link';
import SubscriptionIcon from './SubscriptionIcon';
import styles from './ConversionTable.module.css';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

export default function ConversionTable({
  rows,
  onMarkSubscribed,
  onSendNote,
  busyClientId,
}) {
  if (!rows.length) {
    return <p className={styles.empty}>No clients match this filter.</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Astrologer</th>
            <th>Status</th>
            <th>Sessions</th>
            <th>Last session</th>
            <th>Last report sent</th>
            <th>Email</th>
            <th aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const busy = busyClientId === r.id;
            return (
              <tr key={r.id}>
                <td>
                  <Link href={`/portal/clients/${r.id}`} className={styles.nameLink}>
                    {r.full_name || '—'}
                  </Link>
                </td>
                <td>{r.astrologer_name || '—'}</td>
                <td>
                  <SubscriptionIcon status={r.subscription_status} showLabel />
                </td>
                <td className={styles.numCell}>{r.session_count}</td>
                <td>{formatDate(r.last_session_at)}</td>
                <td>{formatDate(r.last_report_sent_at)}</td>
                <td className={styles.emailCell}>{r.email || <span className={styles.muted}>missing</span>}</td>
                <td>
                  <div className={styles.actions}>
                    {r.subscription_status !== 'active' && (
                      <button
                        type="button"
                        className={styles.btnMark}
                        onClick={() => onMarkSubscribed(r)}
                        disabled={busy}
                      >
                        {busy ? '…' : 'Mark subscribed'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.btnNote}
                      onClick={() => onSendNote(r)}
                      disabled={!r.email}
                      title={r.email ? 'Send a note' : 'Add an email to send a note'}
                    >
                      Send note
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
