import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import NewsletterSignup from '../../components/NewsletterSignup';
import SEO from '../../components/SEO';
import { ORGANIZATION, WEBSITE, PERSON_BILL, graph, breadcrumb } from '../../lib/schema';
import { listPublishedPosts, TOPICS } from '../../lib/blogDb';
import styles from '../../styles/Blog.module.css';

// Topic tabs are derived from the canonical topic list, so every tab always
// has posts and every post always has a matching tab.
const ALL = 'All posts';
const CATEGORIES = [ALL, ...TOPICS];
const PAGE_SIZE = 12;

export default function BlogIndex({ posts }) {
  const [active, setActive] = useState(ALL);
  const [shown, setShown] = useState(PAGE_SIZE);

  const list = active === ALL ? posts : posts.filter((p) => p.topic === active);
  const featured = list[0];
  const rest = list.slice(1);
  const visible = rest.slice(0, shown);

  function pick(cat) {
    setActive(cat);
    setShown(PAGE_SIZE);
  }

  return (
    <>
      <SEO
        title="Mahjong Tarot Blog, Chinese Astrology, Fire Horse Year & Divination Insights"
        description="Insights on Mahjong readings, tarot, Chinese Four Pillars astrology, and the Year of the Fire Horse from Bill Hajdu, The Firepig."
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
            blogPost: posts.slice(0, 10).map((p) => ({
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
        {/* ── Masthead ── */}
        <section className={styles.masthead}>
          <div className="container">
            <div className={styles.mastheadRow}>
              <h1 className={styles.title}>The blog</h1>
              <p className={styles.lead}>
                Notes on the year ahead, the tiles, and the slower kind of
                wisdom, published whenever the timing feels right.
              </p>
            </div>
            <div className={styles.tabs} role="group" aria-label="Topics">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.tab} ${active === cat ? styles.tabActive : ''}`}
                  aria-pressed={active === cat}
                  onClick={() => pick(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured ── (absent only when there are no posts, e.g. a
            preview build with no database key) */}
        {featured ? (
          <section className={styles.featuredSection}>
            <div className="container">
              <Link href={`/blog/posts/${featured.slug}`} className={styles.featured}>
                <div className={styles.featuredImage}>
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className={styles.cover}
                    priority
                  />
                </div>
                <div className={styles.featuredText}>
                  <div className={styles.meta}>
                    Latest{featured.topic ? ` · ${featured.topic}` : ''} · {featured.date}
                  </div>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                  {featured.excerpt && <p className={styles.featuredExcerpt}>{featured.excerpt}</p>}
                  <span className={styles.readLink}>Read the post →</span>
                </div>
              </Link>
            </div>
          </section>
        ) : (
          <section className={styles.featuredSection}>
            <div className="container">
              <p className={styles.empty}>No posts yet in this topic. Check back soon.</p>
            </div>
          </section>
        )}

        {/* ── Post grid ── */}
        {visible.length > 0 && (
          <section className={styles.gridSection}>
            <div className="container">
              <div className={styles.grid}>
                {visible.map((post) => (
                  <Link key={post.slug} href={`/blog/posts/${post.slug}`} className={styles.card}>
                    <div className={styles.cardImage}>
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        className={styles.cover}
                      />
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.meta}>
                        {post.topic ? `${post.topic} · ` : ''}{post.date}
                      </div>
                      <h3 className={styles.cardTitle}>{post.title}</h3>
                      {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
              {rest.length > shown && (
                <div className={styles.more}>
                  <button
                    type="button"
                    className={styles.moreBtn}
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                  >
                    More posts
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Newsletter ── */}
        <section id="newsletter" className={styles.newsletter}>
          <div className={`container ${styles.newsletterInner}`}>
            <div className={styles.newsletterText}>
              <h2 className={styles.newsletterTitle}>In your inbox, insights for the year ahead</h2>
              <p className={styles.newsletterLead}>
                Notes on Mahjong, tarot, and Chinese astrology, sent whenever
                there&rsquo;s something worth saying. Never more than twice a month.
              </p>
            </div>
            <div className={styles.newsletterForm}>
              <NewsletterSignup source="blog" variant="footer" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export async function getStaticProps() {
  // Posts come from the blog database (company_os.marketing_content), only
  // those whose publish date has arrived. revalidate picks up new posts and
  // flips date-gated ones in without a redeploy.
  return {
    props: { posts: await listPublishedPosts() },
    revalidate: 300,
  };
}
