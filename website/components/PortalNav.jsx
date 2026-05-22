import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './PortalNav.module.css';

const LINKS = [
  { href: '/portal',               label: 'Sessions',       match: (p) => p === '/portal' },
  { href: '/portal/clients',       label: 'Clients',        match: (p) => p.startsWith('/portal/clients') },
  { href: '/portal/quick-reading', label: 'Quick reading',  match: (p) => p.startsWith('/portal/quick-reading') },
];

// Admin pages live at /admin/* with their own AdminShell sidebar.
// Show one entry-point link to /admin for admin users.
const ADMIN_LINKS = [
  { href: '/admin', label: 'Admin →', match: (p) => p.startsWith('/admin') },
];

export default function PortalNav({ profile }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const links = profile?.role === 'admin' ? [...LINKS, ...ADMIN_LINKS] : LINKS;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = profile?.name?.split(' ')[0] || profile?.name || 'Portal';

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/portal" className={styles.brand}>
          <span className={styles.brandMark} />
          <span className={styles.brandText}>Mahjong Tarot Portal</span>
        </Link>

        <nav className={styles.links} aria-label="Portal sections">
          {links.map((link) => {
            const active = link.match(router.pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? styles.linkActive : styles.link}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.account}>
          <span className={styles.who} title={profile?.role}>{displayName}</span>
          <button type="button" onClick={handleSignOut} className={styles.signOut}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
