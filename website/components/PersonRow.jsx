import { TYPE_LABELS, relTime } from '../lib/admin-people';

export default function PersonRow({ person, tableStyles, onOpen }) {
  return (
    <tr onClick={() => onOpen(person)} style={{ cursor: 'pointer' }}>
      <td className={tableStyles.cellPrimary}>{person.name || '—'}</td>
      <td className={tableStyles.cellSecondary}>{person.email}</td>
      <td>
        <div className={tableStyles.tagRow}>
          {person.is_member && <span className={tableStyles.tagMember}>member</span>}
          {person.is_customer && <span className={tableStyles.tagClient}>customer</span>}
          {person.is_legacy_customer && <span className={tableStyles.tagLegacy}>legacy</span>}
          {person.subscription === 'active' && <span className={tableStyles.tagActive}>subscribed</span>}
          {person.subscription === 'lapsed' && <span className={tableStyles.tagLapsed}>lapsed</span>}
          {person.types.map((t) => (
            <span key={t} className={tableStyles.tag}>{TYPE_LABELS[t] || t}</span>
          ))}
          {person.types.length === 0 && !person.is_member && !person.is_customer && (
            <span className={tableStyles.muted}>—</span>
          )}
        </div>
      </td>
      <td className={tableStyles.cellMuted}>{person.inquiry_count || '—'}</td>
      <td className={tableStyles.cellMuted}>{person.order_count || '—'}</td>
      <td className={tableStyles.cellMuted}>{relTime(person.last_activity)}</td>
    </tr>
  );
}
