import { TYPE_LABELS } from '../lib/admin-inquiries';
import kanbanStyles from '../styles/PortalAdminKanban.module.css';

export default function MarkWonModal({ winning, submitting, onChange, onCancel, onSubmit }) {
  if (!winning) return null;
  return (
    <div className={kanbanStyles.modalBackdrop} onClick={() => !submitting && onCancel()}>
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
            onChange={(e) => onChange({ ...winning, amount: e.target.value })}
            placeholder="70.00"
            className={kanbanStyles.modalInput}
          />
        </label>

        <label className={kanbanStyles.modalLabel}>
          Close date
          <input
            type="date"
            value={winning.closeDate}
            onChange={(e) => onChange({ ...winning, closeDate: e.target.value })}
            className={kanbanStyles.modalInput}
          />
        </label>

        <label className={kanbanStyles.modalLabel}>
          Notes (optional)
          <textarea
            rows={3}
            value={winning.notes}
            onChange={(e) => onChange({ ...winning, notes: e.target.value })}
            placeholder="Payment method, channel, anything worth remembering"
            className={kanbanStyles.modalInput}
          />
        </label>

        <div className={kanbanStyles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={kanbanStyles.modalCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !winning.amount}
            className={kanbanStyles.modalSubmit}
          >
            {submitting ? 'Recording…' : 'Mark Won'}
          </button>
        </div>
      </div>
    </div>
  );
}
