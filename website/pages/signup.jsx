import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SEO from '../components/SEO';
import styles from '../styles/Signup.module.css';

const REPORTS = [
  {
    glyph: '日',
    name: 'Daily Almanac',
    desc: "The day's auspicious and inauspicious activities, drawn from the Chinese almanac, tuned to today's energy.",
  },
  {
    glyph: '運',
    name: 'Daily Horoscope',
    desc: 'A reading for your sign, refreshed every day. Short, specific, and grounded in the tradition rather than generic.',
  },
  {
    glyph: '紫',
    name: 'Purple Star',
    desc: 'Your Zi Wei Dou Shu chart, the most detailed system in Chinese astrology, mapped across the twelve palaces of life.',
  },
  {
    glyph: '三',
    name: 'Three Blessings',
    desc: 'Fu, Lu, Shou, your reading on fortune, prosperity, and longevity, and how each is moving for you this year.',
  },
  {
    glyph: '合',
    name: 'Compatibility Calculator',
    desc: 'Run any two birth charts side by side: relationships, business partners, family. See where you align and where you grind.',
  },
  {
    glyph: '柱',
    name: 'Four Pillars Chart',
    desc: 'Your full Bazi chart, year, month, day, and hour, with element balance, favorable elements, and luck-pillar timeline.',
  },
];

