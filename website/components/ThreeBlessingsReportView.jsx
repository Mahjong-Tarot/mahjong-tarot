// Presentational Three Blessings report. Pure: give it a `reading` (from
// lib/tb/engine.mjs computeThreeBlessings) and it renders the three blessings in
// the almanac auspiciousness color system. The page owns auth + birth data.
import styles from '../styles/ThreeBlessingsReport.module.css';

const SECTIONS = [
  { key: 'luck',       ornament: '福', name: 'Happiness',  vi: 'Phúc', sub: 'Luck' },
  { key: 'prosperity', ornament: '禄', name: 'Prosperity', vi: 'Lộc',  sub: 'Wealth' },
  { key: 'longevity',  ornament: '寿', name: 'Longevity',  vi: 'Thọ',  sub: 'Health' },
];

const VERDICT = {
  1: { label: 'Lucky',   cls: 'lucky' },
  2: { label: 'Neutral', cls: 'neutral' },
  3: { label: 'Unlucky', cls: 'unlucky' },
};

const verdictOf = (lv) => VERDICT[lv] || VERDICT[2];

function Chip({ lv }) {
  const v = verdictOf(lv);
  return <span className={`${styles.chip} ${styles[v.cls]}`}>{v.label}</span>;
}

function crossRefLine(lv) {
  return `Your overall Happiness rating is ${verdictOf(lv).label.toLowerCase()}, which carries into your health and longevity.`;
}

export default function ThreeBlessingsReportView({ reading }) {
  if (!reading) return null;

  return (
    <>
      {/* Summary — one tile per blessing, tinted by its overall verdict */}
      <div className={styles.summaryRow}>
        {SECTIONS.map(({ key, ornament, name, vi }) => {
          const s = reading[key];
          return (
            <div key={key} className={`${styles.summaryTile} ${styles[`tone_${verdictOf(s.verdict).cls}`]}`}>
              <span className={styles.ornament} aria-hidden="true">{ornament}</span>
              <span className={styles.summaryName}>{name}</span>
              <span className={styles.summaryVi}>{vi}</span>
              <Chip lv={s.verdict} />
              <span className={styles.tally}>
                {s.tally.L} lucky · {s.tally.N} neutral · {s.tally.U} unlucky
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed sections */}
      {SECTIONS.map(({ key, ornament, name, vi, sub }) => {
        const s = reading[key];
        return (
          <section key={key} className={styles.section}>
            <header className={styles.sectionHeader}>
              <span className={styles.sectionOrnament} aria-hidden="true">{ornament}</span>
              <div className={styles.sectionHeadText}>
                <h2 className={styles.sectionTitle}>{name}</h2>
                <p className={styles.sectionSub}>{vi} · {sub}</p>
              </div>
              <Chip lv={s.verdict} />
            </header>

            <ol className={styles.indicators}>
              {s.indicators.map((ind, i) => (
                <li key={i} className={styles.indicator}>
                  <div className={styles.indicatorHead}>
                    <span className={styles.indicatorLabel}>{ind.label}</span>
                    <span className={styles.indicatorMeta}>
                      {ind.provisional && <span className={styles.estimated}>estimated</span>}
                      <Chip lv={ind.lv} />
                    </span>
                  </div>
                  <p className={styles.indicatorText}>
                    {ind.narrative || (ind.crossRef ? crossRefLine(ind.lv) : null)}
                  </p>
                </li>
              ))}
            </ol>

            {s.conclusion && (
              <p className={`${styles.conclusion} ${styles[`edge_${verdictOf(s.verdict).cls}`]}`}>
                {s.conclusion}
              </p>
            )}
          </section>
        );
      })}

      {/* Grand conclusion */}
      {reading.grand?.narrative && (
        <section className={styles.grand}>
          <h2 className={styles.grandTitle}>The whole of your fortune</h2>
          <p>{reading.grand.narrative}</p>
        </section>
      )}

      <p className={styles.method}>
        Ten indicators weigh each blessing; a blessing is granted when its lucky indicators
        outnumber the unlucky. Two indicators marked <em>estimated</em> use a rating still being
        refined against Bill&apos;s original method.
      </p>
    </>
  );
}
