import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import TrialSignup from '../components/TrialSignup';
import PaySignup from '../components/PaySignup';
import { REPORTS, PAID_PLANS } from '../lib/signup';
import styles from '../styles/Signup.module.css';

export default function Signup() {
  const router = useRouter();
  const [mode, setMode] = useState('trial');
  const [plan, setPlan] = useState('yearly');

  // ?plan=yearly | lifetime opens the paid checkout for that plan. Old
  // ?mode=pay and ?founder links open the yearly checkout.
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const queryPlan = typeof q.plan === 'string' ? q.plan : '';
    if (PAID_PLANS[queryPlan]) {
      setMode('pay');
      setPlan(queryPlan);
    } else if (q.mode === 'pay' || 'founder' in q || q.plan === 'founders') {
      setMode('pay');
      setPlan('yearly');
    } else {
      setMode('trial');
      setPlan('yearly');
    }
  }, [router.isReady, router.query]);

  const membershipPlan = mode === 'pay';

  return (
    <>
      <SEO
        title="Get Premium Access · Mahjong Tarot Member Area"
        description="Open your Mahjong Tarot Member Area. Free for 90 days, no credit card required. Six digital reports, the full deck library, journal archive, and member pricing on live readings."
        path="/signup"
      />

      <main className={styles.main}>
        <div className="container">

          <div className={styles.signup}>

            {/* LEFT: pitch */}
            <section className={styles.pitch}>
              <span className={styles.eyebrow}>Member Area</span>
              {membershipPlan ? (
                <>
                  <h1 className={styles.h1}>
                    {plan === 'lifetime' ? <>Yours <em>for life</em></> : <>A year of <em>unlimited readings</em></>}
                  </h1>
                  <p className={styles.lede}>
                    {plan === 'lifetime'
                      ? 'One payment of $299. Every reading, the almanac and your inner circle, with nothing to renew.'
                      : 'Join once and read as often as you like, for you and the people you care about. $99 a year.'}
                  </p>
                  <div className={styles.priceCard}>
                    {plan === 'lifetime' ? (
                      <>
                        <div className={styles.priceRow}>
                          <div className={styles.priceLabel}>
                            Everything, for life
                            <small>Every reading, the almanac and your inner circle</small>
                          </div>
                          <div className={styles.priceNow}>$299<small>One time</small></div>
                        </div>
                        <div className={styles.priceRow}>
                          <div className={styles.priceLabel}>
                            A one-hour consultation with Bill
                            <small>Live and one-on-one, included</small>
                          </div>
                          <div className={styles.priceLater}>$88<small>Value</small></div>
                        </div>
                        <div className={styles.priceRow}>
                          <div className={styles.priceLabel}>
                            An autographed copy of the book
                            <small>The Mahjong Mirror, signed by Bill</small>
                          </div>
                          <div className={styles.priceLater}>Included</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.priceRow}>
                          <div className={styles.priceLabel}>
                            Yearly membership
                            <small>Unlimited readings and relationship comparisons</small>
                          </div>
                          <div className={styles.priceNow}>$99<small>Per year</small></div>
                        </div>
                        <div className={styles.priceRow}>
                          <div className={styles.priceLabel}>
                            A free copy of The Mahjong Mirror
                            <small>The digital edition, yours for joining</small>
                          </div>
                          <div className={styles.priceLater}>Free</div>
                        </div>
                        <div className={styles.priceRow}>
                          <div className={styles.priceLabel}>
                            Half off a personal reading with Bill
                            <small>30 min $24 · 60 min $44 · 90 min $64</small>
                          </div>
                          <div className={styles.priceLater}>Member price</div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h1 className={styles.h1}>
                    Unlock <em>Premium Access</em>
                  </h1>
                  <p className={styles.lede}>
                    Your private door into Bill&apos;s work. Free for 90 days. No credit card required.
                  </p>

                  <div className={styles.badges}>
                    <span className={styles.badge}><span className={styles.badgePip} />Free for 90 days</span>
                    <span className={`${styles.badge} ${styles.badgeInk}`}><span className={styles.badgePip} />No credit card required</span>
                  </div>

                  <div className={styles.priceCard}>
                    <div className={styles.priceRow}>
                      <div className={styles.priceLabel}>
                        First 90 days
                        <small>Full Member Area access, no commitment</small>
                      </div>
                      <div className={styles.priceNow}>
                        $0<small>Today</small>
                      </div>
                    </div>
                    <div className={styles.priceRow}>
                      <div className={styles.priceLabel}>
                        Annual membership
                        <small>After your trial, only if you choose to continue</small>
                      </div>
                      <div className={styles.priceLater}>
                        $99<small>per year</small>
                      </div>
                    </div>
                  </div>

                  <Link href="/membership" className={styles.compareLink}>
                    See membership: $99 a year or $299 for life <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}

              <div className={styles.reportsHead}>
                <span className={styles.pip} />
                Six digital reports, included
              </div>
              <ul className={styles.reportsList}>
                {REPORTS.map((r) => (
                  <li key={r.name} className={styles.reportItem}>
                    <span className={styles.reportMark}>{r.glyph}</span>
                    <span><b>{r.name}.</b> {r.desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* RIGHT: form */}
            <section>
              {mode === 'pay' ? <PaySignup plan={plan} /> : <TrialSignup />}
            </section>

          </div>

          {/* Trust strip */}
          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <div className={styles.trustNum}><em>35</em>+</div>
              <div className={styles.trustLab}>Years of practice</div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustNum}>2,400+</div>
              <div className={styles.trustLab}>Sessions read</div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustNum}>42</div>
              <div className={styles.trustLab}>Cards in the deck</div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
