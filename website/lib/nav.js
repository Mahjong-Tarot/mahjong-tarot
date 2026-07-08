// Single source of truth for member-area navigation.
//
// Both renderers consume these definitions so routes, labels, and
// active-matching can never drift apart:
//   • MemberShell sidebar  → renders MEMBER_NAV flat
//   • public Nav (signed-in) → renders MEMBER_TOPBAR (compact, grouped)
//
// Add or rename a member destination in ONE place — here.

export const MEMBER_NAV = [
  { key: 'dashboard',   href: '/member/dashboard',              label: 'Dashboard',    match: (p) => p === '/member/dashboard' },
  { key: 'almanac',     href: '/member/dashboard/almanac',      label: 'Almanac',      match: (p) => p.startsWith('/member/dashboard/almanac') },
  { key: 'horoscope',   href: '/member/dashboard/horoscope',    label: 'Horoscope',    match: (p) => p.startsWith('/member/dashboard/horoscope') },
  { key: 'readings',    href: '/member/dashboard/readings',     label: 'Readings',     match: (p) => p.startsWith('/member/dashboard/readings') },
  { key: 'innerCircle', href: '/member/dashboard/inner-circle', label: 'Inner Circle', match: (p) => p.startsWith('/member/dashboard/inner-circle') },
  { key: 'profile',     href: '/member/profile',                label: 'Profile',      match: (p) => p.startsWith('/member/profile') },
];

const byKey = Object.fromEntries(MEMBER_NAV.map((i) => [i.key, i]));

// The individual reading surfaces, all under /member/dashboard/readings.
// Reached via the Readings index cards in the sidebar; surfaced as direct
// links in the compact top-bar dropdown. Labels here are the canonical
// customer-facing reading names — keep them in sync with the Readings
// index cards and the admin Quick Reading flow.
const readingLink = (key, slug, label) => ({
  key,
  href: `/member/dashboard/readings/${slug}`,
  label,
  match: (p) => p.startsWith(`/member/dashboard/readings/${slug}`),
});

export const READING_LINKS = [
  readingLink('fourPillars',    'four-pillars',    'Four Pillars'),
  readingLink('purpleStar',     'purple-star',     'Purple Star (Zi Wei Dou Shu)'),
  readingLink('threeBlessings', 'three-blessings', 'Three Blessings'),
  readingLink('fireHorse',      'fire-horse',      'Year of the Fire Horse'),
  readingLink('compatibility',  'compatibility',   'Compatibility Reading'),
];

// Keys that collapse under the "Readings" dropdown in the compact top-bar.
const READINGS_GROUP = [byKey.almanac, byKey.horoscope, ...READING_LINKS];

// Public Nav, signed-in mode. Reading surfaces collapse under a single
// "Readings" dropdown to save horizontal space; everything resolves back
// to MEMBER_NAV so labels/hrefs stay in lockstep with the sidebar.
export const MEMBER_TOPBAR = [
  byKey.dashboard,
  {
    href: byKey.readings.href,
    label: 'Readings',
    match: (p) => byKey.readings.match(p) || READINGS_GROUP.some((i) => i.match(p)),
    dropdown: READINGS_GROUP,
  },
  byKey.innerCircle,
  { ...byKey.profile, dropdown: [{ action: 'signOut', label: 'Sign out' }] },
];
