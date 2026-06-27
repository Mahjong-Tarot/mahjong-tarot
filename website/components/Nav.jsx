import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './Nav.module.css';
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

  const inMemberArea = !!user;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const isPublicActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : router.pathname === path;

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
                <li
                  key={l.href}
                  className={styles.dropdown}
                  onMouseEnter={() => setOpenDropdown(l.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link href={l.href} className={l.match(router.pathname) ? styles.active : ''}>
                    {l.label} <span className={styles.caret} aria-hidden="true">▾</span>
                  </Link>
                  <ul className={`${styles.dropdownMenu} ${openDropdown === l.href ? styles.dropdownOpen : ''}`}>
                    {l.dropdown.map((d) =>
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
                    )}
                  </ul>
                </li>
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
            </ul>
            <div className={styles.navRight}>
              <Link href="/sign-in" className={styles.navSignin}>Sign in</Link>
              <Link href="/signup" className={styles.cta}>Get Premium Access</Link>
            </div>
          </>
        )}
      </div>
    </nav>
    </>
  );
}
