import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import TrialSignup from '../components/TrialSignup';
import PaySignup from '../components/PaySignup';
import { REPORTS, PAID_PLANS } from '../lib/signup';
import styles from '../styles/Signup.module.css';

export default function Signup() {
  const router = useRouter();
  const [mode, setMode] = useState('trial');
  const [plan, setPlan] = useState('founders');

  // ?plan=yearly | lifetime | founders opens the paid checkout for that
  // plan; ?mode=pay and ?founder keep their founders meaning.
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const queryPlan = typeof q.plan === 'string' ? q.plan : '';
    if (PAID_PLANS[queryPlan]) {
      setMode('pay');
      setPlan(queryPlan);
    } else if (q.mode === 'pay' || 'founder' in q) {
      setMode('pay');
      setPlan('founders');
    } else {
      setMode('trial');
      setPlan('founders');
    }
  }, [router.isReady, router.query]);

  const membershipPlan = mode === 'pay' && plan !== 'founders';

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

                  <div className={styles.foundersCard}>
                    <div className={styles.foundersHead}>
                      <div>
                        <div className={styles.foundersEyebrow}>◆ Founders offer</div>
                        <div className={styles.foundersTitle}>
                          Pay today, lock in <em>50% off</em> for life
                        </div>
                        <div className={styles.foundersBlurb}>
                          Skip the trial, support the work, keep the founder rate every renewal,
                          and receive a <b>free digital copy of <i>The Mahjong Mirror</i></b> the
                          day it ships.
                        </div>
                      </div>
                      <div className={styles.foundersPriceWrap}>
                        <div className={styles.foundersPrice}>
                          $49.50<span className={styles.foundersStrike}>$99</span>
                        </div>
                        <div className={styles.foundersPriceLab}>Per year, locked in</div>
                      </div>
                    </div>
                    <div className={styles.foundersBonus}>
                      <div className={styles.miniCover} aria-hidden="true">
                        <div className={styles.miniCoverGlyph}>鏡</div>
                        <div className={styles.miniCoverEyebrow}>A Divination System</div>
                        <div className={styles.miniCoverTitle}>
                          The Mahjong<br /><em>Mirror</em>
                        </div>
                        <div className={styles.miniCoverAuthor}>Bill Hajdu · 2026</div>
                      </div>
                      <div className={styles.bonusText}>
                        Bonus: a free <b>digital copy</b> of <i>The Mahjong Mirror</i> sent to
                        founders the day it ships.
                        <span className={styles.bonusMeta}>DRM-free PDF + EPUB · yours to keep</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.foundersBtn}
                      onClick={() => router.push('/signup?mode=pay', undefined, { shallow: true })}
                    >
                      Claim founder rate <span aria-hidden="true">→</span>
                    </button>
                  </div>
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
