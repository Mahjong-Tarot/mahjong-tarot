import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.brandName}>Mahjong Tarot</div>
            <p className={styles.brandTag}>
              Ancient wisdom, modern clarity. Bill Hajdu brings 35+ years of
              divination practice together through Mahjong tiles, Chinese
              astrology, and tarot.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Navigate</h4>
            <ul className={styles.links}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Bill</Link></li>
              <li><Link href="/readings">Readings</Link></li>
              <li><Link href="/the-mahjong-mirror">The Mahjong Mirror</Link></li>
              <li><Link href="/blog">Journal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Readings</h4>
            <ul className={styles.links}>
              <li><Link href="/readings#one-tile">One-Tile Insight</Link></li>
              <li><Link href="/readings#three-tile">Three-Tile Spread</Link></li>
              <li><Link href="/readings#mirror-session">Mahjong Mirror Session</Link></li>
              <li><Link href="/readings#book">Book a Reading</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Connect</h4>
            <ul className={styles.links}>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/blog">Newsletter</Link></li>
              <li><Link href="/sign-in">Sign in</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <div><span className={styles.pip} />© {new Date().getFullYear()} Mahjong Tarot · Bill Hajdu</div>
          <div>Ancient Cards. Modern Insight.</div>
        </div>
      </div>
    </footer>
  );
}
