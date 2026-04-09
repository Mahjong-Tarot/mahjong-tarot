import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import NewsletterSignup from '../components/NewsletterSignup';
import styles from '../styles/MahjongMirror.module.css';

export default function TheMahjongMirror() {
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
              <Link href="#preorder" className="btn-primary">Preorder the Book</Link>
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
            <h2>Start Exploring the Wisdom<br />Hidden Inside the Mahjong Mirror</h2>
            <p>
              Sign up below to be notified when the book is available —
              and get early access to Fire Horse year insights.
            </p>
            <NewsletterSignup source="mahjong-mirror" variant="dark" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
