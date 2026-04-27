import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import NewsletterSignup from '../components/NewsletterSignup';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph } from '../lib/schema';
import { POSTS } from '../lib/posts';
import styles from '../styles/Home.module.css';

const SESSIONS = [
  {
    mark: '30',
    markVariant: '',
    title: 'Quick Reading',
    desc: 'A focused reading on one topic. Clarity around a single decision or question.',
    meta: ['Live online', '30 min', '1-on-1'],
    price: '$39',
    href: '/book-a-reading?duration=30',
  },
  {
    mark: '60',
    markVariant: 'fire',
    title: 'Standard Reading',
    desc: 'Multiple topics with time to explore: relationships, work, decisions in flux. Most popular.',
    meta: ['Live online', '60 min', '1-on-1'],
    price: '$59',
    href: '/book-a-reading?duration=60',
  },
  {
    mark: '90',
    markVariant: 'ink',
    title: 'Extended Reading',
    desc: 'A comprehensive reading across the major areas of your life. Right for periods of uncertainty or big transitions.',
    meta: ['Live online', '90 min', '1-on-1'],
    price: '$99',
    href: '/book-a-reading?duration=90',
  },
];

const DECK = [
  { slug: 'peacock', rank: 'I',   name: 'Peacock' },
  { slug: 'phoenix', rank: 'II',  name: 'Phoenix' },
  { slug: 'dragon',  rank: 'III', name: 'Dragon'  },
  { slug: 'tiger',   rank: 'IV',  name: 'Tiger'   },
  { slug: 'lotus',   rank: 'V',   name: 'Lotus'   },
  { slug: 'pearl',   rank: 'VI',  name: 'Pearl'   },
];

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
        title="Mahjong Tarot Readings & Chinese Astrology | Bill Hajdu, The Firepig"
        description="Live 1-on-1 Mahjong tile readings, Four Pillars Chinese astrology, and tarot with Bill Hajdu, 35+ years of divination practice. Book a reading or explore The Mahjong Mirror."
        path="/"
        image="/images/gallery-3.webp"
        jsonLd={jsonLd}
      />

      <Nav />

      <main>

        {/* ── Hero ── */}
        <section className={styles.heroSection}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span className={styles.heroBadge}>Ancient Wisdom · Modern Clarity</span>
              <h1 className={styles.heroHeadline}>
                See what<br />the tiles<br /><em>reveal</em>.
              </h1>
              <p className={styles.heroLead}>
                Thirty-five years of divination practice. Mahjong tiles, Chinese astrology,
                and tarot, woven into readings that illuminate your path.
              </p>
              <div className={styles.heroCtas}>
                <Link href="/book-a-reading" className={styles.heroPrimary}>
                  Book a Reading <span aria-hidden="true">→</span>
                </Link>
                <Link href="/the-mahjong-mirror#preorder" className={styles.heroGhost}>
                  Preorder the Book
                </Link>
              </div>
              <dl className={styles.heroStats}>
                <div>
                  <dt><em>35</em>+</dt>
                  <dd>Years of practice</dd>
                </div>
                <div>
                  <dt>3</dt>
                  <dd>Divination traditions</dd>
                </div>
                <div>
                  <dt>1<span style={{ color: 'var(--ink-3)', fontSize: '22px' }}>-on-</span>1</dt>
                  <dd>Live online readings</dd>
                </div>
              </dl>
            </div>
            <figure className={styles.heroPortrait}>
              <Image
                src="/images/gallery-3.webp"
                alt="Bill Hajdu conducting a Mahjong Tarot reading"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
              <div className={styles.heroPullQuote}>
                A reading is a <b>conversation</b> with what you already know but haven't said.
              </div>
              <div className={styles.heroFigureTag}>[ Bill Hajdu · The Firepig ]</div>
            </figure>
          </div>
        </section>

        {/* ── Sessions ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>Book a Reading</span>
                <h2>One reading. Three <em>lengths</em>.</h2>
              </div>
              <p className={styles.secHeadLede}>
                Pick the length that fits your question. Thirty minutes for a single
                decision; sixty for several topics; ninety for a full look across your
                life. Every session is live with Bill, online.
              </p>
            </div>

            <div className={styles.sessionsList}>
              {SESSIONS.map((s) => (
                <Link key={s.title} href={s.href} className={styles.session}>
                  <div className={`${styles.sessionMark} ${s.markVariant === 'ink' ? styles.sessionMarkInk : ''} ${s.markVariant === 'fire' ? styles.sessionMarkFire : ''}`}>
                    {s.mark}
                  </div>
                  <div>
                    <h3 className={styles.sessionTitle}>{s.title}</h3>
                    <p className={styles.sessionDesc}>{s.desc}</p>
                    <div className={styles.sessionMeta}>
                      {s.meta.map((m, i) => (
                        <span key={m}>
                          {i > 0 && <span className="dot">·</span>}
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.sessionPrice}>
                    {s.price}<small>per session</small>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.sessionsFooter}>
              <Link href="/book-a-reading" className={styles.btnLink}>Start booking <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        {/* ── About Bill ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.about}>
              <figure className={styles.aboutFigure}>
                <Image
                  src="/images/about-portrait.webp"
                  alt="Bill Hajdu, divination practitioner and author"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.aboutFigureTag}>[ Bill at the table ]</div>
              </figure>
              <div className={styles.aboutText}>
                <span className={styles.heroBadge}>Meet the Firepig</span>
                <h2>Bill Hajdu, reader, <em>astrologer</em>, host.</h2>
                <p>
                  For more than thirty-five years, Bill has worked at the intersection of
                  Four Pillars astrology, Mahjong tile readings, and tarot. He has built
                  a system where the three traditions speak to one another.
                </p>
                <p>
                  His readings draw on keen intellect, deep respect for tradition, and a
                  genuine desire to help others find clarity. No prior knowledge of Mahjong
                  is required. Just an open mind and a question worth asking.
                </p>
                <div className={styles.aboutCred}>
                  <div className={styles.aboutCredItem}>
                    <div className={styles.credNum}>35+</div>
                    <div className={styles.credLab}>Years practicing</div>
                  </div>
                  <div className={styles.aboutCredItem}>
                    <div className={styles.credNum}>2,400+</div>
                    <div className={styles.credLab}>Sessions read</div>
                  </div>
                  <div className={styles.aboutCredItem}>
                    <div className={styles.credNum}>42</div>
                    <div className={styles.credLab}>Cards in the deck</div>
                  </div>
                </div>
                <div className={styles.aboutBtns}>
                  <Link href="/about" className={styles.heroGhost}>About Bill →</Link>
                  <Link href="/about#approach" className={styles.btnLink}>Read his approach</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Deck ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>The Deck</span>
                <h2>Meet the <em>cards</em>.</h2>
              </div>
              <p className={styles.secHeadLede}>
                Forty-two hand-illustrated cards drawn from the ancient Mahjong tradition.
                Each a symbol, a story, and a doorway into clearer decisions.
              </p>
            </div>

            <div className={styles.deckStrip}>
              {DECK.map((card) => (
                <Link key={card.slug} href={`/cards/${card.slug}`} className={styles.deckCard}>
                  <div className={styles.deckRank}>{card.rank}</div>
                  <div className={styles.deckImageWrap}>
                    <Image
                      src={`/images/cards/${card.slug}.webp`}
                      alt={`${card.name}, Mahjong Mirror card`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className={styles.deckName}>{card.name}</div>
                </Link>
              ))}
            </div>

            <div className={styles.deckFooter}>
              <div className={styles.deckCount}>Showing 6 of 42</div>
              <Link href="/cards" className={styles.btnLink}>See all 42 cards →</Link>
            </div>
          </div>
        </section>

        {/* ── Book ── */}
        <section className={styles.bookSection}>
          <div className="container">
            <div className={styles.book}>
              <div>
                <span className={styles.bookEyebrow}>Coming Soon</span>
                <h2>The Mahjong Mirror. Your path to <em>wiser</em> decisions.</h2>
                <p>
                  A modern divination system inspired by ancient Mahjong symbolism,
                  guiding you toward clarity, intuition, and deeper self-discovery.
                  No prior knowledge of Mahjong required.
                </p>
                <p className={styles.bookSpec}>Hardcover · 320 pp · Spring 2026</p>
                <div className={styles.bookCtas}>
                  <Link href="/the-mahjong-mirror#preorder" className={styles.heroPrimary}>
                    Preorder $34
                  </Link>
                  <Link href="/the-mahjong-mirror" className={styles.bookGhost}>
                    Read a chapter →
                  </Link>
                </div>
              </div>
              <div className={styles.bookCoverWrap}>
                <div className={styles.bookCover}>
                  <div className={styles.bookCoverGlyph}>鏡</div>
                  <div className={styles.bookCoverEyebrow}>A Divination System</div>
                  <h3 className={styles.bookCoverTitle}>
                    The Mahjong<br /><em>Mirror</em>
                  </h3>
                  <div className={styles.bookCoverAuthor}>Bill Hajdu · 2026</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Journal ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>Writing &amp; Insight</span>
                <h2>From the <em>journal</em>.</h2>
              </div>
              <p className={styles.secHeadLede}>
                Notes on the year ahead, the tiles, and the slower kind of wisdom. Published
                whenever the timing feels right.
              </p>
            </div>

            <div className={styles.journalGrid}>
              {featuredPosts.map((post) => (
                <Link key={post.slug} href={`/blog/posts/${post.slug}`} className={styles.post}>
                  <div className={styles.postImg}>
                    <Image
                      src={`/images/blog/${post.slug}.webp`}
                      alt={post.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className={styles.postEyebrow}>{post.categories[0]}</div>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <div className={styles.postMeta}>{post.date} · {post.readTime}</div>
                </Link>
              ))}
            </div>

            <div className={styles.sessionsFooter}>
              <Link href="/blog" className={styles.btnLink}>Read the journal →</Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>What Clients Say</span>
                <h2>Ancient cards, <em>lasting</em> impact.</h2>
              </div>
              <p className={styles.secHeadLede}>
                Notes from people who came with a question and left with a different one.
                Sharper, kinder, more their own.
              </p>
            </div>
            <div className={styles.quotesGrid}>
              {[
                { quote: 'Beautiful, intuitive, and accurate. The tiles described exactly how I felt.', name: 'Saharan Louret', location: 'Cleveland, OH' },
                { quote: 'A calming, grounding experience. I left feeling lighter and clearer.',         name: 'Fabian Baracca', location: 'Minneapolis, MN' },
                { quote: 'My relationship reading was spot on. It changed how I approached our conversation.', name: 'Mouna Gonzato',  location: 'Newark, NJ' },
              ].map((t) => (
                <blockquote key={t.name} className={styles.quote}>
                  <p className={styles.quoteText}>&ldquo;{t.quote}&rdquo;</p>
                  <div className={styles.quoteCite}>
                    <b>{t.name}</b> · {t.location}
                  </div>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter CTA ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.cta}>
              <div>
                <span className={styles.heroBadge}>Stay Connected</span>
                <h2>Insights for the <em>year ahead</em>, in your inbox.</h2>
                <p>
                  Notes on Mahjong, tarot, and Chinese astrology. Sent whenever there&apos;s
                  something worth saying. Never more than twice a month.
                </p>
              </div>
              <NewsletterSignup source="home" variant="light" />
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
