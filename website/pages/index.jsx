import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>The Mahjong Tarot — Bill Hajdu</title>
        <meta name="description" content="35+ years of divination practice. Mahjong tile readings, Chinese astrology, and tarot with Bill Hajdu — The Firepig. Book a personal reading or explore The Mahjong Mirror." />
        <meta property="og:title" content="The Mahjong Tarot — Bill Hajdu" />
        <meta property="og:description" content="Ancient wisdom, modern clarity. Personal readings with Bill Hajdu." />
        <meta property="og:image" content="https://mahjong-tarot.com/images/hero.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/" />
      </Head>

      <Nav />

      <main>
        {/* ── Hero ── */}
        <section className="section-dark">
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroContent}>
              <span className="overline">Ancient Cards · Modern Insight</span>
              <h1>See What the<br />Tiles Reveal</h1>
              <p className={styles.heroLead}>
                35 years of divination practice. Mahjong tiles, Chinese astrology,
                and tarot — woven into readings that illuminate your path.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/readings" className="btn-primary">Book a Reading</Link>
                <Link href="/the-mahjong-mirror" className="btn-ghost">The Mahjong Mirror</Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              <Image
                src="/images/hero.webp"
                alt="Bill Hajdu — The Mahjong Tarot"
                fill
                priority
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div className={styles.heroOverlay} />
            </div>
          </div>
        </section>

        {/* ── Intro ── */}
        <section>
          <div className={`container ${styles.intro}`}>
            <div className={styles.introText}>
              <span className="overline">Meet the Firepig</span>
              <h2>Bill Hajdu</h2>
              <div className="divider-gold" />
              <p>
                Bill Hajdu's journey reflects the power of blending diverse
                experiences, sharp analysis, and genuine empathy into the art
                of fortune telling. With over 35 years of practice, he has
                developed an approach that unites keen intellect, deep respect
                for tradition, and a heartfelt desire to help others.
              </p>
              <p>
                Whether using Four Pillars astrology, Mahjong cards, or face
                readings, he draws on his broad education and life experience
                to provide insights that resonate.
              </p>
              <Link href="/about" className="btn-secondary">About Bill</Link>
            </div>
            <div className={styles.introImage}>
              <Image
                src="/images/about-portrait.webp"
                alt="Bill Hajdu with Mahjong tiles"
                width={520}
                height={620}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* ── Readings ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Personal Sessions</span>
              <h2>Receive Guidance Through<br />a Mahjong Tarot Reading</h2>
              <div className="divider-gold centered" />
            </div>
            <div className={styles.readingsGrid}>
              <div className="card">
                <span className="overline">10–15 minutes</span>
                <h3>One-Tile Insight</h3>
                <p>
                  A simple yet powerful message drawn from a single tile. Ideal
                  for yes/no questions, emotional check-ins, or moments when
                  you need one clear truth.
                </p>
                <Link href="/readings#one-tile" className="btn-secondary">Learn more</Link>
              </div>
              <div className="card">
                <span className="overline">20–30 minutes</span>
                <h3>Three-Tile Spread</h3>
                <p>
                  Past Influence · Present Energy · Near Future Direction.
                  A balanced, focused perspective that brings clarity to
                  decisions and life transitions.
                </p>
                <Link href="/readings#three-tile" className="btn-secondary">Learn more</Link>
              </div>
              <div className="card card-dark">
                <span className="overline" style={{ color: 'var(--celestial-gold)' }}>45–60 minutes</span>
                <h3>The Mahjong Mirror Session</h3>
                <p>
                  A deep, intuitive reading revealing hidden influences, current
                  challenges, energetic strengths, possible outcomes, and key
                  lessons.
                </p>
                <Link href="/readings#mirror-session" className="btn-ghost">Learn more</Link>
              </div>
            </div>
            <div className={styles.readingsCta}>
              <Link href="/readings" className="btn-primary">Book a Reading</Link>
            </div>
          </div>
        </section>

        {/* ── Book CTA ── */}
        <section className={`section-dark ${styles.bookSection}`}>
          <div className={`container ${styles.bookInner}`}>
            <div className={styles.bookText}>
              <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Now Available</span>
              <h2>The Mahjong Mirror</h2>
              <p className={styles.bookSubtitle}>Your Path to Wiser Decisions</p>
              <div className="divider-gold" />
              <p>
                A modern divination system inspired by ancient Mahjong symbolism —
                guiding you toward clarity, intuition, and deeper self-discovery.
                No prior knowledge of Mahjong required.
              </p>
              <Link href="/the-mahjong-mirror" className="btn-ghost">Explore the Book</Link>
            </div>
            <div className={styles.bookCover}>
              <Image
                src="/images/book-cover.webp"
                alt="The Mahjong Mirror — Your Path to Wiser Decisions by Bill Hajdu"
                width={340}
                height={460}
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">In Practice</span>
              <h2>The Tiles at Work</h2>
            </div>
            <div className={styles.gallery}>
              {[
                { src: '/images/gallery-1.webp', alt: 'Bill with a client during a reading' },
                { src: '/images/gallery-2.webp', alt: 'Mahjong tiles laid out for a reading' },
                { src: '/images/gallery-3.webp', alt: 'Client choosing tiles' },
                { src: '/images/gallery-4.webp', alt: 'Bill reading the cards' },
              ].map((img) => (
                <div key={img.src} className={styles.galleryItem}>
                  <Image src={img.src} alt={img.alt} fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">What Clients Say</span>
              <h2>Ancient Cards, Lasting Impact</h2>
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
      </main>

      <Footer />
    </>
  );
}
