import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './ChartForm.module.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n) => String(n).padStart(2, '0');

function splitDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || '');
  return m ? { year: m[1], month: String(Number(m[2])), day: String(Number(m[3])) } : { year: '', month: '', day: '' };
}

/**
 * Birth-details form for the free chart. On submit it navigates to
 * /chart?date=YYYY-MM-DD&time=HH:MM&gender=f|m (time and gender optional).
 *
 * @param {boolean} [compact]  tighter padding, for the home-page hero
 * @param {object}  [initial]  { date, time, gender } to prefill (the /chart page)
 */
export default function ChartForm({ compact = false, initial = null }) {
  const router = useRouter();
  const start = splitDate(initial?.date);
  const [month, setMonth] = useState(start.month);
  const [day, setDay] = useState(start.day);
  const [year, setYear] = useState(start.year);
  const [time, setTime] = useState(initial?.time || '');
  const [gender, setGender] = useState(initial?.gender || '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const real = y >= 1901 && dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
    if (!real || dt.getTime() > Date.now()) {
      setError('Please enter a real birth date.');
      return;
    }
    if (time && !gender) {
      setError('Purple Star needs to know if you are female or male.');
      return;
    }
    setError('');
    const query = { date: `${y}-${pad(m)}-${pad(d)}` };
    if (time) query.time = time;
    if (gender) query.gender = gender;
    router.push({ pathname: '/chart', query });
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={handleSubmit} noValidate>
      <div className={styles.fields}>
        <div className={`${styles.field} ${styles.month}`}>
          <label htmlFor="cf-month" className={styles.label}>Month</label>
          <select id="cf-month" className={styles.input} value={month} onChange={(e) => setMonth(e.target.value)} required>
            <option value="" disabled>Month</option>
            {MONTHS.map((name, i) => (
              <option key={name} value={String(i + 1)}>{name}</option>
            ))}
          </select>
        </div>
        <div className={`${styles.field} ${styles.day}`}>
          <label htmlFor="cf-day" className={styles.label}>Day</label>
          <input
            id="cf-day"
            className={styles.input}
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            placeholder="14"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          />
        </div>
        <div className={`${styles.field} ${styles.year}`}>
          <label htmlFor="cf-year" className={styles.label}>Year</label>
          <input
            id="cf-year"
            className={styles.input}
            type="number"
            inputMode="numeric"
            min="1901"
            max={new Date().getFullYear()}
            placeholder="1984"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
        <div className={`${styles.field} ${styles.time}`}>
          <label htmlFor="cf-time" className={styles.label}>
            Birth time <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="cf-time"
            className={styles.input}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <fieldset className={styles.gender}>
        <legend className={styles.label}>
          Born <span className={styles.optional}>(needed with a birth time)</span>
        </legend>
        <div className={styles.genderOptions}>
          <label className={styles.radio}>
            <input type="radio" name="cf-gender" value="f" checked={gender === 'f'} onChange={() => setGender('f')} />
            Female
          </label>
          <label className={styles.radio}>
            <input type="radio" name="cf-gender" value="m" checked={gender === 'm'} onChange={() => setGender('m')} />
            Male
          </label>
        </div>
      </fieldset>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>
          Show my chart <span aria-hidden="true">→</span>
        </button>
        <span className={styles.note}>Free. No account needed to see it.</span>
      </div>
    </form>
  );
}
