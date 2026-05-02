import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/MemberNav.module.css';

const LINKS = [
  { href: '/dashboard',               label: 'Dashboard',    match: (p) => p === '/dashboard' },
  { href: '/dashboard/almanac',       label: 'Almanac',      match: (p) => p.startsWith('/dashboard/almanac') },
  { href: '/dashboard/readings',      label: 'Readings',     match: (p) =>
      p.startsWith('/dashboard/readings') ||
      p.startsWith('/dashboard/horoscope') ||
      p.startsWith('/dashboard/three-blessings') },
  { href: '/dashboard/relationships', label: 'Relationships', match: (p) => p.startsWith('/dashboard/relationships') },
  { href: '/dashboard/inner-circle',  label: 'Inner Circle', match: (p) => p.startsWith('/dashboard/inner-circle') },
  { href: '/profile',                 label: 'Profile',      match: (p) => p.startsWith('/profile') },
];

export default function MemberNav() {
  const { pathname } = useRouter();
  return (
    <nav className={styles.nav} aria-label="Member navigation">
      <div className={styles.inner}>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`${styles.link}${l.match(pathname) ? ` ${styles.active}` : ''}`}
            aria-current={l.match(pathname) ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
