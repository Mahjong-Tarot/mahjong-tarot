import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
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
  try { return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

const DATETIME_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
});

export default function BookingPay() {
  const router = useRouter();
  const [duration, setDuration] = useState(60);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const d = readDraft();
    const q = parseInt(router.query.duration, 10);
    const effective = [30, 60, 90].includes(q) ? q : (d.duration || 60);
    setDuration(effective);

    if (!d.email)      { router.replace(`/book-a-reading/details?duration=${effective}`); return; }
    if (!d.slot_id)    { router.replace(`/book-a-reading/schedule?duration=${effective}`); return; }
    setDraft(d);
  }, [router, router.isReady, router.query.duration]);

  if (!draft) return null;

  const tier = TIERS[duration] || TIERS[60];

  async function handlePay() {
    setSubmitting(true);
    setError('');
    try {
      const r = await fetch('/api/stripe/booking-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          full_name: `${draft.firstName} ${draft.lastName}`.trim(),
          email: draft.email,
          phone: draft.phone || '',
          birthday: draft.birthday || '',
          birth_time: draft.birthTime || '',
          question: draft.question || '',
          slot_id: draft.slot_id,
          hold_token: draft.hold_token,
        }),
      });
      const json = await r.json();
      if (!r.ok || !json.url) {
        throw new Error(json.error || 'Could not start checkout.');
      }
      window.location.assign(json.url);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const slotLabel = draft.slot_start
    ? DATETIME_FMT.format(new Date(draft.slot_start))
    : 'Time on hold';

  return (
    <>
      <SEO
        title="Pay · Book a Private Reading | Mahjong Tarot"
        description="Confirm and pay for your private reading."
        path="/book-a-reading/pay"
      />
      <Nav />

      <main className={styles.main}>
        <div className="container">

          <div className={styles.stepper}>
            <Link href={`/book-a-reading/schedule?duration=${duration}`} className={styles.back}>
              <span aria-hidden="true">←</span> Back to schedule
            </Link>
            <ol className={styles.steps}>
              <li><span className={styles.stepNum}>01</span><span className={styles.stepLabel}>Choose</span></li>
              <li><span className={styles.stepNum}>02</span><span className={styles.stepLabel}>Your details</span></li>
              <li><span className={styles.stepNum}>03</span><span className={styles.stepLabel}>Schedule</span></li>
              <li className={styles.stepActive}><span className={styles.stepNum}>04</span><span className={styles.stepLabel}>Pay</span></li>
            </ol>
          </div>

          <header className={styles.header}>
            <span className={styles.eyebrow}>Step 04 · Pay</span>
            <h1 className={styles.title}>Confirm and <em>pay</em></h1>
            <p className={styles.lede}>
              You&apos;ll enter card details on Stripe&apos;s secure checkout.
              You can use a card or Apple Pay / Google Pay.
            </p>
          </header>

          <div className={styles.formCard}>
            <div style={{ marginBottom: 'var(--d-3)' }}>
              <div className={styles.summaryMini}>
                <span>Private Reading · <b>{tier.label}</b> · {tier.title}</span>
                <b>${tier.price}</b>
              </div>
              <div className={styles.summaryMini}>
                <span>Scheduled for</span>
                <b>{slotLabel}</b>
              </div>
              <div className={styles.summaryMini}>
                <span>Receipt to</span>
                <b>{draft.email}</b>
              </div>
            </div>

            {error && <div className={styles.formError}>{error}</div>}

            <button
              type="button"
              onClick={handlePay}
              disabled={submitting}
              className={styles.submitBtn}
            >
              {submitting ? 'Sending you to Stripe…' : <>Pay ${tier.price} <span aria-hidden="true">→</span></>}
            </button>

            <p className={styles.fieldHint} style={{ marginTop: '10px', textAlign: 'center' }}>
              // Secured by Stripe · Cancel and your slot is released automatically.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