export default function Signup() {
  const router = useRouter();
  const [mode, setMode] = useState('trial');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (q.mode === 'pay' || 'founder' in q) setMode('pay');
  }, [router.isReady, router.query]);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 600);
  }

  return (
    <>
      <SEO
        title="Get Premium Access · Mahjong Tarot Member Area"
        description="Open your Mahjong Tarot Member Area. Free for 90 days, no credit card required. Six digital reports, the full deck library, journal archive, and member pricing on live readings."
        path="/signup"
      />

      {/* Funnel-locked nav */}
      <header className={`container ${styles.navBar}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logomark} />
          Mahjong Tarot
        </Link>
        <div className={styles.navStep}>
          <span className={styles.pip} />
          Member Area sign up
        </div>
        <Link href="/sign-in" className={styles.navBack}>Already a member? Sign in</Link>
      </header>

      <main className={styles.main}>
        <div className="container">

          <div className={styles.signup}>

            {/* LEFT: pitch */}
            <section className={styles.pitch}>
              <span className={styles.eyebrow}>Member Area</span>
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
                  onClick={() => setMode('pay')}
                >
                  Claim founder rate <span aria-hidden="true">→</span>
                </button>
              </div>

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
              <form
                className={`${styles.formCard} ${mode === 'pay' ? styles.formPay : styles.formTrial}`}
                onSubmit={handleSubmit}
              >
                {mode === 'pay' && (
                  <div className={styles.modeBanner}>
                    <div>
                      <div className={styles.modeBannerEyebrow}>◆ Founders checkout</div>
                      <div className={styles.modeBannerTitle}>$49.50 today, locked in for life.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('trial')}
                      className={styles.modeBannerBack}
                    >
                      Use free trial instead
                    </button>
                  </div>
                )}

                <h2 className={styles.formH}>
                  {mode === 'pay' ? <>Become a <em>founder</em></> : <>Start your <em>90 days</em></>}
                </h2>
                <div className={styles.formSub}>
                  {mode === 'pay'
                    ? '// Account + payment, takes about two minutes'
                    : '// Step 1 of 1, takes about a minute'}
                </div>

                {success ? (
                  <div className={styles.success}>
                    <div className={styles.successPip} />
                    <h3>You&apos;re in</h3>
                    <p>
                      {mode === 'pay'
                        ? 'Welcome, founder. Your $49.50 charge has been processed and your member link is on its way.'
                        : 'Welcome to the Member Area. A confirmation has been sent to your email.'}
                    </p>
                    <Link href="/dashboard" className={styles.successCta}>
                      Open the Member Area <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} htmlFor="first">First name</label>
                        <input className={styles.input} id="first" placeholder="Bill" required />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} htmlFor="last">Last name</label>
                        <input className={styles.input} id="last" placeholder="Hajdu" required />
                      </div>
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                      <label className={styles.fieldLabel} htmlFor="email">Email</label>
                      <input className={styles.input} id="email" type="email" placeholder="your@email.com" required />
                      <div className={styles.fieldHint}>// We send your member link here, never anything else.</div>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} htmlFor="bday">
                          Birthday <span className={styles.opt}>(for your chart)</span>
                        </label>
                        <input className={styles.input} id="bday" type="date" />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} htmlFor="btime">
                          Birth time <span className={styles.opt}>(if known, for the Hour Pillar)</span>
                        </label>
                        <input className={styles.input} id="btime" type="time" />
                      </div>
                    </div>

                    <div className={`${styles.field} ${styles.fieldFull}`}>
                      <label className={styles.fieldLabel} htmlFor="pw">Choose a password</label>
                      <input className={styles.input} id="pw" type="password" placeholder="At least 8 characters" required />
                    </div>

                    {mode === 'pay' && (
                      <div className={styles.payBlock}>
                        <div className={styles.payHeader}>
                          <span className={styles.payEyebrow}>Payment</span>
                          <span className={styles.paySecure}>
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="7" width="10" height="7" rx="1" />
                              <path d="M5 7V5a3 3 0 016 0v2" />
                            </svg>
                            Secured by Stripe
                          </span>
                        </div>
                        <div className={`${styles.field} ${styles.fieldFull}`}>
                          <label className={styles.fieldLabel} htmlFor="card">Card number</label>
                          <input className={`${styles.input} ${styles.monoInput}`} id="card" placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" />
                        </div>
                        <div className={styles.formGrid}>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="exp">Expiry</label>
                            <input className={`${styles.input} ${styles.monoInput}`} id="exp" placeholder="MM / YY" autoComplete="cc-exp" />
                          </div>
                          <div className={styles.field}>
                            <label className={styles.fieldLabel} htmlFor="cvc">CVC</label>
                            <input className={`${styles.input} ${styles.monoInput}`} id="cvc" placeholder="123" inputMode="numeric" autoComplete="cc-csc" />
                          </div>
                        </div>
                        <div className={`${styles.field} ${styles.fieldFull}`}>
                          <label className={styles.fieldLabel} htmlFor="zip">Billing ZIP / Postal code</label>
                          <input className={`${styles.input} ${styles.monoInput}`} id="zip" placeholder="94110" autoComplete="postal-code" />
                        </div>
                        <div className={styles.orderSummary}>
                          <div className={styles.orderRow}>
                            <span>Founders Membership</span>
                            <span>$49.50</span>
                          </div>
                          <div className={`${styles.orderRow} ${styles.orderMeta}`}>
                            <span>Annual, locked in for life. Cancel anytime.</span>
                            <span className={styles.strikePrice}>$99.00</span>
                          </div>
                          <div className={`${styles.orderRow} ${styles.orderTotal}`}>
                            <span>Total today</span>
                            <span>$49.50</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className={styles.checkRow}>
                      <input className={styles.checkbox} type="checkbox" defaultChecked />
                      <span>Email me occasional updates from Bill. Twice a month at most.</span>
                    </label>
                    <label className={styles.checkRow}>
                      <input className={styles.checkbox} type="checkbox" required />
                      <span>I agree to the <Link href="/contact">Terms</Link> and <Link href="/contact">Privacy Policy</Link>.</span>
                    </label>

                    <button className={styles.submitBtn} type="submit" disabled={submitting}>
                      {submitting
                        ? 'Just a moment...'
                        : mode === 'pay'
                        ? <>Pay $49.50 and become a founder <span aria-hidden="true">→</span></>
                        : <>Open my Member Area <span aria-hidden="true">→</span></>}
                    </button>

                    <div className={styles.reassure}>
                      <span className={styles.reassureItem}>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="7" width="10" height="7" rx="1" />
                          <path d="M5 7V5a3 3 0 016 0v2" />
                        </svg>
                        No credit card
                      </span>
                      <span className={styles.reassureItem}>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="8" cy="8" r="6" />
                          <path d="M8 5v3l2 1.5" />
                        </svg>
                        90 free days
                      </span>
                      <span className={styles.reassureItem}>
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 4l6-2 6 2v5c0 3-3 5-6 6-3-1-6-3-6-6V4z" />
                        </svg>
                        Cancel anytime
                      </span>
                    </div>

                    <div className={styles.loginLine}>
                      Already a member? <Link href="/sign-in">Sign in</Link>
                    </div>
                  </>
                )}
              </form>
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

      <footer className={styles.foot}>
        <div className="container">
          <div className={styles.footInner}>
            <div><span className={styles.pip} />© {new Date().getFullYear()} Mahjong Tarot · Bill Hajdu</div>
            <div>Ancient Cards. Modern Insight.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
