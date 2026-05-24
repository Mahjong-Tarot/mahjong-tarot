import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../../components/SEO';
import styles from '../../styles/Booking.module.css';

const STORAGE_KEY = 'mt:booking-draft:v1';

const DATETIME_FMT = new Intl.DateTimeFormat(undefined, {
  weekday: 'long', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
});

export default function BookingConfirm() {
  const router = useRouter();
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const sid = router.query.session_id;
    if (!sid) { setError('Missing session id.'); return; }

    fetch(`/api/stripe/reading-confirm?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
        // Clear the draft on success so a fresh booking starts clean.
        if (json.paid && typeof window !== 'undefined') {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch((err) => setError(err.message));
  }, [router, router.isReady, router.query.session_id]);

  const slotLabel = data?.scheduled_at
    ? DATETIME_FMT.format(new Date(data.scheduled_at))
    : null;

  return (
    <>
      <SEO
        title="Booking confirmed · Mahjong Tarot"
        description="Your Private Reading is booked."
        path="/book-a-reading/confirm"
      />

      <main className={styles.main}>
        <div className="container">

          <header className={styles.header}>
            <span className={styles.eyebrow}>Booking confirmed</span>
            <h1 className={styles.title}>
              You&apos;re on Bill&apos;s <em>calendar</em>
            </h1>
            <p className={styles.lede}>
              A receipt is on its way to your inbox. Bill will follow up with the
              call link and any prep notes before your reading.
            </p>
          </header>

          {error && (
            <div className={styles.formCard}>
              <div className={styles.formError}>{error}</div>
              <p className={styles.fieldHint}>
                If you just paid, give Stripe a few seconds and refresh.
              </p>
            </div>
          )}

          {!error && !data && (
            <div className={styles.formCard}>
              <div className={styles.slotEmpty}>Loading your booking…</div>
            </div>
          )}

          {data && (
            <div className={styles.formCard}>
              <div className={styles.summaryMini}>
                <span>Status</span>
                <b>{data.paid ? 'Paid' : 'Processing'}</b>
              </div>
              {data.duration && (
                <div className={styles.summaryMini}>
                  <span>Reading length</span>
                  <b>{data.duration} min</b>
                </div>
              )}
              {slotLabel && (
                <div className={styles.summaryMini}>
                  <span>Scheduled for</span>
                  <b>{slotLabel}</b>
                </div>
              )}
              {data.customer_email && (
                <div className={styles.summaryMini}>
                  <span>Receipt sent to</span>
                  <b>{data.customer_email}</b>
                </div>
              )}
              {typeof data.amount_total === 'number' && (
                <div className={styles.summaryMini}>
                  <span>Paid</span>
                  <b>${(data.amount_total / 100).toFixed(2)} {(data.currency || 'usd').toUpperCase()}</b>
                </div>
              )}

              <Link href="/" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                Back to home <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
