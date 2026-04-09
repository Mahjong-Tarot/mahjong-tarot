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
        <title>Mahjong Tarot — Bill Hajdu</title>
        <meta name="description" content="35+ years of divination practice. Mahjong tile readings, Chinese astrology, and tarot with Bill Hajdu — The Firepig. Explore The Mahjong Mirror." />
        <meta property="og:title" content="Mahjong Tarot — Bill Hajdu" />
        <meta property="og:description" content="Ancient wisdom, modern clarity. Mahjong tile readings and tarot with Bill Hajdu." />
        <meta property="og:image" content="https://mahjong-tarot.com/images/gallery-3.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/" />
      </Head>

      <Nav />

      <main>

        {/* ── Hero ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <div className={styles.heroText}>
              <span className="overline">Ancient Wisdom · Modern Clarity</span>
              <h1>See What the<br />Tiles Reveal</h1>
              <p className={styles.heroLead}>
                35 years of divination practice. Mahjong tiles, Chinese astrology,
                and tarot — woven into readings that illuminate your path.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/readings#book" className="btn-primary">Book a Reading</Link>
                <Link href="/the-mahjong-mirror#preorder" className="btn-ghost">Preorder the Book</Link>
              </div>
            </div>
          </div>
          <div className={styles.heroRight}>
            <Image
              src="/images/gallery-3.webp"
              alt="Bill Hajdu conducting a Mahjong Tarot reading"
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
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
            <div className={`card-dark ${styles.readingCard}`} style={{ maxWidth: 640, margin: '0 auto' }}>
              <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Live Online · 45–60 minutes</span>
              <h3>The Mahjong Mirror Session</h3>
              <p>
                A deep, intuitive reading that looks into your emotional,
                spiritual, and practical life — revealing hidden influences,
                current challenges, energetic strengths, possible outcomes,
                and key lessons. Ideal for relationship dynamics, life purpose
                exploration, long-term planning, or periods of uncertainty.
              </p>
              <p>
                Conducted live online with Bill. No prior knowledge of Mahjong
                required — just an open mind and a question worth asking.
              </p>
              <Link href="/readings#book" className="btn-primary">Book a Session</Link>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section>
          <div className={`container ${styles.intro}`}>
            <div className={styles.introText}>
              <span className="overline">Meet the Firepig</span>
              <h2>Bill Hajdu</h2>
              <div className="divider-gold" />
              <p>
                With over 35 years of practice, Bill Hajdu has developed an
                approach that unites Four Pillars astrology, Mahjong tile
                readings, and tarot into a single, coherent system. His readings
                draw on keen intellect, deep respect for tradition, and a
                genuine desire to help others find clarity.
              </p>
              <Link href="/about" className="btn-secondary">About Bill</Link>
            </div>
            <div className={styles.introImage}>
              <Image
                src="/images/gallery-2.webp"
                alt="Mahjong tiles arranged around a tarot card"
                width={580}
                height={435}
                style={{ objectFit: 'cover' }}
              />
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
                { src: '/images/gallery-2.webp',      alt: 'Mahjong tiles arranged around The Star tarot card',        pos: 'center center' },
                { src: '/images/gallery-3.webp',      alt: 'Bill Hajdu conducting a reading at an ornate table',       pos: 'center top'    },
                { src: '/images/gallery-4.webp',      alt: 'A client delighted by her reading',                        pos: 'center top'    },
                { src: '/images/readings-hero.webp',  alt: 'Bill reading tiles with a group of clients',               pos: 'center top'    },
              ].map((img) => (
                <div key={img.src} className={styles.galleryItem}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    style={{ objectFit: 'cover', objectPosition: img.pos }}
                  />
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
