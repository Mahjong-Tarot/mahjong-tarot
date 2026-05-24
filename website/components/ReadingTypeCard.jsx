import Link from 'next/link';
import styles from '../styles/Readings.module.css';

export default function ReadingTypeCard({ id, overline, label, title, body, featured }) {
  const cardClass = featured
    ? `${styles.readingCard} ${styles.readingCardFeatured}`
    : styles.readingCard;
  const labelClass = featured ? styles.readingLabelLight : styles.readingLabel;
  const ctaClass = featured ? 'btn-ghost' : 'btn-secondary';
  const overlineStyle = featured ? { color: 'var(--celestial-gold)' } : undefined;

  return (
    <div id={id} className={cardClass}>
      <div className={styles.readingMeta}>
        <span className="overline" style={overlineStyle}>{overline}</span>
        <span className={labelClass}>{label}</span>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <Link href="#book" className={ctaClass}>Book this session</Link>
    </div>
  );
}
