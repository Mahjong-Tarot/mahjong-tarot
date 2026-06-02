import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './PortalSwitcher.module.css';

// ─── View preference (admin-only) ────────────────────────────────
// When an admin clicks "Astrologer" we record their preference so the
// shell can swap its nav to the astrologer-only view. Stored in
// localStorage rather than a cookie so we don't have to plumb a prop
// through every admin page's getServerSideProps. Acceptable trade-off
// for a tool used by a tiny internal team.

export const VIEW_KEY = 'mt_view';

export function readView() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(VIEW_KEY); }
  catch { return null; }
}

export function writeView(view) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(VIEW_KEY, view); }
  catch { /* noop */ }
  // Notify same-tab listeners. The native 'storage' event only fires
  // across tabs, not within the tab that wrote the value.
  window.dispatchEvent(new Event('mt-view-change'));
}

// ─── Portal defs ─────────────────────────────────────────────────

const PORTAL_DEFS = {
  admin:      { label: 'Admin',      href: '/admin' },
  astrologer: { label: 'Astrologer', href: '/admin/private-readings' },
  member:     { label: 'Member',     href: '/member/dashboard' },
};

// Order mirrors what the user sees in the sidebar header.
const PORTALS_FOR_ROLE = {
  admin:      ['admin', 'astrologer', 'member'],
  astrologer: ['astrologer', 'member'],
  member:     [],
};

export default function PortalSwitcher({ role, onNavigate }) {
  const router = useRouter();
  const keys = PORTALS_FOR_ROLE[role] || [];

  // Track admin's view preference. Reads after mount to avoid
  // hydration mismatches; updates when PortalSwitcher (or any other
  // tab) writes a new value.
  const [view, setView] = useState(null);
  useEffect(() => {
    setView(readView());
    const handler = () => setView(readView());
    window.addEventListener('mt-view-change', handler);
    window.addEventListener('storage',        handler);
    return () => {
      window.removeEventListener('mt-view-change', handler);
      window.removeEventListener('storage',        handler);
    };
  }, []);

  if (keys.length === 0) return null;

  // Active portal: member-area URLs always = 'member'. Otherwise on
  // /admin/*, admins fall back to their stored view (default 'admin'),
  // astrologers always see 'astrologer'.
  let active;
  if (router.pathname.startsWith('/member')) {
    active = 'member';
  } else if (role === 'astrologer') {
    active = 'astrologer';
  } else if (role === 'admin') {
    active = view === 'astrologer' ? 'astrologer' : 'admin';
  } else {
    active = null;
  }

  function handleClick(key) {
    // Persist the admin's portal choice so the shell can reflect it
    // on the next render. Astrologers and members don't need this —
    // their nav is determined by role.
    if (role === 'admin' && (key === 'admin' || key === 'astrologer')) {
      writeView(key);
    }
    onNavigate?.();
  }

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
            onClick={() => handleClick(key)}
          >
            {def.label}
          </Link>
        );
      })}
    </nav>
  );
}
