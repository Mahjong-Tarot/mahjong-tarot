import { STAGES, TYPE_LABELS, relTime } from '../lib/admin-inquiries';
import tableStyles from '../styles/PortalAdminTable.module.css';
import kanbanStyles from '../styles/PortalAdminKanban.module.css';

export default function InquiryKanbanBoard({ grouped, onSelect }) {
  return (
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
                  onClick={() => onSelect(r)}
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
  );
}
