// Canonical metadata for the five reading types — the single source of
// truth for type keys, member slugs, and customer-facing names. A reading
// is named and routed identically in the member area, the astrologer's
// Quick Reading form, and the guest-facing reading document.
//
// Consumed by:
//   • lib/nav.js                                  — member nav labels + hrefs
//   • pages/member/dashboard/readings/index.jsx   — catalog cards
//   • pages/admin/quick-reading.jsx               — astrologer form checkboxes
//   • lib/quickReading.js                         — API type validation
//   • lib/quickReadingHtml.js                     — guest document tab labels

export const READINGS = [
  {
    key: 'bazi', // quick-reading type key (stored in readings.types rows)
    slug: 'four-pillars',
    label: 'Four Pillars',
    tab: 'Four Pillars',
    blurb: 'Your birth chart elements and the five stages of your life cycle.',
    hint: 'Year / Month / Day / Hour pillars + element balance.',
  },
  {
    key: 'ziwei',
    slug: 'purple-star',
    label: 'Purple Star (Zi Wei Dou Shu)',
    tab: 'Purple Star',
    blurb: 'The 12-palace map of your life themes and seasons.',
    hint: 'The 12-palace chart. Needs the birth time.',
  },
  {
    key: 'three_blessings',
    slug: 'three-blessings',
    label: 'Three Blessings',
    tab: 'Three Blessings',
    blurb: 'Your stars of wealth, prosperity, and longevity.',
    hint: 'Phúc / Lộc / Thọ — ten indicators per blessing.',
  },
  {
    key: 'fire_horse',
    slug: 'fire-horse',
    label: 'Year of the Fire Horse',
    tab: 'Fire Horse',
    blurb: 'Your full 2026 forecast, read against your day master.',
    hint: 'Year score + sign narrative + best / hardest months.',
  },
  {
    key: 'compatibility',
    slug: 'compatibility',
    label: 'Compatibility Reading',
    tab: 'Compatibility',
    blurb: 'Run two birth charts side by side.',
    hint: 'Match with a second person. Requires their birthday.',
  },
];

export const READING_TYPES = READINGS.map((r) => r.key);
export const readingByKey = Object.fromEntries(READINGS.map((r) => [r.key, r]));
export const memberReadingHref = (r) => `/member/dashboard/readings/${r.slug}`;
