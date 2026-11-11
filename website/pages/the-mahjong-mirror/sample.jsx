import Link from 'next/link';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import sample from '../../data/mahjong-mirror-sample.json';
import styles from '../../styles/MahjongMirrorSample.module.css';

const AMAZON_URL = 'https://www.amazon.com/dp/B0HQZZXXLC';

export default function MahjongMirrorSample() {
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

      <main>
        <section className="page-header">
          <div className="container">
            <span className="overline">A sample from The Mahjong Mirror</span>
            <h1>{sample.title}</h1>
            <p className={styles.byline}>By Bill Hajdu</p>
          </div>
        </section>

        <section>
          <article className={`container ${styles.article}`}>
            {sample.blocks.map((block, i) => {
              if (block.type === 'h') return <h2 key={i}>{block.text}</h2>;
              if (block.type === 'ol') {
                return (
                  <ol key={i}>
                    {block.items.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                );
              }
              return <p key={i}>{block.text}</p>;
            })}
          </article>
        </section>

        <section className="section-stone">
          <div className={`container ${styles.cta}`}>
            <span className="overline">Keep reading</span>
            <h2>The rest of the book is on Amazon</h2>
            <p>
              Eleven chapters on the four angles, with the readings and stories
              behind them.
            </p>
            <div className="cta-row cta-row-spaced cta-row-center">
              <a href={AMAZON_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">Buy on Amazon</a>
              <Link href="/the-mahjong-mirror" className="btn-secondary">About the book</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
