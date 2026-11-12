import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ChartForm from '../components/ChartForm';
import { useAuth } from '../lib/auth';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph } from '../lib/schema';
import { listPublishedPosts } from '../lib/blogDb';
import { fetchAlmanacForDate, todayInLA } from '../lib/almanac';
import { CARDS } from '../lib/cards';
import styles from '../styles/Home.module.css';

const AMAZON_URL = 'https://www.amazon.com/dp/B0HQZZXXLC';

const DECK_SLUGS = ['peacock', 'red-dragon', 'phoenix', 'tiger', 'lotus', 'pine'];

const ANGLES = [
  { n: 'First angle',  title: 'Your central theme', text: 'The one force shaping everything else in your life right now.' },
  { n: 'Second angle', title: 'Yourself',           text: 'Who you are, who you need to become, and what you truly want.' },
  { n: 'Third angle',  title: 'Your opposition',    text: 'The obstacles and resistance between you and what you are after.' },
  { n: 'Fourth angle', title: 'Your future',        text: 'The probabilities and possibilities ahead, near term and beyond.' },
];

const MEMBER_LIST = [
  { text: 'Unlimited online readings' },
  { text: 'Unlimited relationship comparisons: romance, business, family' },
  { text: 'The full almanac and your horoscope' },
  { text: 'Bonus: a free copy of The Mahjong Mirror', bonus: true },
  { text: 'Bonus: half off a personal reading with Bill', bonus: true },
];

const stripTrailingPeriod = (s) => s.replace(/\.$/, '');

function shortDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function SectionHead({ label, aside }) {
  return (
    <div className={styles.secLabel}>
      <span className={styles.secLabelMain}>{label}</span>
      {aside}
    </div>
  );
}

