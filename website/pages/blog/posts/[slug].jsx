// Dynamic blog post template.
//
// Renders any post at /blog/posts/<slug> from the blog database
// (company_os.marketing_content, via lib/blogDb.js). Posts reach the database
// from the marketing platform's admin or from content/blog/<slug>.md through
// scripts/publish-blog-post.mjs.
//
// This file replaces 16 hand-written per-post JSX files that all shared
// ~90% boilerplate (identical <Head>/<Nav>/<Footer> wiring, an inlined
// FaqItem component duplicated 12 times, hand-written JSON-LD).
//
// Per-post knobs come from the row's columns and page_meta (lib/blogDb.js
// builds the frontmatter-shaped object this page renders). Anything that isn't expressible in standard markdown
// (Swift/Kelce's risk cards, the love post's sign grid, mid-body figures
// with figcaptions) goes in as raw HTML in the body. lib/blogDb.js renders it
// through an allow-list sanitizer (lib/sanitizeHtml.js), so only the house
// post markup survives: no scripts, no event handlers.

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import FaqItem from '../../../components/FaqItem';
import styles from '../../../styles/BlogPost.module.css';
import { listPublishedPosts, loadPublishedPost } from '../../../lib/blogDb';
import { jsonLdString } from '../../../lib/jsonLd';

const SITE = 'https://www.mahjongtarot.com';
const DEFAULT_IMAGE = `${SITE}/images/about-portrait.webp`;

export default function BlogPost({ slug, frontmatter, html }) {
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

  // Social meta always renders, falling back to the page's own title,
  // description and canonical when page_meta.og leaves a field out.
  const pageUrl = seo.canonical || `${SITE}/blog/posts/${slug}`;
  const metaTitle = og.title || title;
  const metaDescription = og.description || seo.description || '';
  const metaImage = og.image || DEFAULT_IMAGE;

  return (
    <>
      <Head>
        <title>{seo.title || title}</title>
        {seo.description && <meta name="description" content={seo.description} />}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={og.siteName || 'The Mahjong Tarot'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <link rel="canonical" href={pageUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdString(schemas.length === 1 ? schemas[0] : schemas),
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
                      sizes="(max-width: 768px) 100vw, 380px"
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
  // Prerender every live post; a post published after the build renders on
  // its first request (fallback: 'blocking') and is then cached.
  const posts = await listPublishedPosts();
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  // Future-dated and unpublished posts are not returned, so they 404 until
  // their day; revalidate lets the page flip live without a redeploy.
  const post = await loadPublishedPost(params.slug);
  if (!post) return { notFound: true, revalidate: 300 };
  return { props: post, revalidate: 300 };
}
