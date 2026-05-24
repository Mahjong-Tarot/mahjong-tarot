import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../../../components/SEO';
import { BOOK_SKUS, BOOK_SKU_ORDER, formatBookPrice } from '../../../lib/books';
import styles from '../../../styles/Booking.module.css';

const SKU_MARK = {
  digital:       { mark: 'D',  variant: '' },
  hardcopy:      { mark: 'H',  variant: 'ink' },
  signed_bundle: { mark: 'S+', variant: 'fire' },
};

export default function OrderBook() {
  const router = useRouter();
  const [selected, setSelected] = useState('hardcopy');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.sku;
    if (typeof q === 'string' && BOOK_SKUS[q]) setSelected(q);
    if (router.query.checkout === 'cancel') {
      setError('Payment was cancelled. Pick an option to try again.');
    }
  }, [router.isReady, router.query.sku, router.query.checkout]);

  const tier = BOOK_SKUS[selected];
  const total = tier.amount_cents;

  const tiers = useMemo(() => BOOK_SKU_ORDER.map((s) => BOOK_SKUS[s]), []);

  async function handleContinue() {
    setError('');
    setSubmitting(true);
    try {
      const r = await fetch('/api/stripe/book-purchase-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: selected, email: email.trim() || undefined }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || 'Could not start checkout.');
      window.location.href = json.url;
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <SEO
        title="Pre-Order The Mahjong Mirror by Bill Hajdu"
        description="Pre-order The Mahjong Mirror — digital edition, hardcopy, or signed hardcopy with the Mahjong Mirror Card Set."
        path="/the-mahjong-mirror/order"
      />

      <main className={styles.main}>
        <div className="container">
          <div className={styles.stepper}>
            <Link href="/the-mahjong-mirror" className={styles.back}>
              <span aria-hidden="true">←</span> Back to the book
            </Link>
            <ol className={styles.steps}>
              <li className={styles.stepActive}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepLabel}>Choose</span>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepLabel}>Pay</span>
              </li>
            </ol>
          </div>

          <header className={styles.header}>
            <span className={styles.eyebrow}>Pre-order</span>
            <h1 className={styles.title}>
              The <em>Mahjong Mirror</em>,<br />your way
            </h1>
            <p className={styles.lede}>
              Three ways to receive the book. Choose digital for an instant
              copy when the book launches, hardcopy to hold the printed
              edition, or the signed bundle with the Mahjong Mirror Card Set.
            </p>
          </header>

          <div className={styles.tierGrid}>
            {tiers.map((t) => {
              const isSelected = selected === t.sku;
              const meta = SKU_MARK[t.sku];
              const featured = t.sku === 'signed_bundle';
              return (
                <button
                  key={t.sku}
                  type="button"
                  className={`${styles.tier} ${isSelected ? styles.tierSelected : ''} ${featured ? styles.tierFeatured : ''}`}
                  onClick={() => setSelected(t.sku)}
                  aria-pressed={isSelected}
                >
                  {featured && <span className={styles.tierBadge}>Limited bundle</span>}
                  <div className={`${styles.tierMark} ${meta.variant === 'ink' ? styles.tierMarkInk : ''} ${meta.variant === 'fire' ? styles.tierMarkFire : ''}`}>
                    {meta.mark}
                    <small>{t.delivery_label.replace('Delivered ', '').replace('Ships ', '')}</small>
                  </div>
                  <h3 className={styles.tierTitle}>{t.label}</h3>
                  <p className={styles.tierDesc}>{t.blurb}</p>
                  <ul className={styles.tierBullets}>
                    {t.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                  <div className={styles.tierPrice}>
                    {formatBookPrice(t.amount_cents)}<small>one-time</small>
                  </div>
                  <div className={styles.tierRadio} aria-hidden="true">
                    <span />
                  </div>
                </button>
              );
            })}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryDetail}>
              <div className={styles.summaryHead}>
                <span className={styles.eyebrow}>Order summary</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{tier.label}</span>
                <span>{formatBookPrice(tier.amount_cents)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{tier.delivery_label}</span>
                <span>{tier.requires_shipping ? 'Shipping at checkout' : 'No shipping'}</span>
              </div>
              <div className={styles.summaryRule} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total today</span>
                <span>{formatBookPrice(total)}</span>
              </div>

              <div className={styles.field} style={{ marginTop: 'var(--d-3)' }}>
                <label className={styles.fieldLabel} htmlFor="order-email">
                  Email <span className={styles.opt}>(optional, pre-fills checkout)</span>
                </label>
                <input
                  id="order-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={styles.summaryActions}>
              <button
                type="button"
                onClick={handleContinue}
                disabled={submitting}
                className={styles.continueBtn}
              >
                {submitting ? 'Starting checkout…' : (<>Continue to payment <span aria-hidden="true">→</span></>)}
              </button>
              {error && <div className={styles.formError} style={{ marginTop: 12 }}>{error}</div>}
              <p className={styles.summaryNote}>
                Secure checkout by Stripe. You&apos;ll be charged today and
                receive your copy on the delivery date shown above.
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
