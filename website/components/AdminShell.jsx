import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './AdminShell.module.css';

// Sidebar items visible to admin only.
const ADMIN_NAV = [
  { href: '/admin',                  label: 'Dashboard',        match: (p) => p === '/admin' },
  { href: '/admin/people',           label: 'People',           match: (p) => p.startsWith('/admin/people') },
  { href: '/admin/inquiries',        label: 'Inquiries',        match: (p) => p.startsWith('/admin/inquiries') },
  { href: '/admin/sales',            label: 'Sales',            match: (p) => p.startsWith('/admin/sales') },
  { href: '/admin/astrologers',      label: 'Astrologers',      match: (p) => p.startsWith('/admin/astrologers') },
  // The legacy /admin/private-readings page still shows the global CRM
  // clients list. Showing it to astrologers would leak every other
  // astrologer's clients, so it stays admin-only until the page is
  // repurposed to actually surface paid bookings (the bookings table).
  { href: '/admin/private-readings', label: 'Private readings', match: (p) => p.startsWith('/admin/private-readings') },
];

// Sidebar items visible to astrologer + admin (their own operational pages).
const OPS_NAV = [
  { href: '/admin/quick-reading',     label: 'Quick reading',    match: (p) => p.startsWith('/admin/quick-reading') },
  { href: '/admin/settings/meeting-source', label: 'Settings',   match: (p) => p.startsWith('/admin/settings') },
];

function navFor(role) {
  if (role === 'admin')      return [...ADMIN_NAV, ...OPS_NAV];
  if (role === 'astrologer') return OPS_NAV;
  return [];
}

export default function AdminShell({ profile, children }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const displayName = profile?.name?.split(' ')[0] || profile?.name || 'Admin';

  return (
    <div className={styles.shell}>
      <header className={styles.mobileBar}>
        <Link href="/admin" className={styles.brandSm}>Mahjong Tarot · Admin</Link>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {open ? '×' : '☰'}
        </button>
      </header>

      {open && <div className={styles.backdrop} onClick={() => setOpen(false)} />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <Link href="/admin" className={styles.brandLink}>
            <span className={styles.brandMark} />
            <span className={styles.brandText}>
              Mahjong Tarot
              <span className={styles.brandSub}>Admin</span>
            </span>
          </Link>
        </div>

        <nav className={styles.nav} aria-label="Admin sections">
          <ul className={styles.navList}>
            {navFor(profile?.role).map((item) => {
              const active = item.match(router.pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={active ? styles.navLinkActive : styles.navLink}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.footer}>
          <div className={styles.who}>
            <span className={styles.whoName}>{displayName}</span>
            <button type="button" onClick={handleSignOut} className={styles.signOut}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </main>
    </div>
  );
}
