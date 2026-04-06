import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import styles from '../../styles/Blog.module.css';

const CATEGORIES = [
  'All Posts',
  'Mahjong and Tarot',
  'Tarot',
  'Mahjong Readings',
  'Year of the Snake',
  'Year of the Fire Horse',
  'Blood Moon',
];

const POSTS = [
  /* ── Add new posts at the TOP of this array ── */
  {
    slug: 'blood-moon-signal',
    title: 'A Once-in-a-Generation Blood Moon Signal Just Landed on the Most Volatile Year in the Chinese Zodiac',
    excerpt: 'On March 14, a blood moon rose during the first lunar month of the Chinese New Year. That alone would be extraordinary, but this year it collides with the Fire Snake.',
    category: 'Blood Moon',
    date: 'Mar 20, 2025',
    readTime: '5 min read',
  },
  {
    slug: 'accidental-astrologer-introduction',
    title: 'The Accidental Astrologer: Introduction',
    excerpt: 'This is the introduction to my new book called The Accidental Astrologer. I would love to get your opinion on this content.',
    category: 'Mahjong and Tarot',
    date: 'May 29, 2025',
    readTime: '4 min read',
  },
  {
    slug: 'mahjong-tarot-vs-tarot',
    title: 'Exploring the Similarities and Differences Between Mah Jong Tarot and Tarot',
    excerpt: 'When it comes to tools for fortune-telling, divination, or gaining deeper insights into life\'s challenges, Mah Jong Tarot and Tarot stand out.',
    category: 'Mahjong and Tarot',
    date: 'Jan 22, 2025',
    readTime: '3 min read',
  },
  {
    slug: 'year-of-the-snake-insights',
    title: 'Embrace the Year of the Snake: Eight Insights for Personal Growth and Success',
    excerpt: 'The Year of the Snake unfolds with a quiet power that contrasts with the boldness of the Dragon. It invites us to slow down, reflect, and tap into deeper wisdom.',
    category: 'Year of the Snake',
    date: 'Jan 22, 2025',
    readTime: '2 min read',
  },
  {
    slug: 'five-reasons-mahjong-reading',
    title: '5 Reasons Why You Should Get a Mah-Jong Reading (Even if You Already Love Tarot)',
    excerpt: 'These ancient tiles offer a unique way to gain insights and navigate life\'s complexities. Here\'s why a Mahjong reading deserves a place in your practice.',
    category: 'Mahjong Readings',
    date: 'Jan 22, 2025',
    readTime: '2 min read',
  },
  {
    slug: 'mahjong-readings-entrepreneurs',
    title: 'Ancient Cards, Modern Insights: The Expert Secrets of Mahjong Readings for Entrepreneurs',
    excerpt: 'I find it fascinating how the cards reflect real-life situations. I\'ve worked with groups from the Fortune 500 to the EO community.',
    category: 'Mahjong Readings',
    date: 'Jan 22, 2025',
    readTime: '2 min read',
  },
  {
    slug: 'relationships-year-of-the-snake',
    title: 'Unlocking the Secrets of Relationships in the Year of the Snake',
    excerpt: 'Relationships, like rivers, flow through the seasons of life, shaped by the energies of the times. The Snake year brings unique currents.',
    category: 'Year of the Snake',
    date: 'Jan 22, 2025',
    readTime: '2 min read',
  },
];

export default function BlogIndex() {
  const [active, setActive] = useState('All Posts');

  const filtered = active === 'All Posts'
    ? POSTS
    : POSTS.filter((p) => p.category === active);

  return (
    <>
      <Head>
        <title>Blog — The Mahjong Tarot</title>
        <meta name="description" content="Insights on Mahjong readings, tarot, Chinese astrology, and divination practice from Bill Hajdu — The Firepig." />
        <meta property="og:title" content="Blog — The Mahjong Tarot" />
        <meta property="og:description" content="Insights on Mahjong, tarot, and Chinese astrology from Bill Hajdu." />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/blog" />
      </Head>

      <Nav />

      <main>
        {/* ── Page Header ── */}
        <section className={`section-dark ${styles.pageHeader}`}>
          <div className="container">
            <span className="overline" style={{ color: 'var(--celestial-gold)' }}>Writing & Insight</span>
            <h1>The Blog</h1>
            <p className={styles.headerLead}>
              Reflections on Mahjong, tarot, Chinese astrology, and the wisdom
              hidden inside ancient symbols.
            </p>
          </div>
        </section>

        {/* ── Filter ── */}
        <section className={`section-stone ${styles.filterSection}`}>
          <div className="container">
            <div className={styles.filters}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${active === cat ? styles.filterActive : ''}`}
                  onClick={() => setActive(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Post Grid ── */}
        <section>
          <div className="container">
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>No posts yet in this category. Check back soon.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((post) => (
                  <article key={post.slug} className={styles.card}>
                    <Link href={`/blog/posts/${post.slug}`} className={styles.cardImageLink}>
                      <div className={styles.cardImage}>
                        <Image
                          src={`/images/blog/${post.slug}.webp`}
                          alt={post.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </Link>
                    <div className={styles.cardBody}>
                      <span className="post-category">{post.category}</span>
                      <h2 className={styles.cardTitle}>
                        <Link href={`/blog/posts/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>
                      <div className={styles.cardMeta}>
                        <span className="post-meta">{post.date} · {post.readTime}</span>
                        <Link href={`/blog/posts/${post.slug}`} className={styles.readMore}>
                          Read more →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