export default function Home({ todayDate, todayAlmanac, featuredPosts }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Signed-in users get the dashboard. Redirect runs client-side only, so the
  // SSR HTML is always the marketing page.
  useEffect(() => {
    if (!loading && user) router.replace('/member/dashboard');
  }, [loading, user, router]);

  const deck = DECK_SLUGS.map((slug) => CARDS.find((c) => c.slug === slug)).filter(Boolean);
  const day = todayAlmanac?.pillars?.day;

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

  return (
    <>
      <SEO
        title="Mahjong Tarot Readings & Chinese Astrology | Bill Hajdu, The Firepig"
        description="The year you were born is only one angle. See the first page of Bill Hajdu's Four Pillars, Purple Star, Three Blessings and Fire Horse readings, free, from your birth date and time."
        path="/"
        image="/images/gallery-3.webp"
        jsonLd={jsonLd}
      />

      <Nav />

      <main>
        {/* Today strip */}
        <div className={styles.today}>
          <div className={`container ${styles.todayInner}`}>
            <span>
              Today · {shortDate(todayDate)}
              {day ? ` · ${day.element} ${day.sign} day` : ''}
            </span>
            <Link href={`/almanac/${todayDate}`} className={styles.todayLink}>
              Open today&apos;s almanac <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <div className={styles.eyebrow}>Chinese astrology · Mahjong · Tarot</div>
              <h1 className={styles.heroTitle}>
                The year you were born is only <em>one angle of the mirror.</em>
              </h1>
              <p className={styles.heroLede}>
                An animal sign tells you very little, and a chart on its own is just a
                chart. Bill Hajdu has spent thirty-five years reading a life from four
                angles. Enter your birth date and time and see the first page of his
                Four Pillars, Purple Star, Three Blessings and Fire Horse readings.
              </p>
              <ChartForm />
            </div>

            <div className={styles.heroArt}>
              <div className={styles.fan}>
                <div className={`${styles.fanCard} ${styles.fanLeft}`}>
                  <Image src="/images/cards/pine.webp" alt="" width={300} height={450} sizes="240px" />
                </div>
                <div className={`${styles.fanCard} ${styles.fanRight}`}>
                  <Image src="/images/cards/tiger.webp" alt="" width={300} height={450} sizes="240px" />
                </div>
                <div className={`${styles.fanCard} ${styles.fanCenter}`}>
                  <Image
                    src="/images/cards/phoenix.webp"
                    alt="The Phoenix card from the Mahjong Mirror deck"
                    width={300}
                    height={450}
                    sizes="280px"
                    priority
                  />
                </div>
                <div className={styles.sample}>
                  <div>
                    <div className={styles.sampleLabel}>Sample · 14 Mar 1984</div>
                    <div className={styles.sampleText}>Wood Rat. Lucky in all Three Blessings.</div>
                  </div>
                  <div className={styles.sampleZh} lang="zh" aria-hidden="true">甲子</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The four angles */}
        <section className={`${styles.band} ${styles.grey}`}>
          <div className="container">
            <SectionHead label="A mirror with four angles" aside={<span>From The Mahjong Mirror</span>} />
            <div className={styles.angles}>
              {ANGLES.map((a) => (
                <div key={a.title} className={styles.angle}>
                  <div className={styles.angleN}>{a.n}</div>
                  <h3 className={styles.angleTitle}>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contents */}
        <section className={styles.band}>
          <div className="container">
            <SectionHead label="Contents" aside={<span>Three ways in</span>} />
            <Link href="/the-mahjong-mirror/sample" className={styles.row}>
              <span className={styles.rowNum}>01</span>
              <span className={styles.rowTitle}>Read the book</span>
              <span className={styles.rowText}>
                The Mahjong Mirror, the whole system in Bill&apos;s own words. Kindle
                edition on Amazon, with the introduction free to read here.
              </span>
              <span className={styles.rowLink}>Start the introduction →</span>
            </Link>
            <Link href="/membership" className={styles.row}>
              <span className={styles.rowNum}>02</span>
              <span className={styles.rowTitle}>Join the community</span>
              <span className={styles.rowText}>
                Unlimited online readings for you and your inner circle, a free copy of
                the book, and half off a personal reading with Bill.
              </span>
              <span className={styles.rowLink}>See what members get →</span>
            </Link>
            <Link href={`/almanac/${todayDate}`} className={styles.row}>
              <span className={styles.rowNum}>03</span>
              <span className={styles.rowTitle}>Follow the days</span>
              <span className={styles.rowText}>
                The daily almanac and horoscope: each day&apos;s officer, its score, and
                what the calendar favors or cautions against.
              </span>
              <span className={styles.rowLink}>See today →</span>
            </Link>
          </div>
        </section>

        {/* 01 The book */}
        <section className={`${styles.band} ${styles.grey}`}>
          <div className="container">
            <SectionHead label="01 · The book" aside={<span>Now on Amazon</span>} />
            <div className={styles.split}>
              <div className={styles.cover}>
                <Image
                  src="/images/book-cover.webp"
                  alt="Cover of The Mahjong Mirror by Bill Hajdu"
                  width={340}
                  height={510}
                  sizes="(max-width: 640px) 70vw, 340px"
                />
              </div>
              <div className={styles.splitText}>
                <h2 className={styles.h2}>
                  The Mahjong Mirror: your path to <em>wiser decisions</em>
                </h2>
                <p className={styles.lede}>
                  &ldquo;It invites you to examine your situation from multiple angles,
                  not just the obvious ones, and discover considerations and solutions you
                  might otherwise miss.&rdquo;
                </p>
                <div className="cta-row">
                  <a href={AMAZON_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Buy on Amazon
                  </a>
                  <Link href="/the-mahjong-mirror/sample" className={styles.btnOutline}>
                    Read the introduction
                  </Link>
                </div>
                <p className={styles.small}>
                  Members get a copy free. <Link href="/membership">See membership</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 02 Membership */}
        <section className={`${styles.band} ${styles.pink}`}>
          <div className="container">
            <SectionHead label="02 · Membership" aside={<span>$99 a year, or $299 once for life</span>} />
            <div className={styles.split}>
              <div className={styles.splitText}>
                <h2 className={styles.h2}>
                  Join once. <em>Read as often as you like.</em>
                </h2>
                <p className={styles.lede}>
                  Every reading Bill has written, run from your birth details whenever you
                  want, for you and the people you care about.
                </p>
                <Link href="/membership" className="btn-primary btn-lg">
                  See what members get <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul className={styles.list}>
                {MEMBER_LIST.map((i) => (
                  <li key={i.text} className={i.bonus ? styles.bonus : ''}>{i.text}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 03 The deck */}
        <section className={styles.band}>
          <div className="container">
            <SectionHead
              label="03 · The deck"
              aside={<Link href="/cards" className={styles.asideLink}>See all 42 cards →</Link>}
            />
            <div className={styles.headRow}>
              <h2 className={styles.h2}>Forty-two cards, <em>each a doorway</em></h2>
              <p>
                Forty-two hand-illustrated cards drawn from the ancient Mahjong tradition.
                Each one a symbol, a story, and a doorway into clearer decisions.
              </p>
            </div>
            <div className={styles.deck}>
              {deck.map((c) => (
                <Link key={c.slug} href={`/cards/${c.slug}`} className={styles.deckCard}>
                  <Image
                    src={`/images/cards/${c.slug}.webp`}
                    alt={`${c.name} card`}
                    width={300}
                    height={450}
                    sizes="(max-width: 640px) 45vw, 200px"
                  />
                  <div className={styles.deckName}>{c.name}</div>
                  <div className={styles.deckShort}>{c.short}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 04 The blog */}
        {featuredPosts.length > 0 && (
          <section className={styles.band}>
            <div className="container">
              <SectionHead
                label="04 · The blog"
                aside={<Link href="/blog" className={styles.asideLink}>All writing →</Link>}
              />
              <div className={styles.posts}>
                {featuredPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/posts/${post.slug}`} className={styles.postRow}>
                    <span className={styles.postTitle}>{stripTrailingPeriod(post.title)}</span>
                    <span className={styles.rowLink}>Read →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Closing */}
        <section className={`${styles.band} ${styles.grey}`}>
          <div className={`container ${styles.closing}`}>
            <h2 className={styles.h2}>Start with <em>your birth date</em></h2>
            <div className="cta-row">
              <Link href="/chart" className="btn-primary btn-lg">Show my chart</Link>
              <Link href="/membership" className={styles.btnOutline}>See membership</Link>
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
  const { data: todayAlmanac } = await fetchAlmanacForDate(todayDate);
  // Only posts whose publish date has arrived; a failed read shows no blog
  // rows rather than failing the homepage.
  let featuredPosts = [];
  try {
    featuredPosts = (await listPublishedPosts()).slice(0, 3);
  } catch (err) {
    console.error(err);
  }
  return {
    props: { todayDate, todayAlmanac: todayAlmanac || null, featuredPosts },
    revalidate: 300,
  };
}
