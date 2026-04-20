import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { CARDS, getCard } from '../../lib/cards';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph, breadcrumb, faqPage } from '../../lib/schema';
import styles from '../../styles/Home.module.css';

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
 <section style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-md)' }}>
 <div className="container">
 <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--mid-gray)', marginBottom: 'var(--space-lg)' }}>
 <Link href="/" style={{ color: 'inherit' }}>Home</Link>
 {' / '}
 <Link href="/cards" style={{ color: 'inherit' }}>Card Meanings</Link>
 {' / '}
 <span>{card.name}</span>
 </nav>
 </div>
 </section>

 <section style={{ paddingBottom: 'var(--space-3xl)' }}>
 <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 340px) 1fr', gap: 'var(--space-2xl)', alignItems: 'start' }}>
 <div className={styles.cardImageWrap} style={{ aspectRatio: '2/3', position: 'relative' }}>
 <Image
 src={`/images/cards/${card.slug}.webp`}
 alt={`${card.name}, Mahjong Mirror card illustration`}
 fill
 priority
 style={{ objectFit: 'contain' }}
 />
 </div>
 <div>
 <span className="overline">{card.category} Card</span>
 <h1 style={{ margin: 'var(--space-sm) 0 var(--space-md)' }}>
 {card.name}
 </h1>
 <p style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mystic-fire)', marginBottom: 'var(--space-lg)' }}>
 {card.short}
 </p>
 <p style={{ fontSize: 19, lineHeight: 1.7, marginBottom: 'var(--space-lg)', color: '#333' }}>
 <strong>In short:</strong> {card.summary}
 </p>
 <h2 style={{ marginBottom: 'var(--space-sm)' }}>What the {card.name} Means</h2>
 <p style={{ marginBottom: 'var(--space-lg)' }}>{card.summary}</p>
 <h2 style={{ marginBottom: 'var(--space-sm)' }}>When the {card.name} Appears in a Reading</h2>
 <p style={{ marginBottom: 'var(--space-lg)' }}>{card.reading}</p>

 <h2 style={{ marginBottom: 'var(--space-sm)' }}>Frequently Asked Questions</h2>
 <div style={{ marginBottom: 'var(--space-lg)' }}>
 <h3 style={{ fontSize: 18, marginBottom: 4 }}>What does the {card.name} card mean?</h3>
 <p style={{ marginBottom: 'var(--space-md)' }}>{card.summary}</p>
 <h3 style={{ fontSize: 18, marginBottom: 4 }}>When the {card.name} appears in a reading, what should I do?</h3>
 <p style={{ marginBottom: 'var(--space-md)' }}>{card.reading}</p>
 <h3 style={{ fontSize: 18, marginBottom: 4 }}>What category is the {card.name}?</h3>
 <p>{card.name} is a {card.category} card in the 42-card Mahjong Mirror deck developed by Bill Hajdu.</p>
 </div>

 <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-xl)' }}>
 <Link href="/readings#book" className="btn-primary">Book a Reading with Bill</Link>
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
