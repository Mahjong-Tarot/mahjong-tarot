import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import styles from '../styles/BookAReading.module.css';

const TIERS = [
  {
    duration: 30,
    title: 'A focused look',
    desc: 'One question, one spread. Good for a single decision.',
    price: 48,
    member: 24,
    bullets: ['One topic, one question', 'Live with Bill, online', 'Recording sent after the call'],
  },
  {
    duration: 60,
    title: 'The full mirror',
    desc: 'A complete reading across all three traditions.',
    price: 88,
    member: 44,
    bullets: ['Up to three topics', 'Live with Bill, online', 'Recording sent after the call'],
    featured: true,
  },
  {
    duration: 90,
    title: 'Deep counsel',
    desc: 'Multiple questions and your full Four Pillars chart. For big transitions.',
    price: 128,
    member: 64,
    bullets: ['Multiple questions', 'Full Four Pillars chart', 'Recording sent after the call'],
  },
];

const STEPS = [
  { title: 'Choose a length', text: 'Thirty, sixty or ninety minutes, depending on how deep you want to go.' },
  { title: 'Tell Bill a little', text: 'Your name, birth date and the question on your mind.' },
  { title: 'Pick a time', text: 'Choose a slot that suits you from Bill’s calendar.' },
  { title: 'Sit at the table', text: 'A private link arrives an hour before. The recording follows the next day.' },
];

const QUOTES = [
  { quote: 'Beautiful, intuitive, and accurate. The tiles described exactly how I felt.', name: 'Saharan Louret', location: 'Cleveland, OH' },
  { quote: 'A calming, grounding experience. I left feeling lighter and clearer.', name: 'Fabian Baracca', location: 'Minneapolis, MN' },
  { quote: 'My relationship reading was spot on. It changed how I approached our conversation.', name: 'Mouna Gonzato', location: 'Newark, NJ' },
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

  return (
    <>
      <SEO
        title="Book a Private Reading with Bill Hajdu | Mahjong Tarot"
        description="A live, one-on-one Mahjong Mirror reading with Bill Hajdu, online. 30, 60 or 90 minutes, with a recording sent after the call."
        path="/book-a-reading"
      />

      <Nav />

      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <div className={styles.eyebrow}>Private readings · live online</div>
              <h1 className={styles.title}>
                Sit at the table <em>with Bill.</em>
              </h1>
              <p className={styles.lede}>
                A live, one-on-one Mahjong Mirror reading, conducted online. Bring the
                question you keep turning over. Bill reads it from every angle, and the
                recording is yours to keep.
              </p>
              <ul className={styles.facts}>
                <li><strong>35+</strong> years reading</li>
                <li><strong>2,400+</strong> sessions</li>
                <li><strong>No</strong> Mahjong knowledge needed</li>
              </ul>
            </div>
            <figure className={styles.portrait}>
              <Image
                src="/images/about-portrait.webp"
                alt="Bill Hajdu at the reading table"
                width={520}
                height={620}
                sizes="(max-width: 900px) 90vw, 440px"
                priority
              />
            </figure>
          </div>
        </section>

        {/* 01 Choose */}
        <section className={styles.band}>
          <div className="container">
            <div className={styles.secLabel}>
              <span className={styles.secLabelMain}>01 · Choose your reading</span>
              <span>All readings are live, one-on-one</span>
            </div>

            <div className={styles.tiers} role="radiogroup" aria-label="Reading length">
              {TIERS.map((t) => {
                const on = selected === t.duration;
                return (
                  <button
                    key={t.duration}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={`${styles.tier} ${on ? styles.tierOn : ''}`}
                    onClick={() => setSelected(t.duration)}
                  >
                    <div className={styles.tierTop}>
                      <span className={styles.tierLen}>
                        {t.duration}<small>min</small>
                      </span>
                      {t.featured && <span className={styles.tierFlag}>Most chosen</span>}
                    </div>
                    <span className={styles.tierTitle}>{t.title}</span>
                    <span className={styles.tierDesc}>{t.desc}</span>
                    <ul className={styles.tierList}>
                      {t.bullets.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                    <span className={styles.tierPrice}>${t.price}</span>
                    <span className={styles.tierMember}>Members ${t.member}</span>
                    <span className={styles.tierPick} aria-hidden="true">
                      {on ? 'Selected' : 'Choose'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <div className={styles.summaryText}>
                <div className={styles.summaryLabel}>Your reading</div>
                <div className={styles.summaryTitle}>
                  {tier.title} · {tier.duration} minutes
                </div>
                <div className={styles.summaryNote}>
                  ${tier.price}, no booking fee. You won&apos;t be charged until the last step.
                </div>
              </div>
              <Link
                href={`/book-a-reading/details?duration=${tier.duration}`}
                className={styles.continue}
              >
                Continue to your details <span aria-hidden="true">→</span>
              </Link>
            </div>

            <p className={styles.memberNote}>
              Members pay half: ${TIERS[0].member}, ${TIERS[1].member} or ${TIERS[2].member}.{' '}
              <Link href="/membership">See membership</Link>
            </p>
          </div>
        </section>

        {/* 02 How it works */}
        <section className={`${styles.band} ${styles.grey}`}>
          <div className="container">
            <div className={styles.secLabel}>
              <span className={styles.secLabelMain}>02 · How it works</span>
              <span>About two minutes to book</span>
            </div>
            <ol className={styles.steps}>
              {STEPS.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.stepTitle}>{s.title}</span>
                  <span className={styles.stepText}>{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 03 What clients say */}
        <section className={styles.band}>
          <div className="container">
            <div className={styles.secLabel}>
              <span className={styles.secLabelMain}>03 · What clients say</span>
            </div>
            <div className={styles.quotes}>
              {QUOTES.map((q) => (
                <blockquote key={q.name} className={styles.quote}>
                  <p>&ldquo;{q.quote}&rdquo;</p>
                  <footer>{q.name}, {q.location}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className={`${styles.band} ${styles.pink}`}>
          <div className={`container ${styles.closing}`}>
            <h2 className={styles.h2}>
              Not sure which to choose? <em>Start with your free chart.</em>
            </h2>
            <div className="cta-row">
              <Link href="/chart" className="btn-primary btn-lg">Show my chart</Link>
              <Link href="/contact" className={styles.btnOutline}>Ask Bill a question</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
