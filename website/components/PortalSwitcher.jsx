import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './PortalSwitcher.module.css';

const PORTAL_DEFS = {
  admin:      { label: 'Admin',      href: '/admin' },
  astrologer: { label: 'Astrologer', href: '/admin/quick-reading' },
  member:     { label: 'Member',     href: '/member/dashboard' },
};

// Order mirrors what the user sees in the sidebar header.
const PORTALS_FOR_ROLE = {
  admin:      ['admin', 'member', 'astrologer'],
  astrologer: ['member', 'astrologer'],
  member:     [],
};

function currentPortal(role, pathname) {
  if (pathname.startsWith('/member')) return 'member';
  // Astrologers and admins share /admin/* URLs — disambiguate by role.
  if (pathname.startsWith('/admin')) return role === 'admin' ? 'admin' : 'astrologer';
  return null;
}

export default function PortalSwitcher({ role, onNavigate }) {
  const router = useRouter();
  const keys = PORTALS_FOR_ROLE[role] || [];
  if (keys.length === 0) return null;
  const active = currentPortal(role, router.pathname);

  return (
    <nav aria-label="Portal sections" className={styles.switcher}>
      {keys.map((key) => {
        const def = PORTAL_DEFS[key];
        return (
          <Link
            key={key}
            href={def.href}
            className={key === active ? styles.linkActive : styles.link}
            aria-current={key === active ? 'page' : undefined}
            onClick={onNavigate}
          >
            {def.label}
          </Link>
        );
      })}
    </nav>
  );
}
