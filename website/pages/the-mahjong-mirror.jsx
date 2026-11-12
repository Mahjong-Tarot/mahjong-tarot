import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph, breadcrumb, faqPage } from '../lib/schema';
import styles from '../styles/MahjongMirror.module.css';

const AMAZON_URL = 'https://www.amazon.com/dp/B0HQZZXXLC';

const ANGLES = [
  { title: 'Your central theme', body: 'The gravitational force shaping your situation, the one thing that influences everything else in your life right now.' },
  { title: 'Looking at yourself', body: 'Understanding who you are, who you need to become, what you truly want, and what\u2019s happening in your life at this moment.' },
  { title: 'Examining your opposition', body: 'The obstacles, challenges, and resistance you must navigate to reach your goals.' },
  { title: 'Exploring your future', body: 'The probabilities and possibilities that await, both in the near term and beyond.' },
];

const LEARN = [
  'Decode the symbolism behind all Mahjong suits and special tiles',
  'Perform self-readings with step-by-step guidance',
  'Interpret emotions, decisions, relationships, and personal cycles',
  'Understand tile patterns as messages',
  'Practice with sample spreads and real-life examples',
  'Strengthen intuition using a familiar, visual system',
];

const AUDIENCE = [
  'Tarot and oracle readers wanting a fresh symbolic tool',
  'Anyone drawn to Asian-inspired spirituality',
  'Beginners seeking simple, visual divination',
  'People exploring clarity in love, purpose, or emotional growth',
  'Creatives, intuitives, and self-discovery seekers',
];

