import { STAGES, TYPE_LABELS, relTime } from '../lib/admin-inquiries';
import kanbanStyles from '../styles/PortalAdminKanban.module.css';

export default function InquiryDetailDrawer({ inquiry, busy, onClose, onChangeStatus }) {
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
