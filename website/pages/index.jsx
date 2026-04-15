import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph } from '../lib/schema';
import { POSTS } from '../lib/posts';
import styles from '../styles/Home.module.css';

export default function Home() {
  const jsonLd = graph([
    ORGANIZATION,
    WEBSITE,
    PERSON_BILL,
    {
      '@type': 'WebPage',
      '@id': 'https://www.mahjongtarot.com/#home',
      url: 'https://www.mahjongtarot.com/',
      name: 'Mahjong Tarot Readings & Chinese Astrology | Bill Hajdu',
      isPartOf: { '@id': 'https://www.mahjongtarot.com/#website' },
      about: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
      primaryImageOfPage: 'https://www.mahjongtarot.com/images/gallery-3.webp',
    },
  ]);

  const featuredPosts = POSTS.slice(0, 3);

  return (
    <>
      <SEO
        title="Mahjong Tarot Readings & Chinese Astrology | Bill Hajdu — The Firepig"
        description="Live 1-on-1 Mahjong tile readings, Four Pillars Chinese astrology, and tarot with Bill Hajdu — 35+ years of divination practice. Book a reading or explore The Mahjong Mirror."
        path="/"
        image="/images/gallery-3.webp"
        jsonLd={jsonLd}
      />

      <Nav />

      <main>

        {/* ── Hero ── */}
        <section className={styles.heroSection}>
          <div className={styles.heroGrid} aria-hidden="true" />
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={`container ${styles.heroInner}`}>
            <span className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              Ancient Wisdom · Modern Clarity
            </span>
            <h1 className={styles.heroHeadline}>
              See what the tiles
              <br />
              <em>reveal</em>.
            </h1>
            <p className={styles.heroLead}>
              35 years of divination practice. Mahjong tiles, Chinese astrology,
              and tarot — woven into readings that illuminate your path.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/readings#book" className={styles.heroPrimary}>
                Book a Reading <span aria-hidden="true">→</span>
              </Link>
              <Link href="/the-mahjong-mirror#preorder" className={styles.heroGhost}>
                Preorder the Book
              </Link>
            </div>
            <dl className={styles.heroStats}>
              <div>
                <dt>35+</dt>
                <dd>Years of practice</dd>
              </div>
              <div>
                <dt>3</dt>
                <dd>Divination traditions</dd>
              </div>
              <div>
                <dt>1-on-1</dt>
                <dd>Live online readings</dd>
              </div>
            </dl>
          </div>
          <div className={styles.heroImageFade}>
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
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Personal Sessions</span>
              <h2>Receive Guidance Through<br />a Mahjong Tarot Reading</h2>
            </div>
            <div className={styles.readingCard} style={{ maxWidth: 640, margin: '0 auto' }}>
              <span className="overline">Live Online · 45-60 minutes</span>
              <h3>The Mahjong Mirror Session</h3>
              <p>
                A deep, intuitive reading that looks into your emotional,
                spiritual, and practical life - revealing hidden influences,
                current challenges, energetic strengths, possible outcomes,
                and key lessons. Ideal for relationship dynamics, life purpose
                exploration, long-term planning, or periods of uncertainty.
              </p>
              <p>
                Conducted live online with Bill. No prior knowledge of Mahjong
                required - just an open mind and a question worth asking.
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
              <h2>Bill Hajdu — Mahjong Tarot Reader &amp; Chinese Astrologer</h2>
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
                src="/images/about-portrait.webp"
                alt="Bill Hajdu — divination practitioner and author"
                width={580}
                height={720}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>

        {/* ── Book CTA ── */}
        <section className={`section-dark ${styles.bookSection}`}>
          <div className={`container ${styles.bookInner}`}>
            <div className={styles.bookText}>
              <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Coming Soon</span>
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

        {/* ── Card Gallery ── */}
        <section>
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">The Deck</span>
              <h2>Meet the Cards</h2>
              <p className={styles.sectionLead}>
                Forty-two hand-illustrated cards drawn from the ancient Mahjong tradition —
                each one a symbol, a story, and a doorway into clearer decisions.
              </p>
            </div>
            <div className={styles.cardGallery}>
              {[
                { slug: 'dragon',  name: 'Dragon',  meaning: 'Power · Transformation' },
                { slug: 'phoenix', name: 'Phoenix', meaning: 'Renewal · Rising' },
                { slug: 'pearl',   name: 'Pearl',   meaning: 'Hidden wisdom' },
                { slug: 'lotus',   name: 'Lotus',   meaning: 'Purity · Growth' },
                { slug: 'tiger',   name: 'Tiger',   meaning: 'Courage · Instinct' },
                { slug: 'peacock', name: 'Peacock', meaning: 'Beauty · Pride' },
              ].map((card) => (
                <Link key={card.slug} href={`/cards/${card.slug}`} className={styles.cardItem} style={{ textDecoration: 'none' }}>
                  <figure style={{ margin: 0 }}>
                    <div className={styles.cardImageWrap}>
                      <Image
                        src={`/images/cards/${card.slug}.webp`}
                        alt={`${card.name} — Mahjong Mirror card`}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <figcaption>
                      <span className={styles.cardName}>{card.name}</span>
                      <span className={styles.cardMeaning}>{card.meaning}</span>
                    </figcaption>
                  </figure>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
              <Link href="/cards" className="btn-secondary">See All 42 Cards</Link>
            </div>
          </div>
        </section>

        {/* ── Latest Blog Posts ── */}
        <section className="section-stone">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="overline">Writing & Insight</span>
              <h2>From the Journal</h2>
            </div>
            <div className={styles.blogGrid}>
              {featuredPosts.map((post) => (
                <article key={post.slug} className={styles.blogCard}>
                  <Link href={`/blog/posts/${post.slug}`} className={styles.blogImageLink}>
                    <div className={styles.blogImage}>
                      <Image
                        src={`/images/blog/${post.slug}.webp`}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </Link>
                  <div className={styles.blogBody}>
                    <span className="post-category">{post.categories[0]}</span>
                    <h3 className={styles.blogTitle}>
                      <Link href={`/blog/posts/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <span className="post-meta">{post.date} · {post.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
              <Link href="/blog" className="btn-secondary">Read the Blog</Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section>
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
