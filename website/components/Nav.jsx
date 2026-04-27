import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './Nav.module.css';

const PUBLIC_LINKS = [
  { href: '/about',              label: 'About'    },
  { href: '/horoscopes',         label: 'Horoscopes', dropdown: [
    { href: '/year-of-the-fire-horse', label: 'Year of the Fire Horse 2026' },
    { href: '/horoscopes/forecast',    label: 'Monthly Forecast' },
  ] },
  { href: '/readings',           label: 'Readings', dropdown: [{ href: '/cards', label: 'Cards' }] },
  { href: '/the-mahjong-mirror', label: 'Book'     },
  { href: '/blog',               label: 'Blog'     },
  { href: '/contact',            label: 'Contact'  },
];

const MEMBER_LINKS = [
  { href: '/dashboard',                  label: 'Dashboard',     match: (p) => p === '/dashboard' },
  { href: '/dashboard/readings',         label: 'My Readings',   match: (p) => p.startsWith('/dashboard/readings') },
  { href: '/profile',                    label: 'Profile',       match: (p) => p.startsWith('/profile') },
  { href: '/dashboard/inner-circle',     label: 'Inner Circle',  match: (p) => p.startsWith('/dashboard/inner-circle') },
  { href: '/dashboard/relationships',    label: 'Relationships', match: (p) => p.startsWith('/dashboard/relationships') || p.startsWith('/dashboard/compatibility') },
];

export default function Nav() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const inMemberArea = !!user && (
    router.pathname.startsWith('/dashboard') || router.pathname.startsWith('/profile')
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isPublicActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : path === '/horoscopes'
        ? router.pathname.startsWith('/horoscopes') || router.pathname.startsWith('/year-of-the-fire-horse')
        : path === '/readings'
          ? router.pathname.startsWith('/readings') || router.pathname.startsWith('/cards')
          : router.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href={user ? '/dashboard' : '/'} className={styles.logo}>
          Mahjong Tarot
        </Link>

        {inMemberArea ? (
          <ul className={styles.links}>
            {MEMBER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={l.match(router.pathname) ? styles.active : ''}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/readings#book" className={styles.cta}>
                Get a Reading
              </Link>
            </li>
            <li>
              <button type="button" onClick={handleSignOut} className={styles.signOutLink}>
                Sign out
              </button>
            </li>
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
            {user ? (
              <li>
                <Link href="/dashboard" className={styles.signInBtn}>
                  Dashboard
                </Link>
              </li>
            ) : (
              <li>
                <button type="button" onClick={() => router.push('/sign-in')} className={styles.signInBtn}>
                  Sign in
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
