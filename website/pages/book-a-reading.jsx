import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import styles from '../styles/Booking.module.css';

const TIERS = [
  {
    duration: 30,
    mark: '30',
    markVariant: '',
    title: 'Quick Reading',
    desc: 'A focused reading on one topic. Clarity around a single decision or question.',
    meta: ['Live online', '30 min', '1-on-1'],
    price: 39,
    bullets: [
      'One topic, one question',
      'Live with Bill, online',
      'Recording sent after the call',
    ],
  },
  {
    duration: 60,
    mark: '60',
    markVariant: 'fire',
    title: 'Standard Reading',
    desc: 'Multiple topics with time to explore: relationships, work, decisions in flux. Most popular.',
    meta: ['Live online', '60 min', '1-on-1'],
    price: 59,
    bullets: [
      'Up to three topics',
      'Live with Bill, online',
      'Recording sent after the call',
    ],
    featured: true,
  },
  {
    duration: 90,
    mark: '90',
    markVariant: 'ink',
    title: 'Extended Reading',
    desc: 'A comprehensive reading across the major areas of your life. Right for periods of uncertainty or big transitions.',
    meta: ['Live online', '90 min', '1-on-1'],
    price: 99,
    bullets: [
      'Full life-area look',
      'Live with Bill, online',
      'Recording sent after the call',
    ],
  },
];

export default function BookAReading() {
  const router = useRouter();
  const [selected, setSelected] = useState(60);

  useEffect(() => {
    if (!router.isReady) return;
    const q = parseInt(router.query.duration, 10);
    if ([30, 60, 90].includes(q)) setSelected(q);
  }, [router.isReady, router.query.duration]);

  const tier = TIERS.find((t) => t.duration === selected) || TIERS[1];
  const fee = 0;
  const total = tier.price + fee;

  return (
    <>
      <SEO
        title="Book a Reading with Bill Hajdu | Mahjong Tarot"
        description="Choose your card-reading length. 30, 60, or 90 minutes, live online with Bill Hajdu."
        path="/book-a-reading"
      />
      <Nav />

      <main className={styles.main}>
        <div className="container">

          {/* Stepper */}
          <div className={styles.stepper}>
            <Link href="/" className={styles.back}>
              <span aria-hidden="true">←</span> Back to home
            </Link>
            <ol className={styles.steps}>
              <li className={styles.stepActive}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepLabel}>Choose</span>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepLabel}>Your details</span>
              </li>
              <li>
                <span className={styles.stepNum}>03</span>
                <span className={styles.stepLabel}>Schedule</span>
              </li>
              <li>
                <span className={styles.stepNum}>04</span>
                <span className={styles.stepLabel}>Pay</span>
              </li>
            </ol>
          </div>

          {/* Header */}
          <header className={styles.header}>
            <span className={styles.eyebrow}>Step 1 of 4</span>
            <h1 className={styles.title}>
              Choose your <em>reading</em>.
            </h1>
            <p className={styles.lede}>
              One product, three lengths. Pick the one that fits your question;
              you can always upgrade later.
            </p>
          </header>

          {/* Tier grid */}
          <div className={styles.tierGrid}>
            {TIERS.map((t) => (
              <button
                key={t.duration}
                type="button"
                className={`${styles.tier} ${selected === t.duration ? styles.tierSelected : ''} ${t.featured ? styles.tierFeatured : ''}`}
                onClick={() => setSelected(t.duration)}
                aria-pressed={selected === t.duration}
              >
                {t.featured && <span className={styles.tierBadge}>Most popular</span>}
                <div className={`${styles.tierMark} ${t.markVariant === 'ink' ? styles.tierMarkInk : ''} ${t.markVariant === 'fire' ? styles.tierMarkFire : ''}`}>
                  {t.mark}
                  <small>min</small>
                </div>
                <h3 className={styles.tierTitle}>{t.title}</h3>
                <p className={styles.tierDesc}>{t.desc}</p>
                <ul className={styles.tierBullets}>
                  {t.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className={styles.tierPrice}>
                  ${t.price}<small>per session</small>
                </div>
                <div className={styles.tierRadio} aria-hidden="true">
                  <span />
                </div>
              </button>
            ))}
          </div>

          {/* Summary + Continue */}
          <div className={styles.summary}>
            <div className={styles.summaryDetail}>
              <div className={styles.summaryHead}>
                <span className={styles.eyebrow}>Order summary</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{tier.title}</span>
                <span>${tier.price}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Booking fee</span>
                <span>{fee === 0 ? 'Included' : `$${fee}`}</span>
              </div>
              <div className={styles.summaryRule} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total today</span>
                <span>${total}</span>
              </div>
            </div>
            <div className={styles.summaryActions}>
              <Link
                href={`/book-a-reading/details?duration=${tier.duration}`}
                className={styles.continueBtn}
              >
                Continue <span aria-hidden="true">→</span>
              </Link>
              <p className={styles.summaryNote}>
                You won&apos;t be charged until the final step.
              </p>
            </div>
          </div>

          {/* Help */}
          <div className={styles.help}>
            <span className={styles.eyebrow}>Need help?</span>
            <p>
              Not sure which length fits? <Link href="/contact">Send Bill a note</Link> and
              he&apos;ll point you to the right one.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
