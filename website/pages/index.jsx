import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import NewsletterSignup from '../components/NewsletterSignup';
import AlmanacToday from '../components/AlmanacToday';
import { useAuth } from '../lib/auth';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph } from '../lib/schema';
import { POSTS } from '../lib/posts';
import { fetchAlmanacForDate, todayInLA } from '../lib/almanac';
import styles from '../styles/Home.module.css';

const TIERS = [
  {
    duration: 30,
    name: 'A focused look',
    note: 'One question, one spread',
    price: '$49',
    href: '/book-a-reading?duration=30',
  },
  {
    duration: 60,
    name: 'The full mirror',
    note: 'Complete reading across all three traditions',
    price: '$69',
    href: '/book-a-reading?duration=60',
    featured: true,
  },
  {
    duration: 90,
    name: 'Deep counsel',
    note: 'Multiple questions, full Four Pillars chart',
    price: '$129',
    href: '/book-a-reading?duration=90',
  },
];

const DECK = [
  { slug: 'peacock', rank: '1', name: 'Peacock', suit: 'Bamboo' },
  { slug: 'ducks',   rank: '2', name: 'Ducks',   suit: 'Bamboo' },
  { slug: 'toad',    rank: '3', name: 'Toad',    suit: 'Bamboo' },
  { slug: 'carp',    rank: '4', name: 'Carp',    suit: 'Bamboo' },
  { slug: 'lotus',   rank: '5', name: 'Lotus',   suit: 'Bamboo' },
  { slug: 'water',   rank: '6', name: 'Water',   suit: 'Bamboo' },
];

const stripTrailingPeriod = (s) => s.replace(/\.$/, '');

