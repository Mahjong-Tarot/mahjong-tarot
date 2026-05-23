import { useEffect, useState } from 'react';
import Head from 'next/head';
import AdminShell from '../../components/AdminShell';
import { requirePortalUser } from '../../lib/requirePortalUser';
import adminStyles from '../../styles/PortalAdmin.module.css';
import styles from '../../styles/PortalQuickReading.module.css';

export async function getServerSideProps(ctx) {
  return requirePortalUser(ctx);
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function QuickReadingPage({ profile }) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [gender, setGender] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [otherEmail, setOtherEmail] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [sending, setSending] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setConsultationDate(todayIso());
  }, []);

  async function postReading(recipient) {
    if (!birthday) {
      setError('Date of birth is required.');
      return;
    }
    if (!consultationDate) {
      setError('Consultation date is required.');
      return;
    }
    setError('');
    setMessage('');
    setSending(recipient === 'me' ? 'me' : 'other');

    // 30s watchdog — the API does a server-side compute + Resend send;
    // anything over 30s is likely a hang and we want the button released.
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('Send timed out after 30s. Try refreshing the page.')),
        30000,
      );
    });

    try {
      const res = await Promise.race([
        fetch('/api/admin/quick-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || null,
            birthday,
            birthTime: birthTime || null,
            birthPlace: birthPlace || null,
            gender: gender || null,
            consultationDate,
            recipient,
          }),
        }),
        timeout,
      ]);
      clearTimeout(timer);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send.');
      setMessage(`Sent to ${data.sentTo}.`);
    } catch (err) {
      clearTimeout(timer);
      // eslint-disable-next-line no-console
      console.error('[quick-reading] send failed', err);
      setError(err?.message || 'Failed to send.');
    } finally {
      setSending('');
    }
  }

  function handleSendOther(e) {
    e?.preventDefault?.();
    if (!otherEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(otherEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    postReading(otherEmail);
  }

  return (
    <>
      <Head>
        <title>Quick reading | Mahjong Tarot Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AdminShell profile={profile}>
          <p className={adminStyles.pageEyebrow}>Quick reading</p>
          <h1 className={adminStyles.pageTitle}>Generate a reading</h1>
          <p className={adminStyles.pageLede}>
            Enter the subject's birth info. We email a packet with the Bazi
            chart, Zi Wei summary, Three Blessings, almanac, and horoscope
            for the consultation date.
          </p>

          <form
            className={styles.form}
            onSubmit={(e) => { e.preventDefault(); postReading('me'); }}
          >
            <label className={styles.field}>
              <span className={styles.label}>Customer name</span>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </label>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Date of birth *</span>
                <input
                  type="date"
                  className={styles.input}
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Time of birth (optional)</span>
                <input
                  type="time"
                  className={styles.input}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  placeholder="HH:MM"
                />
              </label>
            </div>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Place of birth (optional)</span>
                <input
                  type="text"
                  className={styles.input}
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="City, State / Country"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Gender (optional)</span>
                <select
                  className={styles.input}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Consultation date *</span>
              <input
                type="date"
                className={styles.input}
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                required
              />
              <span className={styles.hint}>
                Defaults to today. The almanac and horoscope sections are
                computed for this date.
              </span>
            </label>

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={sending !== ''}
              >
                {sending === 'me' ? 'Sending…' : 'Email to me'}
              </button>

              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowOtherInput((v) => !v)}
                disabled={sending !== ''}
              >
                Email to another address
              </button>
            </div>

            {showOtherInput && (
              <div className={styles.otherBlock}>
                <label className={styles.field}>
                  <span className={styles.label}>Recipient email</span>
                  <input
                    type="email"
                    className={styles.input}
                    value={otherEmail}
                    onChange={(e) => setOtherEmail(e.target.value)}
                    placeholder="recipient@example.com"
                  />
                </label>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleSendOther}
                  disabled={sending !== '' || !otherEmail}
                >
                  {sending === 'other' ? 'Sending…' : `Send to ${otherEmail || 'address'}`}
                </button>
              </div>
            )}
          </form>
      </AdminShell>
    </>
  );
}
