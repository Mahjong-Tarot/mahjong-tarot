import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './Nav.module.css';

const PUBLIC_LINKS = [
  { href: '/about',              label: 'About'   },
  { href: '/the-mahjong-mirror', label: 'Book'    },
  { href: '/blog',               label: 'Blog'    },
  { href: '/contact',            label: 'Contact' },
];

const MEMBER_READINGS = [
  { href: '/dashboard/almanac',                 label: 'Daily Almanac'   },
  { href: '/dashboard/horoscope',               label: 'Daily Horoscope' },
  { href: '/dashboard/readings/purple-star',    label: 'Purple Star'     },
  { href: '/dashboard/three-blessings',         label: 'Three Blessings' },
  { href: '/dashboard/relationships',           label: 'Compatibility'   },
];

const MEMBER_LINKS = [
  { href: '/dashboard',              label: 'Dashboard',    match: (p) => p === '/dashboard' },
  {
    href: '/dashboard/readings',
    label: 'Readings',
    match: (p) =>
      p.startsWith('/dashboard/readings') ||
      p.startsWith('/dashboard/almanac') ||
      p.startsWith('/dashboard/horoscope') ||
      p.startsWith('/dashboard/three-blessings') ||
      p.startsWith('/dashboard/relationships') ||
      p.startsWith('/dashboard/compatibility'),
    dropdown: MEMBER_READINGS,
  },
  { href: '/dashboard/inner-circle', label: 'Inner Circle', match: (p) => p.startsWith('/dashboard/inner-circle') },
  { href: '/profile',                label: 'Profile',      match: (p) => p.startsWith('/profile'), dropdown: [
    { action: 'signOut', label: 'Sign out' },
  ] },
];

export default function Nav() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const inMemberArea = !!user;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isPublicActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : router.pathname === path;

  return (
    <>
      {!inMemberArea && (
        <div className={styles.promo}>
          <span className={styles.promoPip} />
          <b>Year of the Fire Horse</b> · New readings open through May
          <span className={styles.promoPip} />
        </div>
      )}
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href={user ? '/dashboard' : '/'} className={styles.logo}>
          Mahjong Tarot
        </Link>

        {inMemberArea ? (
          <ul className={styles.links}>
            {MEMBER_LINKS.map((l) =>
              l.dropdown ? (
                <li
                  key={l.href}
                  className={styles.dropdown}
                  onMouseEnter={() => setOpenDropdown(l.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link href={l.href} className={l.match(router.pathname) ? styles.active : ''}>
                    {l.label} <span className={styles.caret} aria-hidden="true">▾</span>
                  </Link>
                  <ul className={`${styles.dropdownMenu} ${openDropdown === l.href ? styles.dropdownOpen : ''}`}>
                    {l.dropdown.map((d) =>
                      d.action === 'signOut' ? (
                        <li key="signOut">
                          <button type="button" onClick={handleSignOut} className={styles.dropdownItemBtn}>
                            {d.label}
                          </button>
                        </li>
                      ) : (
                        <li key={d.href}>
                          <Link href={d.href} className={router.pathname.startsWith(d.href) ? styles.active : ''}>
                            {d.label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className={l.match(router.pathname) ? styles.active : ''}>
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        ) : (
          <ul className={styles.links}>
            {PUBLIC_LINKS.map((l) =>
              l.dropdown ? (
                <li
                  key={l.href}
                  className={styles.dropdown}
                  onMouseEnter={() => setOpenDropdown(l.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link href={l.href} className={isPublicActive(l.href) ? styles.active : ''}>
                    {l.label} <span className={styles.caret} aria-hidden="true">▾</span>
                  </Link>
                  <ul className={`${styles.dropdownMenu} ${openDropdown === l.href ? styles.dropdownOpen : ''}`}>
                    {l.dropdown.map((d) => (
                      <li key={d.href}>
                        <Link href={d.href} className={router.pathname.startsWith(d.href) ? styles.active : ''}>
                          {d.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className={isPublicActive(l.href) ? styles.active : ''}>
                    {l.label}
                  </Link>
                </li>
              ),
            )}
            <li>
              <button type="button" onClick={() => router.push('/sign-in')} className={styles.signInBtn}>
                Sign in
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
    </>
  );
}
