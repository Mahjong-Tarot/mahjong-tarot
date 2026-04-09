import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/MahjongMirror.module.css';
import form from '../styles/Forms.module.css';

export default function TheMahjongMirror() {
  const [fields, setFields] = useState({
    name: '', email: '', phone: '', address: '', format: '', message: '',
  });
  const [status, setStatus] = useState('idle');

  function update(e) {
    setFields({ ...fields, [e.target.name]: e.target.value });
  }

  async function handlePreorder(e) {
    e.preventDefault();
    setStatus('submitting');

    if (!supabase) { setStatus('error'); return; }

    const parts = [];
    if (fields.format) parts.push(`Preferred format: ${fields.format}`);
    if (fields.address) parts.push(`Address: ${fields.address}`);
    if (fields.message) parts.push(fields.message);
    const fullMessage = parts.join('\n\n') || 'Interested in preordering The Mahjong Mirror.';

    const { error } = await supabase.rpc('submit_contact', {
      p_name: fields.name,
      p_email: fields.email,
      p_phone: fields.phone || null,
      p_subject: 'Mahjong Mirror Preorder',
      p_message: fullMessage,
    });

    if (error) {
      console.error('Preorder error:', error);
      setStatus('error');
    } else {
      setStatus('success');
    }
  }
  return (
    <>
      <Head>
        <title>The Mahjong Mirror — Your Path to Wiser Decisions</title>
        <meta name="description" content="The Mahjong Mirror by Bill Hajdu. A modern divination system inspired by ancient Mahjong symbolism — guiding you toward clarity, intuition, and deeper self-discovery." />
        <meta property="og:title" content="The Mahjong Mirror — Your Path to Wiser Decisions" />
        <meta property="og:description" content="A modern divination system inspired by ancient Mahjong symbolism." />
        <meta property="og:image" content="https://mahjong-tarot.com/images/book-cover.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/the-mahjong-mirror" />
      </Head>

      <Nav />

      <main>
        {/* ── Hero ── */}
        <section className={`section-dark ${styles.hero}`}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Now Available</span>
              <h1>Unlock Your Destiny<br />Through the<br /><em>Mahjong Mirror</em></h1>
              <p className={styles.heroLead}>
                A modern divination system inspired by ancient Mahjong symbolism —
                guiding you toward clarity, intuition, and deeper self-discovery.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <Link href="#preorder" className="btn-primary">Preorder the Book</Link>
                <Link href="/readings#book" className="btn-ghost">Book a Reading</Link>
                <Link href="#newsletter" className="btn-ghost">Get Daily Fortune</Link>
              </div>
            </div>
            <div className={styles.heroCover}>
              <Image
                src="/images/book-cover.webp"
                alt="The Mahjong Mirror — Your Path to Wiser Decisions by Bill Hajdu"
                width={360}
                height={490}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </section>

        {/* ── What Is It ── */}
        <section>
          <div className={`container ${styles.whatIs}`}>
            <span className="overline">The System</span>
            <h2>What Is The Mahjong Mirror?</h2>
            <div className="divider-gold" />
            <p className={styles.lead}>
              The Mahjong Mirror is a divination method that transforms traditional
              Mahjong tiles into a symbolic language for self-reflection, where each
              tile becomes a portal representing energies, archetypes, situations,
              and life cycles — guiding you with clarity and intuition even if
              you've never played Mahjong before.
            </p>
          </div>
        </section>

        {/* ── The System ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">How Mahjong Becomes Divination</span>
              <h2>The System</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.systemGrid}>
              {[
                { title: 'The Three Suits', body: 'Circles, Bamboos, and Characters reveal energy, growth, and identity.' },
                { title: 'Honor Tiles', body: 'Winds and Dragons act as powerful forces shaping your path.' },
                { title: 'Tile Patterns', body: 'Combinations function like tarot spreads, uncovering dynamics and life lessons.' },
                { title: 'Intuitive Reading', body: 'Teaches you to recognize patterns, themes, and synchronicities.' },
              ].map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What You'll Learn ── */}
        <section>
          <div className={`container ${styles.learnLayout}`}>
            <div className={styles.learnImage}>
              <Image
                src="/images/book-tiles.webp"
                alt="Mahjong tiles alongside tarot cards"
                width={520}
                height={420}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.learnText}>
              <span className="overline">Inside the Book</span>
              <h2>What You Will Learn</h2>
              <div className="divider-gold" />
              <ul className={styles.learnList}>
                {[
                  'Decode the symbolism behind all Mahjong suits and special tiles',
                  'Perform self-readings with step-by-step guidance',
                  'Interpret emotions, decisions, relationships, and personal cycles',
                  'Understand tile patterns as messages',
                  'Practice with sample spreads and real-life examples',
                  'Strengthen intuition using a familiar, visual system',
                ].map((item) => (
                  <li key={item} className={styles.learnItem}>
                    <span className={styles.learnDot} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Why It Matters ── */}
        <section className="section-dark">
          <div className={`container ${styles.why}`}>
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Why This System Matters</span>
            <blockquote className={styles.whyQuote}>
              The Mahjong Mirror blends cultural symbolism, intuitive reading,
              and personal insight into one harmonious system — offering depth
              without complexity.
            </blockquote>
            <p>
              Divination made approachable for beginners and enriching for seasoned
              readers, while becoming a mirror that reveals both your inner truth
              and your future pathways.
            </p>
          </div>
        </section>

        {/* ── Who It's For ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Is This Book For You?</span>
              <h2>Who This Book Is For</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.audienceGrid}>
              {[
                { n: '01', label: 'Tarot and oracle readers wanting a fresh symbolic tool' },
                { n: '02', label: 'Anyone drawn to Asian-inspired spirituality' },
                { n: '03', label: 'Beginners seeking simple, visual divination' },
                { n: '04', label: 'People exploring clarity in love, purpose, or emotional growth' },
                { n: '05', label: 'Creatives, intuitives, and self-discovery seekers' },
              ].map((a) => (
                <div key={a.n} className={styles.audienceItem}>
                  <span className={styles.audienceNum}>{a.n}</span>
                  <p>{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Author ── */}
        <section>
          <div className={`container ${styles.authorLayout}`}>
            <div className={styles.authorImage}>
              <Image
                src="/images/about-portrait.webp"
                alt="Bill Hajdu — The Firepig"
                width={320}
                height={380}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.authorText}>
              <span className="overline">The Author</span>
              <h2>Bill Hajdu</h2>
              <p className={styles.authorTitle}><em>The Firepig</em></p>
              <div className="divider-gold" />
              <p>
                Drawing on decades of deep study and a sharp eye for hidden truths,
                Bill Hajdu merges ancient Chinese wisdom with modern insight to
                guide people toward clarity and balanced living. A former Air Force
                Interrogator and seasoned scholar, he empowers clients with empathy,
                authenticity, and practical steps for lasting transformation.
              </p>
              <Link href="/about" className="btn-secondary">Learn more about Bill</Link>
            </div>
          </div>
        </section>

        {/* ── Preorder CTA ── */}
        <section id="preorder" className="section-dark">
          <div className={`container ${styles.preorder}`}>
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Begin Your Journey Through the Tiles</span>
            <h2>Join the Waiting List for<br />The Mahjong Mirror</h2>
            <p>
              Be among the first to receive your copy. Fill out the form below
              and Bill will follow up with you directly.
            </p>

            {status === 'success' ? (
              <p className={form.successMsgLight}>
                You're on the list! Bill will be in touch when the book is ready.
              </p>
            ) : (
              <form className={form.bookingForm} onSubmit={handlePreorder}>
                <div className={form.bookingRow}>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="pre-name">Name *</label>
                    <input
                      id="pre-name"
                      name="name"
                      type="text"
                      className={form.inputDark}
                      value={fields.name}
                      onChange={update}
                      required
                    />
                  </div>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="pre-email">Email *</label>
                    <input
                      id="pre-email"
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
                    <label className={form.labelLight} htmlFor="pre-phone">Phone</label>
                    <input
                      id="pre-phone"
                      name="phone"
                      type="tel"
                      className={form.inputDark}
                      value={fields.phone}
                      onChange={update}
                    />
                  </div>
                  <div className={form.formGroup}>
                    <label className={form.labelLight} htmlFor="pre-format">Preferred Format</label>
                    <select
                      id="pre-format"
                      name="format"
                      className={form.select}
                      value={fields.format}
                      onChange={update}
                    >
                      <option value="">Select (optional)</option>
                      <option value="Digital">Digital</option>
                      <option value="Hard Copy">Hard Copy</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>

                <div className={form.formGroup}>
                  <label className={form.labelLight} htmlFor="pre-address">Mailing Address</label>
                  <textarea
                    id="pre-address"
                    name="address"
                    className={form.textareaDark}
                    placeholder="Required for hard copy orders"
                    rows={2}
                    value={fields.address}
                    onChange={update}
                  />
                </div>

                <div className={form.formGroup}>
                  <label className={form.labelLight} htmlFor="pre-message">Message</label>
                  <textarea
                    id="pre-message"
                    name="message"
                    className={form.textareaDark}
                    placeholder="Any questions about the book?"
                    value={fields.message}
                    onChange={update}
                  />
                </div>

                <div className={form.bookingSubmit}>
                  <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Sending…' : 'Preorder the Book'}
                  </button>
                </div>

                {status === 'error' && (
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
