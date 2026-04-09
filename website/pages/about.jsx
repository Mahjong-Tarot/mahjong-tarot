import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import styles from '../styles/About.module.css';

export default function About() {
  return (
    <>
      <Head>
        <title>About Bill Hajdu — Mahjong Tarot</title>
        <meta name="description" content="Meet Bill Hajdu — The Firepig. 35+ years of divination practice combining Chinese astrology, Mahjong tile readings, and tarot. Former Air Force Interrogator and lifelong student of ancient wisdom." />
        <meta property="og:title" content="About Bill Hajdu — Mahjong Tarot" />
        <meta property="og:description" content="35+ years of divination practice. Ancient wisdom, modern clarity." />
        <meta property="og:image" content="https://mahjong-tarot.com/images/about-portrait.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/about" />
      </Head>

      <Nav />

      <main>
        {/* ── Page Header ── */}
        <section className={`section-dark ${styles.pageHeader}`}>
          <div className="container">
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Meet the Firepig</span>
            <h1>Bill Hajdu</h1>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link href="/readings#book" className="btn-primary">Book a Reading</Link>
              <Link href="/the-mahjong-mirror#preorder" className="btn-ghost">Preorder the Book</Link>
              <Link href="/contact" className="btn-ghost">Contact the Firepig</Link>
            </div>
          </div>
        </section>

        {/* ── Bio ── */}
        <section>
          <div className={`container ${styles.bioLayout}`}>
            <div className={styles.portrait}>
              <Image
                src="/images/about-portrait.webp"
                alt="Bill Hajdu with Mahjong tiles"
                width={480}
                height={580}
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className={styles.bioText}>
              <span className="overline">About</span>
              <h2>A Bridge Between Past and Future</h2>
              <div className="divider-gold" />

              <p>
                Bill Hajdu's journey reflects the power of blending diverse
                experiences, sharp analysis, and genuine empathy into the art of
                fortune telling. With over 35 years of practice, he has developed
                an approach that unites keen intellect, deep respect for tradition,
                and a heartfelt desire to help others. His time as an Air Force
                Interrogator with Top Secret Clearance sharpened his skill in
                reading people, uncovering hidden truths, and interpreting complex
                situations with remarkable accuracy.
              </p>

              <p>
                Bill's academic record is equally impressive. He holds a bachelor's
                degree in English Education, two master's degrees in Political
                Science and International Relations, and has completed advanced
                coursework in a PhD program in Government, focusing on international
                law. These achievements gave him a profound understanding of human
                behavior, global systems, and decision-making, which he weaves
                seamlessly into his work.
              </p>

              <p>
                His natural teaching ability elevates his practice, guiding clients
                through challenges with clarity and wisdom. Bill's interest in
                Chinese astrology began over three decades ago, igniting a lifelong
                path of study and mastery. He combines ancient astrological
                traditions with modern interpretive methods, offering readings that
                are both highly accurate and deeply personal.
              </p>
            </div>
          </div>
        </section>

        {/* ── Mid-page CTA ── */}
        <section className="section-dark">
          <div className="container" style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Experience It Yourself</span>
            <h2 style={{ color: 'var(--warm-cream)', margin: 'var(--space-md) 0' }}>Ready for a Reading with Bill?</h2>
            <p style={{ color: 'rgba(250,248,244,0.8)', maxWidth: 480, margin: '0 auto var(--space-xl)' }}>
              35+ years of practice. Sessions conducted online with flexible scheduling.
            </p>
            <Link href="/readings#book" className="btn-primary">Book a Reading</Link>
          </div>
        </section>

        {/* ── Extended Bio ── */}
        <section className="section-stone">
          <div className={`container ${styles.extended}`}>
            <p>
              Bill's empathy helps him form meaningful connections with clients.
              He approaches each reading as both guide and partner, offering
              practical, actionable advice. His sessions give more than answers —
              they empower people to make informed decisions and shape their futures.
            </p>

            <blockquote>
              What sets Bill apart is his talent for bridging ancient wisdom and
              modern life. His readings illuminate past and present while mapping
              clear paths forward.
            </blockquote>

            <p>
              Beyond his fortune-telling practice, Bill is devoted to preserving
              and revitalizing ancient Chinese wisdom. He believes in the ongoing
              relevance of teachings like the Tao Te Ching and seeks to share these
              insights with his community. His mission is to spark renewed
              appreciation for these timeless teachings and help others apply them
              to today's world.
            </p>

            <p>
              Whether he is speaking to a group of entrepreneurs, offering one-on-one
              guidance, or writing about ancient traditions, Bill's approach shines
              with scholarly rigor, heartfelt connection, and transformative insight.
            </p>
          </div>
        </section>

        {/* ── Publications & Speaking ── */}
        <section>
          <div className={`container ${styles.credentialsLayout}`}>
            <div>
              <span className="overline">Publications</span>
              <h3>Yearly Forecasts</h3>
              <div className="divider-gold" />
              <p>2009 to 2020 — Annual forecasts guiding readers through the energies of each Chinese New Year.</p>
            </div>

            <div>
              <span className="overline">Speaking Engagements</span>
              <h3>Global Stages</h3>
              <div className="divider-gold" />
              <ul className={styles.speakingList}>
                {[
                  { year: '2025', event: 'EO Vietnam Holiday Party' },
                  { year: '2019', event: 'EO APAC Bridge Cambodia' },
                  { year: '2016', event: 'EO Philippines Forecast with UBS Bank' },
                  { year: '2015', event: 'HSBC Premiere Banking Division' },
                  { year: '2008', event: 'Coffee Bean Vietnam Grand Opening' },
                ].map((s) => (
                  <li key={s.year} className={styles.speakingItem}>
                    <span className={styles.speakingYear}>{s.year}</span>
                    <span>{s.event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section-dark">
          <div className={`container ${styles.cta}`}>
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Work with Bill</span>
            <h2>Ready to Begin Your Reading?</h2>
            <p>All sessions are conducted online, with flexible scheduling and clear follow-up notes.</p>
            <div className={styles.ctaBtns}>
              <Link href="/readings" className="btn-primary">Book a Reading</Link>
              <Link href="/the-mahjong-mirror" className="btn-ghost">Explore the Book</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
