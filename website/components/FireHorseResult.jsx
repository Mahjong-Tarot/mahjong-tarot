import styles from '../styles/FireHorse.module.css';
import overview from '../data/fire-horse/year-overview.json';
import signsNarrative from '../data/fire-horse/signs-narrative.json';
import dmNarrative from '../data/fire-horse/day-master-narrative.json';
import FireHorseMonthlyBars from './FireHorseMonthlyBars';
import {
  BAND_FOR,
  BAND_COLOR,
  ELEMENT_LABEL,
  SIGN_LABEL,
  topMonths,
} from '../lib/fire-horse';

export default function FireHorseResult({
  composed,
  yearBand,
  sign,
  effectiveElement,
  dayMasterStem,
  dayMasterEntry,
}) {
  const sn = signsNarrative[sign];
  const dn = dayMasterStem ? dmNarrative[dayMasterStem.en] : null;

  return (
    <section className={styles.result}>
      <div className="container">
        <div className={styles.resultHeader}>
          <p className={styles.resultEyebrow}>
            {SIGN_LABEL[sign]} &middot; {ELEMENT_LABEL[effectiveElement]}
            {dayMasterStem && <> &middot; Day Master {dayMasterStem.en}</>}
          </p>
          <div className={styles.scoreBlock}>
            <div className={styles.scoreNum}>{composed.yearScore.toFixed(2)}</div>
            <div className={styles.scoreBand} style={{ color: BAND_COLOR[yearBand.tone] }}>
              {yearBand.label}
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <p className={styles.headlineQuote}>&ldquo;{sn.headline}&rdquo;</p>
          <p>{sn.lead}</p>

          <div className={styles.lifeAreas}>
            <div className={styles.lifeArea}>
              <h4>Career</h4>
              <p>{sn.career}</p>
            </div>
            <div className={styles.lifeArea}>
              <h4>Money</h4>
              <p>{sn.money}</p>
            </div>
            <div className={styles.lifeArea}>
              <h4>Love</h4>
              <p>{sn.love}</p>
            </div>
          </div>

          <p className={styles.advice}>
            <span className={styles.adviceLabel}>This year's advice for you</span>
            {sn.advice}
          </p>
        </div>

        {dn && (
          <div className={styles.dmSection}>
            <p className={styles.dmEyebrow}>Day Master overlay &middot; {dn.ten_gods}</p>
            <h3 className={styles.dmHeadline}>{dn.headline}</h3>
            <p className={styles.dmArchetype}>{dn.archetype} &middot; {dayMasterEntry.year_lift >= 0 ? '+' : ''}{dayMasterEntry.year_lift.toFixed(2)} to your year score</p>
            <p>{dn.extended}</p>
            <div className={styles.dmGrid}>
              <div>
                <h4>For your career</h4>
                <p>{dn.career}</p>
              </div>
              <div>
                <h4>For your relationships</h4>
                <p>{dn.relationships}</p>
              </div>
            </div>
            <p className={styles.advice}>
              <span className={styles.adviceLabel}>Day Master advice</span>
              {dn.advice}
            </p>
          </div>
        )}

        <FireHorseMonthlyBars scores={composed.monthly} label="Your 12-month curve" />

        <div className={styles.keyMonths}>
          <div className={styles.keyMonthsCol}>
            <h4>Best windows</h4>
            <ul>
              {topMonths(composed.monthly, 3).map((m) => {
                const date = overview.lunar_months.find(lm => lm.index === m.month);
                return (
                  <li key={m.month}>
                    <strong>{date?.stem_branch} ({SIGN_LABEL[m.sign]} month)</strong>
                    <span className={styles.monthDate}>{date?.begin}, {date?.end}</span>
                    <span className={styles.monthScore}>{m.score.toFixed(2)} &middot; {BAND_FOR(m.score).short}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={styles.keyMonthsCol}>
            <h4>Hardest windows</h4>
            <ul>
              {topMonths(composed.monthly, 3, true).map((m) => {
                const date = overview.lunar_months.find(lm => lm.index === m.month);
                return (
                  <li key={m.month}>
                    <strong>{date?.stem_branch} ({SIGN_LABEL[m.sign]} month)</strong>
                    <span className={styles.monthDate}>{date?.begin}, {date?.end}</span>
                    <span className={styles.monthScore}>{m.score.toFixed(2)} &middot; {BAND_FOR(m.score).short}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
