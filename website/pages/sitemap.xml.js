import { POSTS } from '../lib/posts';
import { CARDS } from '../lib/cards';

const SITE = 'https://www.mahjongtarot.com';

function generate() {
  const staticUrls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: '/about', priority: '0.7', changefreq: 'monthly' },
    { loc: '/readings', priority: '0.9', changefreq: 'monthly' },
    { loc: '/the-mahjong-mirror', priority: '0.9', changefreq: 'monthly' },
    { loc: '/cards', priority: '0.9', changefreq: 'monthly' },
    { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
    { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
  ];

  const cardUrls = CARDS.map((c) => ({
    loc: `/cards/${c.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
  }));

  const postUrls = POSTS.map((p) => ({
    loc: `/blog/posts/${p.slug}`,
    lastmod: p.isoDate,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const all = [...staticUrls, ...cardUrls, ...postUrls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => `  <url>
    <loc>${SITE}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(generate());
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
