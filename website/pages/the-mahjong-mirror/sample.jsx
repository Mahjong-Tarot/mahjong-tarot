import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import sample from '../../data/mahjong-mirror-sample.json';
import styles from '../../styles/MahjongMirrorSample.module.css';

const AMAZON_URL = 'https://www.amazon.com/dp/B0HQZZXXLC';

// Roughly one printed page of large type. A heading never sits alone at the
// foot of a page: it moves to the next page with the paragraph it introduces.
const PAGE_BUDGET = 1000;

function blockLength(b) {
  if (b.type === 'ol') return b.items.join(' ').length + 120 * b.items.length;
  if (b.type === 'h') return 200;
  return b.text.length;
}

function paginate(blocks) {
  const pages = [];
  let page = [];
  let used = 0;
  blocks.forEach((b, i) => {
    const len = blockLength(b);
    const next = blocks[i + 1];
    const needsRoom = b.type === 'h' && next ? len + blockLength(next) : len;
    if (page.length && used + needsRoom > PAGE_BUDGET) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(b);
    used += len;
  });
  if (page.length) pages.push(page);
  return pages;
}

const PAGES = paginate(sample.blocks);

function Block({ block }) {
  if (block.type === 'h') return <h2>{block.text}</h2>;
  if (block.type === 'ol') {
    return (
      <ol>
        {block.items.map((item) => <li key={item}>{item}</li>)}
      </ol>
    );
  }
  return <p>{block.text}</p>;
}

export default function MahjongMirrorSample() {
  // One extra "page" at the end: the keep-reading page.
  const total = PAGES.length + 1;
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState('next');
  const bookRef = useRef(null);
  const touchX = useRef(null);

  const go = useCallback((to) => {
    if (to < 0 || to >= total) return;
    setDir(to > page ? 'next' : 'prev');
    setPage(to);
  }, [page, total]);

  // After a turn, bring the top of the new page into view (below the
  // sticky nav) so the reader never lands mid-page. Skips the first render.
  const turned = useRef(false);
  useEffect(() => {
    if (!turned.current) { turned.current = true; return; }
    const el = bookRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (top < 90) window.scrollTo({ top: window.scrollY + top - 96 });
  }, [page]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') go(page + 1);
      if (e.key === 'ArrowLeft') go(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, page]);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    go(dx < 0 ? page + 1 : page - 1);
  };

  const isLast = page === total - 1;

  return (
    <>
      <SEO
        title="Read a Sample of The Mahjong Mirror by Bill Hajdu"
        description="Read the Introduction to The Mahjong Mirror by Bill Hajdu: how a placemat in a Korean-Chinese restaurant led to four decades of readings and a four-angle framework for wiser decisions."
        path="/the-mahjong-mirror/sample"
        image="/images/book-cover.webp"
        type="book"
      />

      <Nav />

      <main className={styles.main}>
        <div className={`container ${styles.head}`}>
          <span className="overline">A sample from The Mahjong Mirror</span>
          <h1 className={styles.title}>{sample.title}</h1>
          <p className={styles.byline}>By Bill Hajdu</p>
        </div>

        <div className={`container ${styles.readerWrap}`}>
          <div
            ref={bookRef}
            className={styles.book}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            aria-roledescription="book"
          >
            {PAGES.map((blocks, i) => (
              <article
                key={i}
                hidden={i !== page}
                className={`${styles.page} ${i === page ? styles[dir] : ''}`}
                aria-label={`Page ${i + 1} of ${total}`}
              >
                {blocks.map((b, j) => <Block key={j} block={b} />)}
                <div className={styles.folio} aria-hidden="true">{i + 1}</div>
              </article>
            ))}

            <article
              hidden={!isLast}
              className={`${styles.page} ${styles.endPage} ${isLast ? styles[dir] : ''}`}
              aria-label={`Page ${total} of ${total}`}
            >
              <span className="overline">Keep reading</span>
              <h2>The rest of the book is on Amazon</h2>
              <p>
                Eleven chapters on the four angles, with the readings and stories
                behind them. Members get a copy free.
              </p>
              <div className="cta-row cta-row-spaced cta-row-center">
                <a href={AMAZON_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Buy on Amazon · $12.95
                </a>
                <Link href="/membership" className="btn-secondary">See membership</Link>
              </div>
              <button type="button" className={styles.restart} onClick={() => go(0)}>
                Start the introduction again
              </button>
            </article>
          </div>

          <nav className={styles.controls} aria-label="Turn the page">
            <button
              type="button"
              className={styles.turn}
              onClick={() => go(page - 1)}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <span aria-hidden="true">←</span> Previous<span className={styles.turnLabel}> page</span>
            </button>
            <span className={styles.count} aria-live="polite">
              Page {page + 1} of {total}
            </span>
            <button
              type="button"
              className={`${styles.turn} ${styles.turnNext}`}
              onClick={() => go(page + 1)}
              disabled={isLast}
              aria-label="Next page"
            >
              Next<span className={styles.turnLabel}> page</span> <span aria-hidden="true">→</span>
            </button>
          </nav>
          <progress className={styles.progress} value={page + 1} max={total} aria-hidden="true" />
        </div>
      </main>

      <Footer />
    </>
  );
}
