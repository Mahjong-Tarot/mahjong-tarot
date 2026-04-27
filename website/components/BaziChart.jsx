import styles from './BaziChart.module.css';
import { elementColor } from '../lib/bazi';

const POSITIONS = [
  { key: 'year',  label: 'Year' },
  { key: 'month', label: 'Month' },
  { key: 'day',   label: 'Day' },
  { key: 'hour',  label: 'Hour' },
];

function PillarCard({ position, pillar }) {
  if (!pillar) {
    return (
      <div className={styles.pillar}>
        <div className={styles.position}>{position.label}</div>
        <div className={styles.empty}>—</div>
        <div className={styles.note}>(no time on file)</div>
      </div>
    );
  }
  const { stem, branch } = pillar;
  return (
    <div className={styles.pillar}>
      <div className={styles.position}>{position.label}</div>
      <div className={styles.han}>{pillar.gan}{pillar.zhi}</div>
      <div className={styles.row}>
        <span className={styles.swatch} style={{ background: elementColor(stem?.element) }} />
        <span>{stem?.polarity} {stem?.element}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.swatch} style={{ background: elementColor(branch?.element) }} />
        <span>{branch?.animal} <span className={styles.muted}>({branch?.element})</span></span>
      </div>
    </div>
  );
}

export default function BaziChart({ pillars, elements, dominantElement }) {
  if (!pillars) return null;
  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {POSITIONS.map((p) => <PillarCard key={p.key} position={p} pillar={pillars[p.key]} />)}
      </div>
      {elements && (
        <div className={styles.elementBar}>
          {Object.entries(elements).map(([name, count]) => (
            <div key={name} className={styles.elementCell}>
              <span className={styles.swatch} style={{ background: elementColor(name) }} />
              <span><strong>{name}</strong> · {count}</span>
            </div>
          ))}
          {dominantElement && (
            <div className={styles.dominant}>
              Dominant: <strong>{dominantElement}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
