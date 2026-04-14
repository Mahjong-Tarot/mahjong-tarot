const SITE = 'https://www.mahjongtarot.com';

export const PERSON_BILL = {
  '@type': 'Person',
  '@id': `${SITE}/#bill-hajdu`,
  name: 'Bill Hajdu',
  alternateName: 'The Firepig',
  url: `${SITE}/about`,
  image: `${SITE}/images/about-portrait.webp`,
  jobTitle: 'Divination Practitioner, Author',
  description:
    'Bill Hajdu is a divination practitioner with 35+ years of experience combining Chinese Mahjong tile readings, Four Pillars Chinese astrology, and tarot. Author of The Mahjong Mirror.',
  knowsAbout: [
    'Mahjong tile readings',
    'Chinese astrology',
    'Four Pillars of Destiny',
    'BaZi',
    'Tarot',
    'Divination',
  ],
  sameAs: [`${SITE}`],
};

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE}/#org`,
  name: 'Mahjong Tarot',
  url: SITE,
  logo: `${SITE}/images/about-portrait.webp`,
  founder: { '@id': `${SITE}/#bill-hajdu` },
};

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: SITE,
  name: 'Mahjong Tarot',
  description:
    'Mahjong tile readings, Chinese astrology, and tarot with Bill Hajdu — The Firepig.',
  publisher: { '@id': `${SITE}/#org` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE}/blog?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export function graph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE}${it.url}`,
    })),
  };
}

export function faqPage(qas) {
  return {
    '@type': 'FAQPage',
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.q,
      acceptedAnswer: { '@type': 'Answer', text: qa.a },
    })),
  };
}
