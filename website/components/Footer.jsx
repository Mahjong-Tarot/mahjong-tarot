import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h3>Mahjong Tarot</h3>
            <p>
              Ancient wisdom, modern clarity. Bill Hajdu brings 35+ years of
              divination practice together through Mahjong tiles, Chinese
              astrology, and tarot.
            </p>
            <NewsletterSignup source="footer" variant="footer" />
          </div>

          <div>
            <p className={styles.colTitle}>Navigate</p>
            <ul className={styles.links}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Bill</Link></li>
              <li><Link href="/readings">Readings</Link></li>
              <li><Link href="/the-mahjong-mirror">The Mahjong Mirror</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className={styles.colTitle}>Readings</p>
            <ul className={styles.links}>
              <li><Link href="/readings#one-tile">One-Tile Insight</Link></li>
              <li><Link href="/readings#three-tile">Three-Tile Spread</Link></li>
              <li><Link href="/readings#mirror-session">Mahjong Mirror Session</Link></li>
              <li><Link href="/readings#book">Book a Reading</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Mahjong Tarot · Bill Hajdu · All rights reserved</p>
          <p>Ancient Cards. Modern Insight.</p>
        </div>
      </div>
    </footer>
  );
}
