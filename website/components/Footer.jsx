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
              <li><Link href="/the-mahjong-mirror">The Mahjong Mirror</Link></li>
              <li><Link href="/blog">Journal</Link></li>
              <li><Link href="/signup">Member Area</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Live Readings</h4>
            <ul className={styles.links}>
              <li><Link href="/book-a-reading?duration=30">30 min · $49</Link></li>
              <li><Link href="/book-a-reading?duration=60">60 min · $69</Link></li>
              <li><Link href="/book-a-reading?duration=90">90 min · $129</Link></li>
              <li><Link href="/book-a-reading">Book a Live Reading</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Connect</h4>
            <ul className={styles.links}>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a></li>
              <li><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><Link href="/contact?subject=press">Press inquiries</Link></li>
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
