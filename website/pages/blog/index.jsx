import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import NewsletterSignup from '../../components/NewsletterSignup';
import styles from '../../styles/Blog.module.css';

const CATEGORIES = [
  'All Posts',
  'Romance',
  'Year of the Fire Horse',
  'Mahjong Reading',
  'Chinese Astrology',
];

const POSTS = [
  /* ── Add new posts at the TOP of this array ── */
  {
    slug: 'your-love-life-in-the-fire-horse-year',
    title: 'Your Love Life in the Fire Horse Year: What Every Sign Needs to Know',
    excerpt: 'The Fire Horse doesn\'t care how solid you think your relationship is. Here\'s what it actually means for your sign — and what to do about it.',
    categories: ['Year of the Fire Horse', 'Romance'],
    date: 'Apr 15, 2026',
    readTime: '8 min read',
  },
  {
    slug: 'swift-kelce-wedding-stars',
    title: 'What the Stars Actually Say About the Swift-Kelce Wedding',
    excerpt: 'Every Chinese astrology expert says two snakes is a bad match. But when you look at the elements - not just the signs - the charts tell a completely different story.',
    categories: ['Romance', 'Chinese Astrology'],
    date: 'Apr 13, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'love-in-the-fire-horse-year',
    title: 'Love in the Year of the Fire Horse: What 2026 Means for Your Relationships, Sign by Sign',
    excerpt: 'This is the one year in 60 where your partner is most likely to cheat and most likely to propose. Record proposals. Record divorces. The Fire Horse doesn\'t do anything halfway.',
    categories: ['Romance', 'Year of the Fire Horse'],
    date: 'Apr 6, 2026',
    readTime: '8 min read',
  },
  {
    slug: 'who-has-the-most-luck-in-the-fire-horse-year',
    title: 'Who Has the Most Luck in 2026 — Fire Horse Year? (And Why That\'s the Wrong Question)',
    excerpt: 'Tiger, Dog, and Sheep have the best alignment. But luck is not something that happens to you. It\'s something you create — and the Fire Horse rewards boldness.',
    categories: ['Year of the Fire Horse', 'Chinese Astrology'],
    date: 'Apr 5, 2026',
    readTime: '5 min read',
  },
  {
    slug: 'blood-moon-rising-in-the-year-of-the-fire-horse',
    title: 'A Once-in-a-Generation Blood Moon Signal Just Landed on the Most Volatile Year in the Chinese Zodiac',
    excerpt: 'A blood moon in the first lunar month has only happened twice in the last hundred years. The last time was 2007. This time it\'s amplified by the Fire Horse.',
    categories: ['Chinese Astrology', 'Year of the Fire Horse'],
    date: 'Apr 4, 2026',
    readTime: '5 min read',
  },
];

export default function BlogIndex() {
  const [active, setActive] = useState('All Posts');

  const filtered = active === 'All Posts'
    ? POSTS
    : POSTS.filter((p) => p.categories.includes(active));

  return (
    <>
      <Head>
        <title>Blog — Mahjong Tarot</title>
        <meta name="description" content="Insights on Mahjong readings, tarot, Chinese astrology, and divination practice from Bill Hajdu — The Firepig." />
        <meta property="og:title" content="Blog — Mahjong Tarot" />
        <meta property="og:description" content="Insights on Mahjong, tarot, and Chinese astrology from Bill Hajdu." />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://mahjong-tarot.com/blog" />
      </Head>

      <Nav />

      <main>
        {/* ── Page Header ── */}
        <section className={styles.pageHeader}>
          <div className="container">
            <span className="overline">Writing & Insight</span>
            <h1>The Blog</h1>
            <p className={styles.headerLead}>
              Reflections on Mahjong, tarot, Chinese astrology, and the wisdom
              hidden inside ancient symbols.
            </p>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link href="/the-mahjong-mirror#preorder" className="btn-primary">Preorder the Book</Link>
              <Link href="#newsletter" className="btn-secondary">Get Daily Fortune</Link>
            </div>
          </div>
        </section>

        {/* ── Featured ── */}
        <section className={`section-stone ${styles.featured}`}>
          <div className="container">
            <span className="overline">Featured</span>
            <div className={styles.featuredInner}>
              <Link href="/blog/posts/your-love-life-in-the-fire-horse-year" className={styles.featuredImage}>
                <Image
                  src="/images/blog/your-love-life-in-the-fire-horse-year.webp"
                  alt="Your Love Life in the Fire Horse Year — sign-by-sign relationship guide for 2026"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Link>
              <div className={styles.featuredText}>
                <span className="post-category">Year of the Fire Horse</span>
                <h2 className={styles.featuredTitle}>
                  <Link href="/blog/posts/your-love-life-in-the-fire-horse-year">
                    Your Love Life in the Fire Horse Year: What Every Sign Needs to Know
                  </Link>
                </h2>
                <p className={styles.featuredExcerpt}>
                  The Fire Horse doesn&rsquo;t care how solid you think your relationship is. Here&rsquo;s what it actually means for your sign &mdash; and what to do about it.
                </p>
                <Link href="/blog/posts/your-love-life-in-the-fire-horse-year" className="btn-secondary">Read the Article</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter ── */}
        <section className={styles.filterSection}>
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
                      <span className="post-category">{post.categories[0]}</span>
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

        {/* ── Newsletter ── */}
        <section className="section-stone">
          <div className="container">
            <NewsletterSignup source="blog" variant="light" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
