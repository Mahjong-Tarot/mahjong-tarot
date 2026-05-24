import { STAGES, TYPE_LABELS, relTime } from '../lib/admin-inquiries';
import tableStyles from '../styles/PortalAdminTable.module.css';
import kanbanStyles from '../styles/PortalAdminKanban.module.css';

export default function InquiryListTable({ rows, busy, onSelect, onChangeStatus }) {
  return (
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
            <tr key={r.id} onClick={() => onSelect(r)} style={{ cursor: 'pointer' }}>
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
                  onChange={(e) => onChangeStatus(r.id, e.target.value)}
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
  );
}
