import BaziChart from './BaziChart';
import styles from '../styles/Account.module.css';

export default function CompatibilityReport({ result, person1Label = 'You', person2Label = 'Partner' }) {
  if (!result) return null;
  const { person1, person2, rating, generalDescription, yinYangDescription, theGood, theBad, soulMate, narrative } = result;

  return (
    <div>
      <div className={styles.compatRating}>
        {rating != null && (
          <>
            <span className={styles.compatRatingNum}>{Math.round(rating)}</span>
            <span className={styles.compatRatingLabel}>/ 100 compatibility</span>
          </>
        )}
      </div>

      {narrative && (
        <p className={styles.compatNarrative}>{narrative}</p>
      )}

      <div className={styles.compatGrid}>
        <div className={styles.compatCard}>
          <h3>{person1Label} · {person1.sign}</h3>
          <BaziChart
            pillars={person1.pillars}
            elements={person1.elements}
            dominantElement={person1.dominantElement}
          />
        </div>
        <div className={styles.compatCard}>
          <h3>{person2Label} · {person2.sign}</h3>
          <BaziChart
            pillars={person2.pillars}
            elements={person2.elements}
            dominantElement={person2.dominantElement}
          />
        </div>
      </div>

      {generalDescription && (
        <section style={{ marginTop: '2rem' }}>
          <h3 className={styles.subTitle}>General match</h3>
          <p className={styles.compatNarrative}>{generalDescription}</p>
        </section>
      )}

      {yinYangDescription && (
        <section style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.subTitle}>Yin / Yang</h3>
          <p className={styles.compatNarrative}>{yinYangDescription}</p>
        </section>
      )}

      {theGood && (
        <section style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.subTitle}>The good</h3>
          <p className={styles.compatNarrative}>{theGood}</p>
        </section>
      )}

      {theBad && (
        <section style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.subTitle}>The bad</h3>
          <p className={styles.compatNarrative}>{theBad}</p>
        </section>
      )}

      {soulMate && (
        <section style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.subTitle}>Soul mate</h3>
          <p className={styles.compatNarrative}>{soulMate.description}</p>
        </section>
      )}
    </div>
  );
}
