import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import PortalSwitcher from './PortalSwitcher';
import styles from './MemberShell.module.css';

const LINKS = [
  { href: '/member/dashboard',                  label: 'Dashboard',      match: (p) => p === '/member/dashboard' },
  { href: '/member/dashboard/almanac',          label: 'Almanac',        match: (p) => p.startsWith('/member/dashboard/almanac') },
  { href: '/member/dashboard/horoscope',        label: 'Horoscope',      match: (p) => p.startsWith('/member/dashboard/horoscope') },
  { href: '/member/dashboard/readings',         label: 'Readings',       match: (p) => p.startsWith('/member/dashboard/readings') },
  { href: '/member/dashboard/three-blessings',  label: 'Three Blessings', match: (p) => p.startsWith('/member/dashboard/three-blessings') },
  { href: '/member/dashboard/relationships',    label: 'Compatibility',  match: (p) => p.startsWith('/member/dashboard/relationships') },
  { href: '/member/dashboard/inner-circle',     label: 'Inner Circle',   match: (p) => p.startsWith('/member/dashboard/inner-circle') },
  { href: '/member/profile',                    label: 'Profile',        match: (p) => p.startsWith('/member/profile') },
];

export default function MemberShell({ children }) {
  const router = useRouter();
  const { signOut, role } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const close = () => setDrawerOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleSignOut = async () => {
    await signOut();
    // Hard reload rather than router.push so a wedged React tree can't
    // strand the user — the browser always navigates.
    window.location.href = '/';
  };

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={styles.hamburger}
        aria-label="Open navigation"
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen(true)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {drawerOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar}${drawerOpen ? ` ${styles.sidebarOpen}` : ''}`}
        aria-label="Member navigation"
      >
        <div className={styles.sidebarHeader}>
          <Link href="/member/dashboard" className={styles.logo}>
            Mahjong Tarot
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <PortalSwitcher role={role} onNavigate={() => setDrawerOpen(false)} />

        <nav className={styles.nav}>
          <ul className={styles.linkList}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`${styles.link}${l.match(router.pathname) ? ` ${styles.active}` : ''}`}
                  aria-current={l.match(router.pathname) ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" onClick={handleSignOut} className={styles.signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <div className={styles.main}>{children}</div>
    </div>
  );
}
