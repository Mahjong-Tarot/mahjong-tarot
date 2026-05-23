import Image from 'next/image';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph, breadcrumb, faqPage } from '../lib/schema';
import styles from '../styles/MahjongMirror.module.css';

export default function TheMahjongMirror() {
 return (
 <>
 <SEO
 title="The Mahjong Mirror Book & Deck by Bill Hajdu, Modern Divination System"
 description="The Mahjong Mirror by Bill Hajdu, a 42-card divination system grounded in traditional Chinese Mahjong symbolism. Book and deck coming soon. Preorder your copy."
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
 bookFormat: 'https://schema.org/Hardcover',
 inLanguage: 'en',
 },
 faqPage([
 { q: 'What is The Mahjong Mirror?', a: 'The Mahjong Mirror is a 42-card divination system created by Bill Hajdu, drawing on traditional Chinese Mahjong symbolism to support self-reflection, decision-making, and spiritual clarity.' },
 { q: 'Do I need to know Mahjong to use it?', a: 'No. The Mahjong Mirror is designed to be used without any prior knowledge of Mahjong. Each card carries a symbolic meaning explained in the accompanying book.' },
 { q: 'When is the book available?', a: 'The Mahjong Mirror is coming soon. Join the preorder list to be notified when it ships.' },
 ]),
 ])}
 />

 <Nav />

 <main>
 {/* ── Hero ── */}
 <section className={styles.hero}>
 <div className={`container ${styles.heroInner}`}>
 <div className={styles.heroText}>
 <span className="overline">Coming Soon</span>
 <h1>Unlock Your Destiny<br />Through the<br /><em>Mahjong Mirror</em></h1>
 <p className={styles.heroLead}>
 A modern divination system inspired by ancient Mahjong symbolism, 
 guiding you toward clarity, intuition, and deeper self-discovery.
 </p>
 <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
 <Link href="/the-mahjong-mirror/order" className="btn-primary">Pre-Order the Book</Link>
 <Link href="/book-a-reading" className="btn-secondary">Book a Private Reading</Link>
 </div>
 </div>
 <div className={styles.heroCover}>
 <Image
 src="/images/book-cover.webp"
 alt="The Mahjong Mirror, Your Path to Wiser Decisions by Bill Hajdu"
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
 and life cycles, guiding you with clarity and intuition even if
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
 <section>
 <div className={`container ${styles.why}`}>
 <span className="overline">Why This System Matters</span>
 <blockquote className={styles.whyQuote}>
 The Mahjong Mirror blends cultural symbolism, intuitive reading,
 and personal insight into one harmonious system, offering depth
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
 alt="Bill Hajdu, The Firepig"
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
 <section id="preorder" className="section-stone">
 <div className={`container ${styles.preorder}`}>
 <span className="overline">Begin Your Journey Through the Tiles</span>
 <h2>Ready to Reserve Your Copy?</h2>
 <p>
 Pre-order the digital edition, the hardcopy, or the signed bundle
 with the Mahjong Mirror Card Set. Or join the waitlist and Bill will
 follow up with you directly.
 </p>
 <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
 <Link href="/the-mahjong-mirror/order" className="btn-primary">Pre-Order the Book</Link>
 <Link href="/contact?subject=Mahjong+Mirror+Waitlist" className="btn-secondary">Join the Waitlist</Link>
 </div>
 </div>
 </section>

 </main>

 <Footer />
 </>
 );
}
