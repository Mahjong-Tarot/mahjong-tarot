// Single source of truth for member-area navigation.
//
// Both renderers consume these definitions so routes, labels, and
// active-matching can never drift apart:
//   • MemberShell sidebar  → renders MEMBER_NAV flat
//   • public Nav (signed-in) → renders MEMBER_TOPBAR (compact, grouped)
//
// Add or rename a member destination in ONE place — here.

export const MEMBER_NAV = [
  { key: 'dashboard',      href: '/member/dashboard',                 label: 'Dashboard',       match: (p) => p === '/member/dashboard' },
  { key: 'almanac',        href: '/member/dashboard/almanac',         label: 'Almanac',         match: (p) => p.startsWith('/member/dashboard/almanac') },
  { key: 'horoscope',      href: '/member/dashboard/horoscope',       label: 'Horoscope',       match: (p) => p.startsWith('/member/dashboard/horoscope') },
  { key: 'readings',       href: '/member/dashboard/readings',        label: 'Readings',        match: (p) => p.startsWith('/member/dashboard/readings') },
  { key: 'threeBlessings', href: '/member/dashboard/three-blessings', label: 'Three Blessings', match: (p) => p.startsWith('/member/dashboard/three-blessings') },
  { key: 'compatibility',  href: '/member/dashboard/relationships',   label: 'Compatibility',   match: (p) => p.startsWith('/member/dashboard/relationships') },
  { key: 'innerCircle',    href: '/member/dashboard/inner-circle',    label: 'Inner Circle',    match: (p) => p.startsWith('/member/dashboard/inner-circle') },
  { key: 'profile',        href: '/member/profile',                   label: 'Profile',         match: (p) => p.startsWith('/member/profile') },
];

const byKey = Object.fromEntries(MEMBER_NAV.map((i) => [i.key, i]));

// Purple Star is a specific reading surface under /readings — surfaced
// as a direct link in the compact top-bar dropdown, but reached via the
// Readings index card in the sidebar. Not a top-level sidebar item.
const PURPLE_STAR = {
  key: 'purpleStar',
  href: '/member/dashboard/readings/purple-star',
  label: 'Purple Star',
  match: (p) => p.startsWith('/member/dashboard/readings/purple-star'),
};

// Keys that collapse under the "Readings" dropdown in the compact top-bar.
const READINGS_GROUP = [byKey.almanac, byKey.horoscope, PURPLE_STAR, byKey.threeBlessings, byKey.compatibility];

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
