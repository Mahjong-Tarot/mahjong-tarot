import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './Nav.module.css';
import Icon from './Icon';
import { MEMBER_TOPBAR } from '../lib/nav';

const PUBLIC_LINKS = [
  { href: '/about',              label: 'About'            },
  { href: '/book-a-reading',     label: 'Private Readings' },
  { href: '/the-mahjong-mirror', label: 'Book'             },
  { href: '/blog',               label: 'Journal'          },
  { href: '/contact',            label: 'Contact'          },
];

export default function Nav() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const inMemberArea = !!user;

  // Close the mobile menu and any open dropdown on navigation or Escape.
  useEffect(() => {
    const close = () => { setMenuOpen(false); setOpenDropdown(null); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    router.events.on('routeChangeStart', close);
    window.addEventListener('keydown', onKey);
    return () => {
      router.events.off('routeChangeStart', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [router.events]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isPublicActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : router.pathname === path;

  const toggleDropdown = (href) =>
    setOpenDropdown((cur) => (cur === href ? null : href));

  // Flattened link list for the mobile panel.
  const mobileItems = inMemberArea
    ? MEMBER_TOPBAR.flatMap((l) => [
        { href: l.href, label: l.label, active: l.match(router.pathname) },
        ...(l.dropdown || [])
          .filter((d) => d.href)
          .map((d) => ({ href: d.href, label: d.label, active: router.pathname.startsWith(d.href), sub: true })),
      ])
    : [
        ...PUBLIC_LINKS.map((l) => ({ href: l.href, label: l.label, active: isPublicActive(l.href) })),
        { href: '/sign-in', label: 'Sign in', active: router.pathname === '/sign-in' },
      ];

  const renderDropdown = (l, isActive, items) => (
    <li
      key={l.href}
      className={styles.dropdown}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpenDropdown(l.href); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpenDropdown(null); }}
    >
      <Link href={l.href} className={isActive ? styles.active : ''}>
        {l.label}
      </Link>
      <button
        type="button"
        className={styles.caretBtn}
        aria-expanded={openDropdown === l.href}
        aria-label={`${l.label} menu`}
        onClick={() => toggleDropdown(l.href)}
      >
        <Icon name="caret" size={12} className={styles.caret} />
      </button>
      <ul className={`${styles.dropdownMenu} ${openDropdown === l.href ? styles.dropdownOpen : ''}`}>
        {items}
      </ul>
    </li>
  );

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
        <Link href={user ? '/member/dashboard' : '/'} className={styles.logo}>
          Mahjong Tarot
        </Link>

        {inMemberArea ? (
          <ul className={styles.links}>
            {MEMBER_TOPBAR.map((l) =>
              l.dropdown ? (
                renderDropdown(
                  l,
                  l.match(router.pathname),
                  l.dropdown.map((d) =>
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
                  ),
                )
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
          <>
            <ul className={styles.links}>
              {PUBLIC_LINKS.map((l) =>
                l.dropdown ? (
                  renderDropdown(
                    l,
                    isPublicActive(l.href),
                    l.dropdown.map((d) => (
                      <li key={d.href}>
                        <Link href={d.href} className={router.pathname.startsWith(d.href) ? styles.active : ''}>
                          {d.label}
                        </Link>
                      </li>
                    )),
                  )
                ) : (
                  <li key={l.href}>
                    <Link href={l.href} className={isPublicActive(l.href) ? styles.active : ''}>
                      {l.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <div className={styles.navRight}>
              <Link href="/sign-in" className={styles.navSignin}>Sign in</Link>
              <Link href="/signup" className={styles.cta}>
                <span className={styles.ctaLong}>Get Premium Access</span>
                <span className={styles.ctaShort}>Go Premium</span>
              </Link>
            </div>
          </>
        )}

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
      </div>

      <div id="mobile-menu" className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ''}`}>
        <ul className={`container ${styles.mobileList}`}>
          {mobileItems.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                className={`${i.sub ? styles.mobileSub : ''} ${i.active ? styles.active : ''}`}
              >
                {i.label}
              </Link>
            </li>
          ))}
          {inMemberArea && (
            <li>
              <button type="button" onClick={handleSignOut} className={styles.mobileSignOut}>
                Sign out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
    </>
  );
}
