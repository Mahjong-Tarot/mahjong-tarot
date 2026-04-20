import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import styles from '../../../styles/BlogPost.module.css';

function FaqItem({ question, answer }) {
 const [open, setOpen] = useState(false);
 return (
 <div className={styles.faqItem} onClick={() => setOpen(!open)}>
 <h3 className={styles.faqQuestion}>
 <span>{question}</span>
 <span className={`${styles.faqIcon} ${open ? styles.faqIconOpen : ''}`}>+</span>
 </h3>
 {open && <p className={styles.faqAnswer}>{answer}</p>}
 </div>
 );
}

export default function PlanningAWeddingThroughTheMahjongMirror() {
 return (
 <>
 <Head>
 <title>The Mahjong Mirror Way to Plan a Wedding | Mahjong Tarot</title>
 <meta name="description" content="Plan your wedding from the inside out. The Mahjong Mirror framework asks two questions no wedding planner will, about meaning and intention. 5 steps to start today." />
 <meta property="og:title" content="The Mahjong Mirror Way to Plan a Wedding" />
 <meta property="og:description" content="The biggest day of your life deserves more than a color scheme. Two questions no wedding planner will ask, and a 5-step framework to answer them." />
 <meta property="og:image" content="https://mahjongtarot.com/images/blog/planning-a-wedding-through-the-mahjong-mirror.webp" />
 <meta property="og:site_name" content="The Mahjong Mirror" />
 <meta name="twitter:card" content="summary_large_image" />
 <link rel="canonical" href="https://mahjongtarot.com/blog/posts/planning-a-wedding-through-the-mahjong-mirror" />
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{
 __html: JSON.stringify([
 {
 '@context': 'https://schema.org',
 '@type': 'Article',
 headline: 'The Mahjong Mirror Way to Plan a Wedding',
 author: { '@type': 'Person', name: 'Bill Hajdu' },
 datePublished: '2026-04-15',
 image: 'https://mahjongtarot.com/images/blog/planning-a-wedding-through-the-mahjong-mirror.webp',
 publisher: {
 '@type': 'Organization',
 name: 'Mahjong Tarot',
 url: 'https://mahjongtarot.com',
 },
 },
 {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: [
 {
 '@type': 'Question',
 name: 'What is the Mahjong Mirror framework for wedding planning?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'The Mahjong Mirror is a four-angle reflection framework developed by Bill Hajdu over 35+ years of Chinese astrology practice. For wedding planning, it focuses on two key angles: your Central Theme (the deeper meaning driving your wedding decisions) and What You Really Want (your true intentions for the marriage itself, not just the event).',
 },
 },
 {
 '@type': 'Question',
 name: 'Do I need Mahjong tiles to use the Mirror framework for my wedding?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'No. The Mahjong Mirror framework can be used without any cards or tiles. It is a structured self-reflection process that any couple can do with honesty and a quiet room.',
 },
 },
 {
 '@type': 'Question',
 name: 'What is a Central Theme in the Mahjong Mirror?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'A Central Theme is the gravitational force shaping your situation, the deeper current beneath your surface choices. For a wedding, it might be authentic self-expression, family validation, genuine connection, or the desire to feel chosen. It is persistent and evolves over time.',
 },
 },
 {
 '@type': 'Question',
 name: 'How is the Mahjong Mirror different from astrology compatibility charts?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'Compatibility charts compare two people\u2019s signs and elements. The Mahjong Mirror goes deeper, it reveals what your relationship is actually about (the Central Theme) and what each partner truly wants from the marriage.',
 },
 },
 {
 '@type': 'Question',
 name: 'Can I book a Mahjong tile reading for relationship guidance?',
 acceptedAnswer: {
 '@type': 'Answer',
 text: 'Yes. Bill Hajdu offers personal Mahjong tile readings for individuals and couples seeking clarity on relationships, wedding planning, and major life decisions.',
 },
 },
 ],
 },
 ]),
 }}
 />
 </Head>

 <Nav />

 <main className={styles.article}>

 <header className={styles.header}>
 <nav className={styles.breadcrumb}>
 <Link href="/blog">Blog</Link> <span>/</span> <span>Romance</span>
 </nav>
 <span className={styles.categoryPill}>Romance</span>
 <h1>The Mahjong Mirror Way to Plan a Wedding</h1>
 <p className={styles.postMeta}>Apr 15, 2026 · Bill Hajdu · 6 min read</p>
 </header>

 <div className={styles.headerDivider}><hr /></div>

 <figure style={{ margin: '0 0 var(--space-2xl)' }}>
 <Image
 src="/images/blog/planning-a-wedding-through-the-mahjong-mirror.webp"
 alt="Two people sitting across from each other at a worn wooden table, each holding a handwritten page, the moment of honest listening in the Mahjong Mirror wedding planning framework"
 width={1408}
 height={768}
 priority
 style={{ width: '100%', height: 'auto' }}
 />
 </figure>

 <div className={styles.body}>

 <p>You can plan a wedding in six months. You can plan a marriage in an afternoon. Most people get that backwards.</p>

 <p>I'm the Firepig. And in over 35 years of doing readings, I've sat across the table from hundreds of women planning weddings. They come in with binders. Spreadsheets. Pinterest boards the size of a novel. They know their color palette, their venue, their playlist down to the last song. What they don't know, what almost nobody stops to figure out, is what the day actually means to them. Not the event. The meaning.</p>

 <p>On Monday, we talked about Taylor Swift and Travis Kelce, <Link href="/blog/posts/swift-kelce-wedding-stars">whether their match would actually work</Link>. The astrology was interesting. The tiles were revealing. But here's the thing I didn't say on Monday: astrology can tell you what energies are at play. The Mahjong Mirror can show you what's really going on beneath the surface. But neither one matters unless you've done the work of asking yourself the right questions first.</p>

 <p>That's what today is about. Not Taylor and Travis. You.</p>

 <p>If you're planning a wedding, or thinking about it, or wondering whether the relationship you're in is heading there, this is the framework that changes everything. You don't need Mahjong tiles to use it. You don't need a reading. You need honesty and about thirty minutes of quiet.</p>

 <h2>Why Most Wedding Planning Misses the Point</h2>

 <p>Here's what I see in readings, again and again. A woman sits down. She's engaged, or about to be. She asks about the wedding. "Will it go well? Is this the right time? What do the tiles say about my marriage?"</p>

 <p>And when I lay the tiles out, the Central Theme, the first card, the one that reveals what the situation is actually about, almost never lands on "wedding." It lands on identity. On fear. On a desire to be seen. On the need to feel safe.</p>

 <div className={styles.pullQuote}>
 <p>The wedding is the surface. Underneath it is a question most people never ask out loud.</p>
 </div>

 <p>The <Link href="/the-mahjong-mirror">Mahjong Mirror</Link> was built for exactly this. It doesn't care about your seating chart. It cares about what's driving you. And once you see that clearly, every decision, including the wedding, gets sharper.</p>

 <h2>The Two Angles That Matter Most</h2>

 <p>The Mahjong Mirror uses four angles of reflection. For wedding planning, two of them do the heavy lifting.</p>

 <p><strong>The First Angle: Your Central Theme.</strong> This is the gravitational force shaping your situation. Not the surface issue, the deeper current running beneath your choices. When you think you're deciding between a beach wedding and a ballroom, the Central Theme might reveal that you're actually navigating between what your family expects and what feels authentic to you. Or between proving something to the world and building something private and real.</p>

 <p><strong>The Fourth Angle: What Do I Really Want.</strong> This falls under the Second Angle of the Mirror, Looking at Yourself, and it's the question most couples skip entirely. They plan the event. They forget to plan the intention. What do you actually want from this marriage? Not the wedding day. The Tuesday morning three years from now. The hard conversation at midnight. The life you're building when nobody's watching.</p>

 <p>These two angles, the Central Theme and What You Really Want, form the foundation. Get them right, and the wedding plans itself. Skip them, and you're decorating a house with no foundation.</p>

 <figure style={{ margin: 'var(--space-2xl) auto', textAlign: 'center' }}>
 <Image
 src="/images/blog/planning-a-wedding-mirror-ducks.webp"
 alt="The Ducks suit card from the Mahjong Mirror deck on soft linen with a white camellia and a thin gold ring, symbol of devoted partnership"
 width={1024}
 height={1024}
 style={{ width: '100%', maxWidth: 600, height: 'auto' }}
 />
 <figcaption style={{ marginTop: 'var(--space-md)', fontSize: 14, color: 'var(--color-mid-gray, #888880)' }}>
 The Ducks card, mandarin ducks, the classical Chinese symbol of devoted partnership. Not decoration. A reminder of what you're actually building.
 </figcaption>
 </figure>

 <h2>How to Use the Mirror: Five Steps Before You Book a Single Vendor</h2>

 <h3>Step 1: Sit With the Central Theme Question, Alone</h3>

 <p>Before you talk to your partner, before you call your mother, before you open a single wedding website, sit somewhere quiet and ask yourself: <em>What is this wedding actually about for me?</em></p>

 <p>Not what it should be about. Not what looks good on Instagram. What it's actually about.</p>

 <p><strong>Why this matters:</strong> Central themes are persistent. They don't disappear when you change the venue or swap the dress. If your wedding is secretly about proving to your family that you made a good choice, that energy will be in every decision you make, and your partner will feel it even if they can't name it. Identifying the theme doesn't mean it's bad. It means you can work with it instead of being controlled by it.</p>

 <p>Write down your honest answer. One sentence. No editing for anyone else's eyes.</p>

 <h3>Step 2: Ask Your Partner the Same Question, Separately</h3>

 <p>Give them the same prompt. Same rules. Alone. One sentence.</p>

 <p><strong>Why this matters:</strong> Their Central Theme is almost certainly different from yours. That's not a problem, it's information. If your theme is "I want to feel chosen" and theirs is "I want to build something that lasts," those can dance together beautifully. But if you don't know what each other's themes are, you'll make decisions that serve one theme and undermine the other. Without even realizing it.</p>

 <h3>Step 3: Share Your Answers and Listen Without Fixing</h3>

 <p>Sit down together. Read your sentences to each other. Then do the hardest thing in any relationship: listen without immediately trying to fix, explain, or reassure.</p>

 <p><strong>Why this matters:</strong> This is the Mirror doing its work. The Mirror reflects what actually is, not what you want to see. Your partner's Central Theme might surprise you. It might make you uncomfortable. That discomfort is where the real wedding planning begins. The couples who can sit in that discomfort together are the ones who build marriages that last. The ones who rush past it build beautiful weddings and fragile marriages.</p>

 <h3>Step 4: Answer the Fourth Angle, What Do You Really Want From This Marriage?</h3>

 <p>Not from the wedding day. From the marriage. Five years in. Ten years in. When the flowers are dead and the photos are in a drawer.</p>

 <p>Each of you writes three things you want from the marriage itself. Not "a nice house" or "two kids." Deeper than that. "I want to feel safe enough to fail." "I want someone who tells me the truth even when I don't want to hear it." "I want to build something neither of us could build alone."</p>

 <p><strong>Why this matters:</strong> The Fourth Angle, What Do I Really Want, is generative. It creates growth. When you know what you actually want, your decisions stop being reactions and start being choices. Every wedding decision can then be tested against this list. Does this venue serve what we actually want? Does this guest list reflect the marriage we're building? Does this budget align with the life we're creating?</p>

 <h3>Step 5: Let the Answers Shape the Day</h3>

 <p>Now plan your wedding. But plan it from the inside out.</p>

 <p>If your Central Theme is authentic connection, maybe the 300-person reception isn't right. If what you really want is to feel like partners, equals building something together, maybe you write your own vows instead of reciting someone else's words. If your partner's theme is family legacy, maybe you honor that in ways that also serve your theme.</p>

 <p><strong>Why this matters:</strong> A wedding built on the Mirror's foundation isn't just an event. It's a declaration. Not to your guests, to yourselves. It says: we know what this is about, we know what we want, and every choice we made reflects that. That's a wedding with intention. And intention is the only foundation that holds.</p>

 <h2>What Taylor and Travis Can Teach You</h2>

 <p>Monday's analysis looked at the astrology, the Fire Horse energy, the elemental interplay, the tiles that would show up in a reading for that match. But here's what I want you to take from their story, whether the wedding happens or not:</p>

 <p>Every relationship has a Central Theme. The couples who thrive aren't the ones with perfect compatibility charts. They're the ones who know what their relationship is actually about, and build from there. The ones who tend the garden.</p>

 <p>You don't need to be a celebrity to do this work. You don't need tiles or charts or a reading. You need two people willing to sit with honest questions and listen to honest answers.</p>

 <p>That said, the tiles don't lie. And sometimes having a Mirror held up by someone who's been doing this for nearly four decades shows you things you couldn't see on your own.</p>

 <h2>A Word to the Wise</h2>

 <p>A wedding without intention is a party. A beautiful one, maybe. But still just a party.</p>

 <div className={styles.pullQuote}>
 <p>A wedding with intention is a foundation. The first day of something built to last.</p>
 </div>

 <p>The Mahjong Mirror shows you the difference. And you can start using it today, right now, with nothing but honesty and a quiet room.</p>

 <p>If you want to go deeper, if you want to understand the Central Theme running through your relationship and what the tiles reveal about the marriage you're building, <Link href="/the-mahjong-mirror"><em>The Mahjong Mirror: Your Path to Wiser Decisions</em></Link> walks you through the entire framework, step by step. No cards required.</p>

 <p>And if you want the tiles themselves to speak, if you want to sit across the table from someone who's done this thousands of times and hear what the Mirror reflects for you specifically, <Link href="/readings">book a reading</Link>. Bring your questions. I'll bring the tiles.</p>

 <p>Tend the garden.</p>

 <p>, Bill</p>

 <h2>Frequently Asked Questions</h2>

 <FaqItem
 question="What is the Mahjong Mirror framework for wedding planning?"
 answer="The Mahjong Mirror is a four-angle reflection framework developed by Bill Hajdu over 35+ years of Chinese astrology practice. For wedding planning, it focuses on two key angles: your Central Theme (the deeper meaning driving your wedding decisions) and What You Really Want (your true intentions for the marriage itself, not just the event)."
 />
 <FaqItem
 question="Do I need Mahjong tiles to use the Mirror framework for my wedding?"
 answer="No. The Mahjong Mirror framework can be used without any cards or tiles. It is a structured self-reflection process that any couple can do with honesty and a quiet room."
 />
 <FaqItem
 question="What is a Central Theme in the Mahjong Mirror?"
 answer="A Central Theme is the gravitational force shaping your situation, the deeper current beneath your surface choices. For a wedding, it might be authentic self-expression, family validation, genuine connection, or the desire to feel chosen."
 />
 <FaqItem
 question="How is the Mahjong Mirror different from astrology compatibility charts?"
 answer="Compatibility charts compare two people's signs and elements. The Mahjong Mirror goes deeper, it reveals what your relationship is actually about (the Central Theme) and what each partner truly wants from the marriage."
 />
 <FaqItem
 question="Can I book a Mahjong tile reading for relationship guidance?"
 answer="Yes. Bill Hajdu offers personal Mahjong tile readings for individuals and couples seeking clarity on relationships, wedding planning, and major life decisions."
 />

 <nav className={styles.postNav}>
 <Link href="/blog/posts/swift-kelce-wedding-stars" className={styles.navPrev}>
 ← What the Stars Say About the Swift-Kelce Wedding
 </Link>
 <span />
 </nav>

 </div>

 {/* ── Related Articles ── */}
 <div className={styles.relatedSection}>
 <h2>More Articles</h2>
 <div className={styles.relatedGrid}>
 <Link href="/blog/posts/swift-kelce-wedding-stars" className={styles.relatedCard}>
 <div className={styles.relatedCardImage}>
 <Image
 src="/images/blog/swift-kelce-wedding-stars.webp"
 alt="What the Stars Actually Say About the Swift-Kelce Wedding"
 fill
 style={{ objectFit: 'cover' }}
 />
 </div>
 <h3>What the Stars Say About the Swift-Kelce Wedding</h3>
 <span>Apr 13, 2026</span>
 </Link>
 <Link href="/blog/posts/love-in-the-fire-horse-year" className={styles.relatedCard}>
 <div className={styles.relatedCardImage}>
 <Image
 src="/images/blog/love-in-the-fire-horse-year.webp"
 alt="Love in the Year of the Fire Horse"
 fill
 style={{ objectFit: 'cover' }}
 />
 </div>
 <h3>Love in the Year of the Fire Horse</h3>
 <span>Apr 6, 2026</span>
 </Link>
 </div>
 </div>

 {/* ── Post CTA ── */}
 <div className={styles.ctaSection}>
 <span className={styles.ctaOverline}>Plan the Marriage, Not Just the Wedding</span>
 <h2>Book a Reading with Bill</h2>
 <p>Sit across the table from someone who's done this for nearly four decades. Bring your questions. Bill brings the tiles.</p>
 <Link href="/readings#book" className="btn-primary" style={{ marginRight: 16 }}>Book a Reading</Link>
 <Link href="/the-mahjong-mirror" className="btn-secondary">Preorder the Book</Link>
 </div>
 </main>

 <Footer />
 </>
 );
}
