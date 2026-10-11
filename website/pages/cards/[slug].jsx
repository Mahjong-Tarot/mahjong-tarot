import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { CARDS, getCard } from '../../lib/cards';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph, breadcrumb, faqPage } from '../../lib/schema';
import styles from '../../styles/Cards.module.css';

export async function getStaticPaths() {
 return {
 paths: CARDS.map((c) => ({ params: { slug: c.slug } })),
 fallback: false,
 };
}

export async function getStaticProps({ params }) {
 const card = getCard(params.slug);
 return { props: { card } };
}

export default function CardPage({ card }) {
 const title = `${card.name}, Meaning in a Mahjong Tarot Reading`;
 const description = `${card.summary} Learn what the ${card.name} card means in The Mahjong Mirror system by Bill Hajdu.`;

 const jsonLd = graph([
 ORGANIZATION,
 WEBSITE,
 PERSON_BILL,
 breadcrumb([
 { name: 'Home', url: '/' },
 { name: 'Card Meanings', url: '/cards' },
 { name: card.name, url: `/cards/${card.slug}` },
 ]),
 {
 '@type': 'Article',
 headline: `${card.name}, Meaning in a Mahjong Tarot Reading`,
 description: card.summary,
 author: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
 publisher: { '@id': 'https://www.mahjongtarot.com/#org' },
 image: `https://www.mahjongtarot.com/images/cards/${card.slug}.webp`,
 mainEntityOfPage: `https://www.mahjongtarot.com/cards/${card.slug}`,
 about: card.name,
 },
 faqPage([
 {
 q: `What does the ${card.name} card mean?`,
 a: card.summary,
 },
 {
 q: `When the ${card.name} appears in a reading, what should I do?`,
 a: card.reading,
 },
 {
 q: `What category is the ${card.name} in The Mahjong Mirror deck?`,
 a: `${card.name} is a ${card.category} card in the 42-card Mahjong Mirror deck by Bill Hajdu.`,
 },
 ]),
 ]);

 return (
 <>
 <SEO
 title={`${title} | Mahjong Tarot`}
 description={description}
 path={`/cards/${card.slug}`}
 image={`/images/cards/${card.slug}.webp`}
 type="article"
 jsonLd={jsonLd}
 />
 <Nav />
 <main>
 <section className={styles.crumbSection}>
 <div className="container">
 <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
 <Link href="/">Home</Link>
 {' / '}
 <Link href="/cards">Card Meanings</Link>
 {' / '}
 <span>{card.name}</span>
 </nav>
 </div>
 </section>

 <section className={styles.detailSection}>
 <div className={`container ${styles.detail}`}>
 <div className={styles.imageWrap}>
 <Image
 src={`/images/cards/${card.slug}.webp`}
 alt={`${card.name}, Mahjong Mirror card illustration`}
 fill
 priority
 sizes="(max-width: 768px) 240px, 340px"
 className={styles.image}
 />
 </div>
 <div>
 <span className="overline">{card.category} Card</span>
 <h1 className={styles.title}>
 {card.name}
 </h1>
 <p className={styles.short}>
 {card.short}
 </p>
 <p className={styles.lede}>
 <strong>In short:</strong> {card.summary}
 </p>
 <h2 className={styles.h2}>What the {card.name} Means</h2>
 <p className={styles.para}>{card.summary}</p>
 <h2 className={styles.h2}>When the {card.name} Appears in a Reading</h2>
 <p className={styles.para}>{card.reading}</p>

 <h2 className={styles.h2}>Frequently Asked Questions</h2>
 <div className={styles.faq}>
 <h3>What does the {card.name} card mean?</h3>
 <p>{card.summary}</p>
 <h3>When the {card.name} appears in a reading, what should I do?</h3>
 <p>{card.reading}</p>
 <h3>What category is the {card.name}?</h3>
 <p>{card.name} is a {card.category} card in the 42-card Mahjong Mirror deck developed by Bill Hajdu.</p>
 </div>

 <div className={styles.actions}>
 <Link href="/book-a-reading" className="btn-primary">Book a Private Reading with Bill</Link>
 <Link href="/cards" className="btn-secondary">All 42 Cards</Link>
 </div>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}
