import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import NewsletterSignup from '../../components/NewsletterSignup';
import SEO from '../../components/SEO';
import { ORGANIZATION, WEBSITE, PERSON_BILL, graph, breadcrumb } from '../../lib/schema';
import { POSTS } from '../../lib/posts';
import styles from '../../styles/Blog.module.css';

const CATEGORIES = [
  'All Posts',
  'Romance',
  'Year of the Fire Horse',
  'Mahjong Reading',
  'Chinese Astrology',
];

export default function BlogIndex() {
  const [active, setActive] = useState('All Posts');

  const filtered = active === 'All Posts'
    ? POSTS
    : POSTS.filter((p) => p.categories.includes(active));

  return (
    <>
      <SEO
        title="Mahjong Tarot Blog — Chinese Astrology, Fire Horse Year & Divination Insights"
        description="Insights on Mahjong readings, tarot, Chinese Four Pillars astrology, and the Year of the Fire Horse from Bill Hajdu — The Firepig."
        path="/blog"
        jsonLd={graph([
          ORGANIZATION,
          WEBSITE,
          PERSON_BILL,
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
          ]),
          {
            '@type': 'Blog',
            url: 'https://www.mahjongtarot.com/blog',
            name: 'Mahjong Tarot Blog',
            author: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
            blogPost: POSTS.slice(0, 10).map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              datePublished: p.isoDate,
              url: `https://www.mahjongtarot.com/blog/posts/${p.slug}`,
              author: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
            })),
          },
        ])}
      />

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
              <Link href="/blog/posts/swift-kelce-wedding-stars" className={styles.featuredImage}>
                <Image
                  src="/images/blog/swift-kelce-wedding-stars.webp"
                  alt="What the Stars Actually Say About the Swift-Kelce Wedding"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Link>
              <div className={styles.featuredText}>
                <span className="post-category">Romance</span>
                <h2 className={styles.featuredTitle}>
                  <Link href="/blog/posts/swift-kelce-wedding-stars">
                    What the Stars Actually Say About the Swift-Kelce Wedding
                  </Link>
                </h2>
                <p className={styles.featuredExcerpt}>
                  Every Chinese astrology expert says two snakes is a bad match. But when you look at the elements, the charts tell a completely different story.
                </p>
                <Link href="/blog/posts/swift-kelce-wedding-stars" className="btn-secondary">Read the Article</Link>
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