export default function Home({ todayDate, todayAlmanac }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Signed-in users get the dashboard. Redirect runs client-side only — the
  // SSR HTML is always the marketing page so the almanac is in the initial
  // payload (SEO + above-the-fold render).
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

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
        description="Live 1-on-1 Mahjong tile readings, Four Pillars Chinese astrology, and tarot with Bill Hajdu, 35+ years of divination practice. Book a reading or join the Member Area."
        path="/"
        image="/images/gallery-3.webp"
        jsonLd={jsonLd}
      />

      <Nav />

      <main>

        {/* ── 1. Hero — Almanac first ── */}
        <section className={styles.heroSection}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span className={styles.heroBadge}>Today · Tong Shu Almanac</span>
              <h1 className={styles.heroHeadline}>
                Today,<br />by the<br /><em>almanac</em>
              </h1>
              <p className={styles.heroLead}>
                A daily reading of the calendar from Bill Hajdu&apos;s thirty-five years of
                practice. Day-officer, score, and the activities the system favors or
                cautions against. Specific. Verifiable. The same answer if you check
                tomorrow.
              </p>
              <div className={styles.heroCtas}>
                <Link href={`/almanac/${todayDate}`} className={styles.heroPrimary}>
                  See today&apos;s full reading <span aria-hidden="true">→</span>
                </Link>
                <Link href="/signup" className={styles.heroGhost}>
                  Get Premium Access
                </Link>
              </div>
            </div>
            <div className={styles.heroAlmanacWrap}>
              <AlmanacToday almanac={todayAlmanac} href={`/almanac/${todayDate}`} />
            </div>
          </div>
        </section>

        {/* ── 2. Book ── */}
        <section className={styles.bookSection}>
          <div className="container">
            <div className={styles.book}>
              <div>
                <span className={styles.bookEyebrow}>Coming Soon</span>
                <h2>Your path to <em>wiser decisions</em></h2>
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
                    Read a chapter <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <div className={styles.bookCoverWrap}>
                <Image
                  src="/images/book-cover.webp"
                  alt="The Mahjong Mirror by Bill Hajdu"
                  width={320}
                  height={480}
                  className={styles.bookCoverImg}
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Journal ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>Writing &amp; Insight</span>
                <h2>From the <em>journal</em></h2>
              </div>
              <p className={styles.secHeadLede}>
                Notes on the year ahead, the tiles, and the slower kind of wisdom,
                published whenever the timing feels right.
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
                  <h3 className={styles.postTitle}>{stripTrailingPeriod(post.title)}</h3>
                  <div className={styles.postMeta}>{post.date} · {post.readTime}</div>
                </Link>
              ))}
            </div>

            <div className={styles.sessionsFooter}>
              <Link href="/blog" className={styles.btnLink}>Read the journal <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        {/* ── 4. Live Reading ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>Personal Sessions</span>
                <h2>Receive guidance through the <em>tiles</em></h2>
              </div>
              <p className={styles.secHeadLede}>
                One Live Reading, sized to fit the question. Conducted live online with
                Bill, the Mahjong Mirror Session looks into your emotional, spiritual,
                and practical life. Choose thirty, sixty, or ninety minutes, depending on
                how deep you want to go.
              </p>
            </div>

            <article className={`${styles.session} ${styles.mirrorSession}`}>
              <div className={`${styles.sessionMark} ${styles.sessionMarkFire}`}>鏡</div>
              <div className={styles.mirrorBody}>
                <div className={styles.livePill}>Live Reading</div>
                <h3 className={styles.sessionTitle}>The Mahjong Mirror Session</h3>
                <p className={styles.sessionDesc}>
                  A deep, intuitive reading that looks into your emotional, spiritual,
                  and practical life, revealing hidden influences, current challenges,
                  and key lessons. Ideal for relationship dynamics, life purpose, or
                  periods of uncertainty. Conducted live online, one-on-one with Bill.
                  No prior knowledge of Mahjong required.
                </p>
                <div className={styles.sessionMeta}>
                  Live online <span className={styles.dot}>·</span> 1-on-1 <span className={styles.dot}>·</span> recording sent after
                </div>
                <div className={styles.tierRow}>
                  {TIERS.map((t) => (
                    <Link
                      key={t.duration}
                      href={t.href}
                      className={`${styles.tier} ${t.featured ? styles.tierFire : ''}`}
                    >
                      {t.featured && <span className={styles.tierFlag}>Most chosen</span>}
                      <div className={styles.tierName}>{t.name}</div>
                      <div className={styles.tierLen}>{t.duration} min</div>
                      <div className={styles.tierPrice}>{t.price}</div>
                      <div className={styles.tierNote}>{t.note}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            <div className={styles.sessionsFooter}>
              <Link href="/book-a-reading" className={styles.btnLink}>Book a Live Reading <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        {/* ── 5. Testimonials ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>What Clients Say</span>
                <h2>Ancient cards, <em>lasting impact</em></h2>
              </div>
              <p className={styles.secHeadLede}>
                Notes from people who came with a question and left with a different
                one: sharper, kinder, more their own.
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

        {/* ── 6. Deck ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.secHead}>
              <div>
                <span className={styles.heroBadge}>The Deck</span>
                <h2>Meet the <em>cards</em></h2>
              </div>
              <p className={styles.secHeadLede}>
                Forty-two hand-illustrated cards drawn from the ancient Mahjong tradition.
                Each one a symbol, a story, and a doorway into clearer decisions.
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
                  <div className={styles.deckSuit}>{card.suit}</div>
                </Link>
              ))}
            </div>

            <div className={styles.deckFooter}>
              <div className={styles.deckCount}>Showing 6 of 42</div>
              <Link href="/cards" className={styles.btnLink}>See all 42 cards <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>

        {/* ── 7. About Bill ── */}
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
                <h2>Reader, host, <em>astrologer</em></h2>
                <p>
                  For more than thirty-five years, Bill has worked at the intersection of
                  Four Pillars astrology, Mahjong tile readings, and tarot, building a
                  system where the three traditions speak to one another.
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
                  <Link href="/about" className={styles.heroGhost}>About Bill <span aria-hidden="true">→</span></Link>
                  <Link href="/about#approach" className={styles.btnLink}>Read his approach</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. Stay Connected ── */}
        <section className={styles.sec}>
          <div className="container">
            <div className={styles.cta}>
              <div>
                <span className={styles.heroBadge}>Stay Connected</span>
                <h2>In your inbox, insights for the <em>year ahead</em></h2>
                <p>
                  Notes on Mahjong, tarot, and Chinese astrology, sent whenever there&apos;s
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

export async function getStaticProps() {
  const todayDate = todayInLA();
  const todayAlmanac = await fetchAlmanacForDate(todayDate);
  return {
    props: { todayDate, todayAlmanac: todayAlmanac || null },
    revalidate: 300,
  };
}
