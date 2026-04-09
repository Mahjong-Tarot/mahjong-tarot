import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/Readings.module.css';
import form from '../styles/Forms.module.css';

const CHINESE_SIGNS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

export default function Readings() {
  const [fields, setFields] = useState({
    name: '', email: '', phone: '', sign: '', birthday: '', message: '',
  });
  const [bookingStatus, setBookingStatus] = useState('idle');

  function update(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  async function handleBooking(e) {
    e.preventDefault();
    setBookingStatus('submitting');

    const { error } = await supabase.rpc('submit_booking', {
      p_name: fields.name,
      p_email: fields.email,
      p_reading_type_slug: 'mahjong-mirror-session',
      p_phone: fields.phone || null,
      p_chinese_sign: fields.sign || null,
      p_birthday: fields.birthday || null,
      p_message: fields.message || null,
    });

    if (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
    } else {
      setBookingStatus('success');
    }
  }

  return (
    <>
      <Head>
        <title>Personal Readings — Mahjong Tarot</title>
        <meta name="description" content="Book a Mahjong Tarot reading with Bill Hajdu. One-Tile Insight (10–15 min), Three-Tile Spread (20–30 min), or The Mahjong Mirror Session (45–60 min). Conducted online." />
        <meta property="og:title" content="Personal Readings — Mahjong Tarot" />
        <meta property="og:description" content="A divination experience using the symbolic language of Mahjong tiles to illuminate your path." />
        <meta property="og:image" content="https://mahjong-tarot.com/images/readings-hero.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/readings" />
      </Head>

      <Nav />

      <main>
        {/* ── Page Header ── */}
        <section className={`section-dark ${styles.pageHeader}`}>
          <div className="container">
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Personal Sessions</span>
            <h1>Receive Guidance Through<br />a Mahjong Tarot Reading</h1>
            <p className={styles.headerLead}>
              A divination experience using the symbolic language of Mahjong tiles
              to illuminate your path, clarify your choices, and connect you with
              deeper intuition.
            </p>
          </div>
        </section>

        {/* ── What is a Reading ── */}
        <section>
          <div className={`container ${styles.whatIs}`}>
            <div className={styles.whatIsImage}>
              <Image
                src="/images/readings-hero.webp"
                alt="Bill Hajdu conducting a Mahjong Tarot reading with a client"
                width={560}
                height={420}
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className={styles.whatIsText}>
              <span className="overline">The Practice</span>
              <h2>What Is a Mahjong Tarot Reading?</h2>
              <div className="divider-gold" />
              <p>
                A Mahjong Tarot reading transforms the familiar imagery of Mahjong
                tiles into a symbolic map of energy, insight, and direction, where
                each tile carries its own story representing influences,
                opportunities, emotional patterns, or emerging possibilities.
              </p>
              <p>
                Like tarot, it reveals what lies beneath the surface. Yet unlike
                tarot, it speaks through a visual language rooted in East Asian
                symbolism — blending intuition with timeless archetypes to offer
                honest, meaningful guidance for love, career, healing, and life
                transitions.
              </p>
            </div>
          </div>
        </section>

        {/* ── Types of Readings ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Choose Your Session</span>
              <h2>Types of Readings</h2>
              <div className="divider-gold centered" />
            </div>

            <div className={styles.readingTypes}>
              <div id="one-tile" className={styles.readingCard}>
                <div className={styles.readingMeta}>
                  <span className="overline">10–15 minutes</span>
                  <span className={styles.readingLabel}>Quick Guidance</span>
                </div>
                <h3>One-Tile Insight</h3>
                <p>
                  A simple yet powerful message drawn from a single tile, ideal
                  for yes or no questions, emotional check-ins, or moments when
                  you need one clear truth.
                </p>
                <Link href="#book" className="btn-secondary">Book this session</Link>
              </div>

              <div id="three-tile" className={styles.readingCard}>
                <div className={styles.readingMeta}>
                  <span className="overline">20–30 minutes</span>
                  <span className={styles.readingLabel}>Past · Present · Near Future</span>
                </div>
                <h3>Three-Tile Spread</h3>
                <p>
                  This reading explores the flow of energy around your situation
                  through Past Influence, Present Energy, and Near Future
                  Direction — offering a balanced and focused perspective that
                  brings clarity to decisions and life transitions.
                </p>
                <Link href="#book" className="btn-secondary">Book this session</Link>
              </div>

              <div id="mirror-session" className={`${styles.readingCard} ${styles.readingCardFeatured}`}>
                <div className={styles.readingMeta}>
                  <span className="overline" style={{ color: 'var(--celestial-gold)' }}>45–60 minutes</span>
                  <span className={styles.readingLabelLight}>Deep Insight Reading</span>
                </div>
                <h3>The Mahjong Mirror Session</h3>
                <p>
                  A deep, intuitive reading that looks into your emotional,
                  spiritual, and practical life, revealing hidden influences,
                  current challenges, energetic strengths, possible outcomes,
                  and key lessons. Ideal for relationship dynamics, life purpose
                  exploration, long-term planning, or periods of uncertainty.
                </p>
                <Link href="#book" className="btn-ghost">Book this session</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">The Process</span>
              <h2>How a Reading Works</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.steps}>
              {[
                {
                  n: '01',
                  title: 'Set Your Intention',
                  body: 'Choose your focus: love, career, healing, conflict, clarity, next steps, or an open reading.',
                },
                {
                  n: '02',
                  title: 'The Tiles Are Drawn',
                  body: 'Tiles are pulled intuitively, revealing energies, symbols, and patterns tied to your question.',
                },
                {
                  n: '03',
                  title: 'Interpretation & Reflection',
                  body: 'You receive a clear reading that explains each tile, the overall message, and actionable guidance.',
                },
              ].map((s) => (
                <div key={s.n} className={styles.step}>
                  <span className={styles.stepNumber}>{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What You Gain ── */}
        <section className="section-stone">
          <div className={`container ${styles.gainLayout}`}>
            <div>
              <span className="overline">What You'll Receive</span>
              <h2>What You'll Gain</h2>
              <div className="divider-gold" />
              <ul className={styles.gainList}>
                {[
                  'Clarity around your situation or question',
                  'Insight into emotional and energetic dynamics',
                  'Understanding of potential outcomes or timing',
                  'Validation for feelings and intuition',
                  'A fresh perspective rooted in symbolic wisdom',
                  'Grounded guidance to help you move forward',
                ].map((item) => (
                  <li key={item} className={styles.gainItem}>
                    <span className={styles.gainDot} />
                    {item}
                  </li>
                ))}
              </ul>
              <blockquote className={styles.gainQuote}>
                A reading is not just prediction — it's reflection, empowerment,
                and alignment.
              </blockquote>
            </div>
            <div className={styles.gainImage}>
              <Image
                src="/images/readings-session.webp"
                alt="Client choosing Mahjong tiles during a reading"
                width={480}
                height={560}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Client Experiences</span>
              <h2>Testimonials</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.testimonials}>
              {[
                { quote: 'Beautiful, intuitive, and accurate. The tiles described exactly how I felt.', name: 'Saharan Louret', location: 'OH' },
                { quote: 'A calming, grounding experience. I left feeling lighter and clearer.', name: 'Fabian Baracca', location: 'MN' },
                { quote: 'My relationship reading was spot on. It changed how I approached our conversation.', name: 'Mouna Gonzato', location: 'NJ' },
              ].map((t) => (
                <blockquote key={t.name} className={styles.testimonial}>
                  <p>"{t.quote}"</p>
                  <footer>— {t.name}, {t.location}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Common Questions</span>
              <h2>Frequently Asked Questions</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.faq}>
              {[
                { q: 'Do I need to know how to play Mahjong?', a: 'Not at all. The system uses symbolic meanings, not game rules.' },
                { q: 'Can I ask specific questions?', a: 'Yes, your question or theme helps guide the reading.' },
                { q: 'How should I prepare?', a: 'Arrive relaxed, and think about what you most want clarity on.' },
                { q: 'Is the reading live or written?', a: 'Sessions are typically live; written readings may be offered by request.' },
                { q: 'Can I record the session?', a: "Yes, you're welcome to keep a recording for personal use." },
              ].map((item) => (
                <div key={item.q} className={styles.faqItem}>
                  <h4>{item.q}</h4>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Book a Reading ── */}
        <section id="book" className="section-dark">
          <div className={`container ${styles.bookCta}`}>
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Begin Your Journey</span>
            <h2>Ready to See What the Tiles Reveal?</h2>
            <p>
              Fill out the form below to request a Mahjong Mirror Session.
              Bill will follow up to confirm your reading.
            </p>

            {bookingStatus === 'success' ? (
              <p className={form.successMsgLight}>
                Thank you! Bill will be in touch soon to schedule your session.
              </p>
            ) : (
              <form className={form.bookingForm} onSubmit={handleBooking}>
                <div className={form.bookingRow}>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="book-name">Name *</label>
                    <input
                      id="book-name"
                      name="name"
                      type="text"
                      className={form.inputDark}
                      value={fields.name}
                      onChange={update}
                      required
                    />
                  </div>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="book-email">Email *</label>
                    <input
                      id="book-email"
                      name="email"
                      type="email"
                      className={form.inputDark}
                      value={fields.email}
                      onChange={update}
                      required
                    />
                  </div>
                </div>

                <div className={form.bookingRow}>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="book-phone">Phone</label>
                    <input
                      id="book-phone"
                      name="phone"
                      type="tel"
                      className={form.inputDark}
                      value={fields.phone}
                      onChange={update}
                    />
                  </div>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="book-sign">Chinese Sign</label>
                    <select
                      id="book-sign"
                      name="sign"
                      className={form.select}
                      value={fields.sign}
                      onChange={update}
                    >
                      <option value="">Select (optional)</option>
                      {CHINESE_SIGNS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={form.formGroup}>
                  <label className={form.labelLight} htmlFor="book-birthday">Birthday</label>
                  <input
                    id="book-birthday"
                    name="birthday"
                    type="date"
                    className={form.inputDark}
                    value={fields.birthday}
                    onChange={update}
                  />
                </div>

                <div className={form.formGroup}>
                  <label className={form.labelLight} htmlFor="book-message">Message</label>
                  <textarea
                    id="book-message"
                    name="message"
                    className={form.textareaDark}
                    placeholder="What would you like guidance on?"
                    value={fields.message}
                    onChange={update}
                  />
                </div>

                <div className={form.bookingSubmit}>
                  <button type="submit" className="btn-primary" disabled={bookingStatus === 'submitting'}>
                    {bookingStatus === 'submitting' ? 'Sending…' : 'Request a Reading'}
                  </button>
                </div>

                {bookingStatus === 'error' && (
                  <p className={form.errorText}>Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
