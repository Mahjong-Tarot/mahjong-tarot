// Dynamic blog post template.
//
// Renders any post at /blog/posts/<slug> from the markdown source at
//   <repo>/content/blog/<slug>.md
//
// This file replaces 16 hand-written per-post JSX files that all shared
// ~90% boilerplate (identical <Head>/<Nav>/<Footer> wiring, an inlined
// FaqItem component duplicated 12 times, hand-written JSON-LD).
//
// Per-post knobs live in the markdown frontmatter — see lib/blogContent.js
// for the full schema. Anything that isn't expressible in standard markdown
// (Swift/Kelce's risk cards, the love post's sign grid, mid-body figures
// with figcaptions) goes in as raw HTML in the body — `marked` passes
// inline HTML through unchanged, so those blocks render exactly as the
// hand-written JSX did.
//
// The lib/posts.js index is unchanged and remains the canonical ordered
// list used by the /blog listing page.

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import FaqItem from '../../../components/FaqItem';
import styles from '../../../styles/BlogPost.module.css';
import { listSlugs, loadPost } from '../../../lib/blogContent';

export default function BlogPost({ frontmatter, html }) {
  const {
    title,
    date,
    readTime,
    author = 'Bill Hajdu',
    categoryPill,
    breadcrumbLabel,
    hero,
    seo = {},
    jsonLd = {},
    faqs = [],
    nav = {},
    related = [],
    cta,
  } = frontmatter;

  const og = seo.og || {};
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: jsonLd.headline || title,
    author: { '@type': 'Person', name: author },
    datePublished: jsonLd.datePublished,
    image: jsonLd.image || og.image,
    publisher: {
      '@type': 'Organization',
      name: 'Mahjong Tarot',
      url: jsonLd.publisherUrl || 'https://mahjongtarot.com',
    },
  };

  const schemas = [articleSchema];
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const breadcrumb = breadcrumbLabel || categoryPill;

  return (
    <>
      <Head>
        <title>{seo.title || title}</title>
        {seo.description && <meta name="description" content={seo.description} />}
        {og.title && <meta property="og:title" content={og.title} />}
        {og.description && <meta property="og:description" content={og.description} />}
        {og.image && <meta property="og:image" content={og.image} />}
        {og.siteName && <meta property="og:site_name" content={og.siteName} />}
        <meta name="twitter:card" content="summary_large_image" />
        {seo.canonical && <link rel="canonical" href={seo.canonical} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas.length === 1 ? schemas[0] : schemas),
          }}
        />
      </Head>

      <Nav />

      <main className={styles.article}>
        <header className={styles.header}>
          <nav className={styles.breadcrumb}>
            <Link href="/blog">Blog</Link> <span>/</span> <span>{breadcrumb}</span>
          </nav>
          <span className={styles.categoryPill}>{categoryPill}</span>
          <h1>{title}</h1>
          <p className={styles.postMeta}>
            {date} · {author} · {readTime}
          </p>
        </header>

        <div className={styles.headerDivider}><hr /></div>

        {hero && hero.src && (
          <figure
            className={hero.useHeroClass ? styles.hero : undefined}
            style={hero.useHeroClass ? undefined : { margin: '0 0 var(--space-2xl)' }}
          >
            <Image
              src={hero.src}
              alt={hero.alt || title}
              width={hero.width || 1200}
              height={hero.height || 630}
              priority
              style={{ width: '100%', height: 'auto', ...(hero.useHeroClass ? { objectFit: 'cover' } : null) }}
            />
            {hero.caption && (
              <figcaption
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  color: 'var(--ink-4)',
                  marginTop: 'var(--space-sm)',
                  textAlign: 'center',
                }}
              >
                {hero.caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className={styles.body}>
          {/* Body is markdown rendered to HTML. Raw HTML in the source is
              preserved so posts that used bespoke layout blocks (risk cards,
              sign grids, mid-body figures) render exactly as before. */}
          <div dangerouslySetInnerHTML={{ __html: html }} />

          {faqs.length > 0 && (
            <>
              <h2>Frequently Asked Questions</h2>
              {faqs.map((f) => (
                <FaqItem key={f.q} question={f.q} answer={f.a} />
              ))}
            </>
          )}

          {(nav.prev || nav.next) && (
            <nav className={styles.postNav}>
              {nav.prev ? (
                <Link href={`/blog/posts/${nav.prev.slug}`} className={styles.navPrev}>
                  {`← ${nav.prev.label}`}
                </Link>
              ) : (
                <span />
              )}
              {nav.next ? (
                <Link href={`/blog/posts/${nav.next.slug}`} className={styles.navNext}>
                  {`${nav.next.label} →`}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>

        {related.length > 0 && (
          <div className={styles.relatedSection}>
            <h2>More Articles</h2>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/posts/${r.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedCardImage}>
                    <Image
                      src={r.image || `/images/blog/${r.slug}.webp`}
                      alt={r.alt || r.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3>{r.title}</h3>
                  <span>{r.dateLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {cta && (
          <div className={styles.ctaSection}>
            {cta.overline && <span className={styles.ctaOverline}>{cta.overline}</span>}
            <h2>{cta.heading}</h2>
            {cta.body && <p>{cta.body}</p>}
            <Link
              href={cta.primary || '/readings#book'}
              className="btn-primary"
              style={{ marginRight: 16 }}
            >
              {cta.primaryLabel || 'Book a Reading'}
            </Link>
            <Link
              href={cta.secondary || '/blog'}
              className="btn-secondary"
            >
              {cta.secondaryLabel || 'More Articles'}
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: listSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = loadPost(params.slug);
  if (!post) return { notFound: true };
  return { props: post };
}
