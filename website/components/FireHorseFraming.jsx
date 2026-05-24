import styles from '../styles/FireHorse.module.css';

const FRAMING_CARDS = [
  {
    title: 'The Setup',
    body: (
      <>
        Bing-Wu (丙午). Yang Fire stem on a Yang Fire branch. Two fires
        stacked together, the rarest amplifier in the 60-year cycle.
        Last seen in 1966. Next in 2086.
      </>
    ),
  },
  {
    title: 'The Pattern',
    body: (
      <>
        Outcomes get pushed to both extremes. Strong relationships
        strengthen; weak ones break. Bold signs win big; cautious signs
        struggle to keep up. The boring middle shrinks.
      </>
    ),
  },
  {
    title: 'The Method',
    body: (
      <>
        Probabilistic, not deterministic. A favorable score means the
        deck is stacked toward good outcomes, not a guarantee. A
        challenging score means real headwinds, not a verdict.
      </>
    ),
  },
];

export default function FireHorseFraming() {
  return (
    <section className={styles.framing}>
      <div className="container">
        <div className={styles.framingGrid}>
          {FRAMING_CARDS.map((card) => (
            <div key={card.title} className={styles.framingCard}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
