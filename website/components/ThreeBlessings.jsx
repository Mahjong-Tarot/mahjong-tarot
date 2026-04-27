import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ThreeBlessings.module.css';

const STORAGE_KEY = 'mt.threeBlessings.flipped';

const ORNAMENTS = {
  phuc: '福',
  loc:  '禄',
  tho:  '寿',
};

const ORDER = ['phuc', 'loc', 'tho'];

export default function ThreeBlessings({ reading }) {
  const [flipped, setFlipped] = useState({ phuc: false, loc: false, tho: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === 'all') setFlipped({ phuc: true, loc: true, tho: true });
    } catch (_) {
      // localStorage unavailable — silently ignore
    }
  }, []);

  useEffect(() => {
    if (flipped.phuc && flipped.loc && flipped.tho) {
      try { window.localStorage.setItem(STORAGE_KEY, 'all'); } catch (_) { /* ignore */ }
    }
  }, [flipped]);

  if (!reading) return null;

  const allFlipped = flipped.phuc && flipped.loc && flipped.tho;

  const flip = (key) => setFlipped((s) => ({ ...s, [key]: true }));

  return (
    <div className={styles.wrap}>
      <p className={styles.lede}>
        {allFlipped
          ? 'Your three blessings, drawn from your birth chart. Tap any tile to read the full interpretation.'
          : 'Three tiles drawn from your birth chart, one for each ancient blessing. Tap each to reveal.'}
      </p>

      <div className={styles.row}>
        {ORDER.map((key) => {
          const blessing = reading[key];
          if (!blessing) return null;
          const { position, card } = blessing;
          const isFlipped = flipped[key];
          return (
            <button
              key={key}
              type="button"
              className={`${styles.tile} ${isFlipped ? styles.flipped : ''}`}
              onClick={() => flip(key)}
              aria-label={
                isFlipped
                  ? `${position.name} blessing: ${card?.name}`
                  : `Reveal ${position.name} blessing`
              }
              aria-pressed={isFlipped}
            >
              <div className={styles.inner}>
                <div className={`${styles.face} ${styles.back}`} aria-hidden={isFlipped}>
                  <div className={styles.backInner}>
                    <span className={styles.backOrnament}>{ORNAMENTS[key]}</span>
                    <span className={styles.backPosition}>{position.name}</span>
                    <span className={styles.backHint}>Tap to reveal</span>
                  </div>
                </div>
                <div className={`${styles.face} ${styles.front}`} aria-hidden={!isFlipped}>
                  <div className={styles.frontImageWrap}>
                    {card?.slug && (
                      <Image
                        src={`/images/cards/${card.slug}.webp`}
                        alt={card.name}
                        width={300}
                        height={400}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className={styles.frontMeta}>
                    <span className={styles.frontPosition}>
                      {position.name} · {position.label}
                    </span>
                    <span className={styles.frontCardName}>{card?.name}</span>
                    <span className={styles.frontShort}>{card?.short}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={styles.cta}>
        <p className={styles.ctaHint}>
          {allFlipped
            ? 'Each tile is a personal expression of one of the three ancient blessings.'
            : `${[flipped.phuc, flipped.loc, flipped.tho].filter(Boolean).length} of 3 revealed.`}
        </p>
        {allFlipped && (
          <Link href="/dashboard/three-blessings" className={styles.ctaLink}>
            Read your full Three Blessings reading →
          </Link>
        )}
      </div>
    </div>
  );
}
