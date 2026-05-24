import styles from '../styles/FireHorse.module.css';
import { BAND_FOR, BAND_COLOR, SIGN_LABEL } from '../lib/fire-horse';

export default function FireHorseMonthlyBars({ scores, label }) {
  const max = 1.0;
  return (
    <div className={styles.chart}>
      <div className={styles.chartLabel}>{label}</div>
      <div className={styles.chartGrid}>
        <div className={styles.chartGuide} style={{ bottom: '85%' }}><span>0.85</span></div>
        <div className={styles.chartGuide} style={{ bottom: '50%' }}><span>0.50</span></div>
        <div className={styles.chartGuide} style={{ bottom: '15%' }}><span>0.15</span></div>
        <div className={styles.chartBars}>
          {scores.map((m) => {
            const band = BAND_FOR(m.score);
            const height = `${(m.score / max) * 100}%`;
            return (
              <div key={m.month} className={styles.barWrap} title={`Month ${m.month}: ${m.score.toFixed(3)}`}>
                <div className={styles.bar} style={{ height, background: BAND_COLOR[band.tone] }}>
                  <span className={styles.barScore}>{m.score.toFixed(2)}</span>
                </div>
                <div className={styles.barLabel}>{SIGN_LABEL[m.sign].slice(0, 3)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