export default function TheMahjongMirror() {
 return (
 <>
 <SEO
 title="The Mahjong Mirror Book & Deck by Bill Hajdu, Modern Divination System"
 description="The Mahjong Mirror by Bill Hajdu, a 42-card divination system grounded in traditional Chinese Mahjong symbolism. Kindle edition available now on Amazon."
 path="/the-mahjong-mirror"
 image="/images/book-cover.webp"
 type="book"
 jsonLd={graph([
 ORGANIZATION,
 WEBSITE,
 PERSON_BILL,
 breadcrumb([
 { name: 'Home', url: '/' },
 { name: 'The Mahjong Mirror', url: '/the-mahjong-mirror' },
 ]),
 {
 '@type': 'Book',
 name: 'The Mahjong Mirror: Your Path to Wiser Decisions',
 author: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
 image: 'https://www.mahjongtarot.com/images/book-cover.webp',
 description:
 'A modern divination system inspired by ancient Mahjong symbolism, guiding you toward clarity, intuition, and deeper self-discovery. 42 cards, grounded in Chinese tradition.',
 url: 'https://www.mahjongtarot.com/the-mahjong-mirror',
 bookFormat: 'https://schema.org/EBook',
 inLanguage: 'en',
 },
 faqPage([
 { q: 'What is The Mahjong Mirror?', a: 'The Mahjong Mirror is a 42-card divination system created by Bill Hajdu, drawing on traditional Chinese Mahjong symbolism to support self-reflection, decision-making, and spiritual clarity.' },
 { q: 'Do I need to know Mahjong to use it?', a: 'No. The Mahjong Mirror is designed to be used without any prior knowledge of Mahjong. Each card carries a symbolic meaning explained in the accompanying book.' },
 { q: 'When is the book available?', a: 'The Kindle edition of The Mahjong Mirror is available now on Amazon.' },
 ]),
 ])}
 />

      <Nav />

      <main>
        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <span className="overline">Now on Amazon</span>
              <h1 className={styles.heroTitle}>
                The Mahjong Mirror: <em>your path to wiser decisions</em>
              </h1>
              <p className={styles.heroLead}>
                A modern divination system inspired by ancient Mahjong symbolism,
                guiding you toward clarity, intuition, and deeper self-discovery.
              </p>
              <div className={styles.ctaRow}>
                <a href={AMAZON_URL} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>Buy on Amazon · $12.95</a>
                <Link href="/the-mahjong-mirror/sample" className={styles.btnOutline}>Read the introduction</Link>
              </div>
              <p className={styles.heroNote}>
                Kindle edition, by Bill Hajdu. Members get a copy free.{' '}
                <Link href="/membership">See membership</Link>
              </p>
            </div>
            <div className={styles.heroCover}>
              <Image
                src="/images/book-cover.webp"
                alt="Cover of The Mahjong Mirror, Your Path to Wiser Decisions, by Bill Hajdu"
                width={360}
                height={490}
                sizes="(max-width: 640px) 80vw, 360px"
                className={styles.coverImg}
                priority
              />
            </div>
          </div>
        </section>

        {/* ── 01 What it is ── */}
        <section className={`${styles.band} ${styles.tint}`}>
          <div className="container">
            <div className={styles.bandLabel}>01 · What it is</div>
            <div className={styles.split}>
              <h2 className={styles.splitTitle}>What is the Mahjong Mirror?</h2>
              <p className={styles.splitBody}>
                The Mahjong Mirror is a divination method that transforms traditional
                Mahjong tiles into a symbolic language for self-reflection, where each
                tile becomes a portal representing energies, archetypes, situations,
                and life cycles, guiding you with clarity and intuition even if
                you&rsquo;ve never played Mahjong before.
              </p>
            </div>
          </div>
        </section>

        {/* ── 02 Four angles ── */}
        <section className={styles.band}>
          <div className="container">
            <div className={`${styles.bandLabel} ${styles.bandLabelSplit}`}>
              <span>02 · A mirror with four angles</span>
              <span className={styles.bandLabelAside}>From the introduction</span>
            </div>
            <div className={styles.angles}>
              {ANGLES.map((a, i) => (
                <div key={a.title} className={styles.angle}>
                  <div className={styles.angleNum}>{i + 1}</div>
                  <h3 className={styles.angleTitle}>{a.title}</h3>
                  <p className={styles.angleBody}>{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 03 What you will learn ── */}
        <section className={`${styles.band} ${styles.tint}`}>
          <div className="container">
            <div className={styles.bandLabel}>03 · Inside the book</div>
            <div className={styles.split}>
              <h2 className={styles.splitTitle}>What you will learn</h2>
              <ol className={styles.learnList}>
                {LEARN.map((item) => (
                  <li key={item} className={styles.learnItem}>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── 04 Who it is for ── */}
        <section className={styles.band}>
          <div className="container">
            <div className={styles.bandLabel}>04 · Who this book is for</div>
            <div className={styles.audience}>
              {AUDIENCE.map((label) => (
                <p key={label} className={styles.audienceItem}>{label}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── 05 Author ── */}
        <section className={`${styles.band} ${styles.tint}`}>
          <div className="container">
            <div className={styles.bandLabel}>05 · The author</div>
            <div className={styles.author}>
              <div className={styles.authorImage}>
                <Image
                  src="/images/about-portrait.webp"
                  alt="Bill Hajdu, The Firepig"
                  fill
                  sizes="(max-width: 640px) 90vw, 300px"
                  className={styles.portrait}
                />
              </div>
              <div className={styles.authorText}>
                <h2 className={styles.authorTitle}>Bill Hajdu, the Firepig</h2>
                <p className={styles.authorBody}>
                  Drawing on decades of deep study and a sharp eye for hidden truths,
                  Bill Hajdu merges ancient Chinese wisdom with modern insight to
                  guide people toward clarity and balanced living. A former Air Force
                  Interrogator and seasoned scholar, he empowers clients with empathy,
                  authenticity, and practical steps for lasting transformation.
                </p>
                <Link href="/about" className={styles.textLink}>Learn more about Bill →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing ── */}
        <section id="preorder" className={styles.closing}>
          <div className={`container ${styles.closingInner}`}>
            <div className={styles.closingText}>
              <h2 className={styles.closingTitle}>Ready for your copy?</h2>
              <p className={styles.closingBody}>
                The Kindle edition is on Amazon now, or free when you join as a member.
              </p>
            </div>
            <div className={styles.ctaRow}>
              <a href={AMAZON_URL} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>Buy on Amazon · $12.95</a>
              <Link href="/membership" className={styles.btnOutline}>Get it free with membership</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
