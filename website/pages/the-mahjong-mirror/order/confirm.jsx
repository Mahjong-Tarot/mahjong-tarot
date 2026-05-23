import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../../../components/SEO';
import styles from '../../../styles/Booking.module.css';

export default function BookOrderConfirm() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const sid = router.query.session_id;
    if (!sid) { setError('Missing session id.'); return; }

    fetch(`/api/stripe/book-confirm?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err.message));
  }, [router, router.isReady, router.query.session_id]);

  return (
    <>
      <SEO
        title="Pre-order confirmed · The Mahjong Mirror"
        description="Your pre-order for The Mahjong Mirror is confirmed."
        path="/the-mahjong-mirror/order/confirm"
      />

      <main className={styles.main}>
        <div className="container">

          <header className={styles.header}>
            <span className={styles.eyebrow}>Pre-order confirmed</span>
            <h1 className={styles.title}>
              Your copy of <em>The Mahjong Mirror</em> is reserved
            </h1>
            <p className={styles.lede}>
              A receipt is on its way to your inbox. Bill will follow up before
              your delivery date with any details he needs.
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
              <div className={styles.slotEmpty}>Loading your order…</div>
            </div>
          )}

          {data && (
            <div className={styles.formCard}>
              <div className={styles.summaryMini}>
                <span>Status</span>
                <b>{data.paid ? 'Paid' : 'Processing'}</b>
              </div>
              {data.label && (
                <div className={styles.summaryMini}>
                  <span>Edition</span>
                  <b>{data.label}</b>
                </div>
              )}
              {data.delivery_label && (
                <div className={styles.summaryMini}>
                  <span>Delivery</span>
                  <b>{data.delivery_label}</b>
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

              <Link href="/the-mahjong-mirror" className={styles.submitBtn} style={{ textDecoration: 'none' }}>
                Back to the book <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
