import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './AdminShell.module.css';

const NAV = [
  { href: '/admin',             label: 'Dashboard',   match: (p) => p === '/admin' },
  { href: '/admin/people',      label: 'People',      match: (p) => p.startsWith('/admin/people') },
  { href: '/admin/inquiries',   label: 'Inquiries',   match: (p) => p.startsWith('/admin/inquiries') },
  { href: '/admin/conversions', label: 'Conversions', match: (p) => p.startsWith('/admin/conversions') },
];

export default function AdminShell({ profile, children }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
            {NAV.map((item) => {
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
          <Link href="/admin/sessions" className={styles.portalLink} onClick={() => setOpen(false)}>
            Astrologer portal →
          </Link>
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
