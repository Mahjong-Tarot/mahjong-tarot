import Link from 'next/link';
import { useRouter } from 'next/router';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import styles from './Nav.module.css';

export default function Nav() {
  const router = useRouter();
  const isActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : path === '/cards'
        ? router.pathname.startsWith('/cards')
        : path === '/dashboard'
          ? router.pathname.startsWith('/dashboard')
          : router.pathname === path;

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
            <Link href="/readings#book">
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
          <SignedIn>
            <li>
              <Link href="/dashboard" className={isActive('/dashboard') ? styles.active : ''}>
                Dashboard
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <UserButton afterSignOutUrl="/" />
            </li>
          </SignedIn>
          <SignedOut>
            <li>
              <Link href="/sign-in" className={isActive('/sign-in') ? styles.active : ''}>
                Sign in
              </Link>
            </li>
          </SignedOut>
        </ul>

      </div>
    </nav>
  );
}
