import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/auth';
import styles from './Nav.module.css';

export default function Nav() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const isActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : path === '/cards'
        ? router.pathname.startsWith('/cards')
        : path === '/dashboard'
          ? router.pathname.startsWith('/dashboard')
          : router.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          Mahjong Tarot
        </Link>

        <ul className={styles.links}>
          <li>
            <Link href="/about" className={isActive('/about') ? styles.active : ''}>
              About
            </Link>
          </li>
          <li>
            <Link href="/readings" className={isActive('/readings') ? styles.active : ''}>
              Readings
            </Link>
          </li>
          <li>
            <Link href="/cards" className={isActive('/cards') ? styles.active : ''}>
              Cards
            </Link>
          </li>
          <li>
            <Link href="/the-mahjong-mirror" className={isActive('/the-mahjong-mirror') ? styles.active : ''}>
              Book
            </Link>
          </li>
          <li>
            <Link href="/blog" className={isActive('/blog') ? styles.active : ''}>
              Blog
            </Link>
          </li>
          <li>
            <Link href="/contact" className={isActive('/contact') ? styles.active : ''}>
              Contact
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/dashboard" className={isActive('/dashboard') ? styles.active : ''}>
                  Dashboard
                </Link>
              </li>
              <li>
                <button type="button" onClick={handleSignOut} className={styles.signInBtn}>
                  Sign out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button type="button" onClick={() => router.push('/sign-in')} className={styles.signInBtn}>
                  Sign in
                </button>
              </li>
              <li>
                <button type="button" onClick={() => router.push('/sign-up')} className={styles.signUpBtn}>
                  Sign up
                </button>
              </li>
            </>
          )}
        </ul>

      </div>
    </nav>
  );
}
