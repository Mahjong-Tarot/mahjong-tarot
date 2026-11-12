import Link from 'next/link';
import styles from './Footer.module.css';

const LINKS = [
  { href: '/chart',              label: 'Your chart' },
  { href: '/membership',         label: 'Membership' },
  { href: '/the-mahjong-mirror', label: 'The book' },
  { href: '/almanac',            label: 'Almanac' },
  { href: '/blog',               label: 'Blog' },
  { href: '/cards',              label: 'The deck' },
  { href: '/book-a-reading',     label: 'Personal readings' },
  { href: '/about',              label: 'About Bill' },
  { href: '/contact',            label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.brandName}>Mahjong Tarot</div>
          <p className={styles.brandTag}>
            Bill Hajdu brings 35+ years of practice together through Mahjong
            tiles, Chinese astrology and tarot.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={`container ${styles.bottom}`}>
        <div>© {new Date().getFullYear()} Mahjong Tarot · Bill Hajdu</div>
        <div>Ancient cards. Modern insight.</div>
      </div>
    </footer>
  );
}
