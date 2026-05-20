import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './PortalNav.module.css';

const LINKS = [
  { href: '/portal',          label: 'Sessions', match: (p) => p === '/portal' },
  { href: '/portal/clients',  label: 'Clients',  match: (p) => p.startsWith('/portal/clients') },
];

export default function PortalNav({ profile }) {
  const router = useRouter();
  const { signOut } = useAuth();

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
          {LINKS.map((link) => {
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
