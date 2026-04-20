import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { CARDS } from '../../lib/cards';
import { PERSON_BILL, ORGANIZATION, WEBSITE, graph, breadcrumb } from '../../lib/schema';
import styles from '../../styles/Home.module.css';

const CATEGORIES = ['Honor', 'Suit', 'Guardian'];

export default function CardsIndex() {
 const jsonLd = graph([
 ORGANIZATION,
 WEBSITE,
 PERSON_BILL,
 breadcrumb([
 { name: 'Home', url: '/' },
 { name: 'Card Meanings', url: '/cards' },
 ]),
 {
 '@type': 'CollectionPage',
 name: 'Mahjong Mirror Card Meanings',
 description:
 'The complete 42-card deck of The Mahjong Mirror, each card with its meaning, symbolism, and guidance in a reading.',
 url: 'https://www.mahjongtarot.com/cards',
 isPartOf: { '@id': 'https://www.mahjongtarot.com/#website' },
 about: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
 },
 ]);

 return (
 <>
 <SEO
 title="Mahjong Mirror Card Meanings, All 42 Cards | Mahjong Tarot"
 description="The complete Mahjong Mirror deck, meaning, symbolism, and reading guidance for all 42 cards including Dragon, Phoenix, Tiger, Pearl, Lotus, Seven Stars and more."
 path="/cards"
 jsonLd={jsonLd}
 />
 <Nav />
 <main>
 <section style={{ paddingTop: 'var(--space-4xl)', paddingBottom: 'var(--space-2xl)' }}>
 <div className="container">
 <div className={styles.sectionHeader}>
 <span className="overline">The Deck</span>
 <h1>Mahjong Mirror Card Meanings</h1>
 <p className={styles.sectionLead}>
 Forty-two hand-illustrated cards drawn from the ancient Chinese Mahjong tradition.
 Each carries a symbolic archetype, a situational meaning, and a nuance that shifts
 when it appears beside other cards in a reading.
 </p>
 </div>
 </div>
 </section>

 {CATEGORIES.map((cat) => (
 <section key={cat} style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-3xl)' }}>
 <div className="container">
 <h2 style={{ marginBottom: 'var(--space-lg)' }}>{cat} Cards</h2>
 <div className={styles.cardGallery}>
 {CARDS.filter((c) => c.category === cat).map((card) => (
 <Link key={card.slug} href={`/cards/${card.slug}`} className={styles.cardItem} style={{ textDecoration: 'none' }}>
 <figure style={{ margin: 0 }}>
 <div className={styles.cardImageWrap}>
 <Image
 src={`/images/cards/${card.slug}.webp`}
 alt={`${card.name}, Mahjong Mirror card`}
 fill
 style={{ objectFit: 'contain' }}
 />
 </div>
 <figcaption>
 <span className={styles.cardName}>{card.name}</span>
 <span className={styles.cardMeaning}>{card.short}</span>
 </figcaption>
 </figure>
 </Link>
 ))}
 </div>
 </div>
 </section>
 ))}
 </main>
 <Footer />
 </>
 );
}
