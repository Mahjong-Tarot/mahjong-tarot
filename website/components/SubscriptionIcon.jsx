import styles from './SubscriptionIcon.module.css';

const META = {
  none:      { glyph: '◯', label: 'Not subscribed', className: 'none' },
  active:    { glyph: '●', label: 'Subscribed',     className: 'active' },
  lapsed:    { glyph: '◐', label: 'Lapsed',         className: 'lapsed' },
  cancelled: { glyph: '⊘', label: 'Cancelled',      className: 'cancelled' },
};

export default function SubscriptionIcon({ status, showLabel = false, size = 'sm' }) {
  const meta = META[status] || META.none;
  return (
    <span
      className={`${styles.icon} ${styles[meta.className]} ${styles[size]}`}
      title={meta.label}
      aria-label={meta.label}
    >
      <span className={styles.glyph} aria-hidden="true">{meta.glyph}</span>
      {showLabel && <span className={styles.label}>{meta.label}</span>}
    </span>
  );
}
