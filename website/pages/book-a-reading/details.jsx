import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import styles from '../../styles/Booking.module.css';

const TIERS = {
  30: { title: 'A focused look',  price: 48,  label: '30 min' },
  60: { title: 'The full mirror', price: 88,  label: '60 min' },
  90: { title: 'Deep counsel',    price: 128, label: '90 min' },
};

const STORAGE_KEY = 'mt:booking-draft:v1';

function readDraft() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeDraft(draft) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* swallow quota errors */
  }
}

export default function BookingDetails() {
  const router = useRouter();
  const [duration, setDuration] = useState(60);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const q = parseInt(router.query.duration, 10);
    const draft = readDraft();
    const effective = [30, 60, 90].includes(q) ? q : (draft.duration || 60);
    setDuration(effective);
    if (draft.firstName) setFirstName(draft.firstName);
    if (draft.lastName)  setLastName(draft.lastName);
    if (draft.email)     setEmail(draft.email);
    if (draft.phone)     setPhone(draft.phone);
    if (draft.birthday)  setBirthday(draft.birthday);
    if (draft.birthTime) setBirthTime(draft.birthTime);
    if (draft.question)  setQuestion(draft.question);
  }, [router.isReady, router.query.duration]);

  const tier = TIERS[duration] || TIERS[60];

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    writeDraft({
      duration,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthday: birthday || '',
      birthTime: birthTime || '',
      question: question.trim(),
    });
    router.push(`/book-a-reading/schedule?duration=${duration}`);
  }

  return (
    <>
      <SEO
        title="Your details · Book a Private Reading | Mahjong Tarot"
        description="Tell Bill a little about yourself before your private reading."
        path="/book-a-reading/details"
      />

      <main className={styles.main}>
        <div className="container">

          <div className={styles.stepper}>
            <Link href={`/book-a-reading?duration=${duration}`} className={styles.back}>
              <span aria-hidden="true">←</span> Back to choose
            </Link>
            <ol className={styles.steps}>
              <li><span className={styles.stepNum}>01</span><span className={styles.stepLabel}>Choose</span></li>
              <li className={styles.stepActive}><span className={styles.stepNum}>02</span><span className={styles.stepLabel}>Your details</span></li>
              <li><span className={styles.stepNum}>03</span><span className={styles.stepLabel}>Schedule</span></li>
              <li><span className={styles.stepNum}>04</span><span className={styles.stepLabel}>Pay</span></li>
            </ol>
          </div>

          <header className={styles.header}>
            <span className={styles.eyebrow}>Step 02 · Your details</span>
            <h1 className={styles.title}>Tell Bill <em>about you</em></h1>
            <p className={styles.lede}>
              A few details before the reading. Only your name and email are required —
              birth data and your topic help Bill prepare.
            </p>
          </header>

          <div className={styles.summaryMini}>
            <span>Private Reading · <b>{tier.label}</b> · {tier.title}</span>
            <b>${tier.price}</b>
          </div>

          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="first">First name</label>
                <input
                  className={styles.input}
                  id="first"
                  placeholder="Bill"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="last">Last name</label>
                <input
                  className={styles.input}
                  id="last"
                  placeholder="Hajdu"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel} htmlFor="email">Email</label>
              <input
                className={styles.input}
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <div className={styles.fieldHint}>// We&apos;ll send your call link and recording here.</div>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel} htmlFor="phone">
                Phone <span className={styles.opt}>(optional, for SMS reminders)</span>
              </label>
              <input
                className={styles.input}
                id="phone"
                type="tel"
                placeholder="+1 555 555 5555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="bday">
                  Birthday <span className={styles.opt}>(for your chart)</span>
                </label>
                <input
                  className={styles.input}
                  id="bday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="btime">
                  Birth time <span className={styles.opt}>(if known)</span>
                </label>
                <input
                  className={styles.input}
                  id="btime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </div>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.fieldLabel} htmlFor="question">
                What&apos;s on your mind? <span className={styles.opt}>(optional)</span>
              </label>
              <textarea
                className={styles.textarea}
                id="question"
                placeholder="A career decision, a relationship, a year ahead — whatever you'd like Bill to focus on."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={500}
              />
              <div className={styles.fieldHint}>// Up to 500 characters. You can also leave this for the call.</div>
            </div>

            {error && <div className={styles.formError}>{error}</div>}

            <button type="submit" className={styles.submitBtn}>
              Continue to schedule <span aria-hidden="true">→</span>
            </button>
          </form>

        </div>
      </main>
    </>
  );
}
