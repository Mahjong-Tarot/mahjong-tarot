import styles from '../styles/FireHorse.module.css';
import { elementColor } from '../lib/bazi';
import {
  SIGNS,
  ELEMENTS,
  FIXED_ELEMENT,
  ELEMENT_LABEL,
  SIGN_LABEL,
} from '../lib/fire-horse';

export default function FireHorseForecastForm({
  profile,
  sign,
  setSign,
  element,
  setElement,
  birthDate,
  setBirthDate,
  birthTime,
  setBirthTime,
  dayMasterStem,
}) {
  return (
    <section className={styles.forecast}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Find Your Forecast</h2>
          <p className={styles.sectionLead}>
            Pick your zodiac sign for the basic reading. Add your birth element for the deeper 60-sign reading. Add your birth date to unlock the Day Master overlay, the layer that real BaZi practitioners use.
          </p>
        </div>

        {profile && (
          <div className={styles.profilePill}>
            Loaded from your profile: <strong>{profile.name || 'Account'}</strong>
            {profile.birthday && <> &middot; born {profile.birthday}</>}
          </div>
        )}

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Your zodiac sign</label>
            <div className={styles.signGrid}>
              {SIGNS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.signBtn} ${sign === s ? styles.signBtnActive : ''}`}
                  onClick={() => setSign(s)}
                >
                  {SIGN_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Your birth element <span className={styles.opt}>(optional)</span></label>
            <div className={styles.elementGrid}>
              <button
                type="button"
                className={`${styles.elemBtn} ${!element ? styles.elemBtnActive : ''}`}
                onClick={() => setElement('')}
              >
                Use sign default
              </button>
              {ELEMENTS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`${styles.elemBtn} ${element === e ? styles.elemBtnActive : ''}`}
                  onClick={() => setElement(e)}
                >
                  <span className={styles.elemSwatch} style={{ background: elementColor(ELEMENT_LABEL[e]) }} />
                  {ELEMENT_LABEL[e]}
                </button>
              ))}
            </div>
            {sign && !element && (
              <p className={styles.hint}>Defaulting to <strong>{ELEMENT_LABEL[FIXED_ELEMENT[sign]]}</strong> (the {SIGN_LABEL[sign]}’s fixed element).</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Birth date <span className={styles.opt}>(optional, unlocks Day Master)</span></label>
            <div className={styles.dateRow}>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={styles.input}
              />
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className={styles.input}
                placeholder="Birth time (optional)"
              />
            </div>
            {dayMasterStem && (
              <p className={styles.hint}>
                Day Master detected: <strong>{dayMasterStem.en} ({dayMasterStem.polarity} {dayMasterStem.element})</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
