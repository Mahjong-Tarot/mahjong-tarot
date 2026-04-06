import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Nav.module.css';

export default function Nav() {
  const router = useRouter();
  const isActive = (path) =>
    path === '/blog'
      ? router.pathname.startsWith('/blog')
      : router.pathname === path;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          The Mahjong Tarot
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
            <Link href="/the-mahjong-mirror" className={isActive('/the-mahjong-mirror') ? styles.active : ''}>
              The Mahjong Mirror
            </Link>
          </li>
          <li>
            <Link href="/blog" className={isActive('/blog') ? styles.active : ''}>
              Blog
            </Link>
          </li>
        </ul>

        <Link href="/readings" className="btn-primary">
          Book a Reading
        </Link>
      </div>
    </nav>
  );
}
