import styles from './PurpleStarChart.module.css';

// Fixed branch positions on the chart. Yin/Tiger sits bottom-left and the
// branches run clockwise from there. The center of the grid carries the
// summary panel.
const BRANCH_AREAS = {
  si:   'si',   wu:   'wu',   wei:  'wei',  shen: 'shen',
  chen: 'chen',                              you:  'you',
  mao:  'mao',                               xu:   'xu',
  yin:  'yin',  chou: 'chou', zi:   'zi',   hai:  'hai',
};

function StarLine({ star, kind }) {
  return (
    <div className={`${styles.star} ${styles[kind]}`}>
      <span className={styles.starName}>{star.name}</span>
      {star.brightness && (
        <span className={styles.bright} title={star.bright}>{star.brightness}</span>
      )}
      {star.mutagen && (
        <span className={styles.mutagen} title={`Transforming ${star.mutagen}`}>
          {star.mutagen}
        </span>
      )}
    </div>
  );
}

function Palace({ p }) {
  const area = BRANCH_AREAS[p.branch];
  const cls = `${styles.palace} ${p.isMing ? styles.mingPalace : ''} ${p.isBody ? styles.bodyPalace : ''}`;
  return (
    <div className={cls} style={{ gridArea: area }}>
      <div className={styles.palaceTop}>
        {p.majorStars.map((s, i) => <StarLine key={`mj-${i}`} star={s} kind="major" />)}
        {p.minorStars.map((s, i) => <StarLine key={`mn-${i}`} star={s} kind="minor" />)}
        {p.adjStars.slice(0, 3).map((s, i) => (
          <div key={`adj-${i}`} className={`${styles.star} ${styles.adj}`}>
            <span className={styles.starName}>{s.name}</span>
          </div>
        ))}
      </div>
      <div className={styles.palaceBottom}>
        <div className={styles.decade}>
          {p.decade ? `Age ${p.decade[0]}–${p.decade[1]}` : ''}
        </div>
        <div className={styles.palaceName}>
          {p.name}
          {p.isMing && <span className={styles.tag}> · Ming</span>}
          {p.isBody && <span className={styles.tag}> · Body</span>}
        </div>
        <div className={styles.branchRow}>
          <span className={styles.animal}>{p.animal}</span>
          <span className={styles.branchHan}>{p.branchHan}</span>
          <span className={styles.stemHan}>{p.stemHan}</span>
        </div>
      </div>
    </div>
  );
}

function CenterPanel({ chart, name }) {
  const animals = {
    zi: 'Rat', chou: 'Ox', yin: 'Tiger', mao: 'Rabbit', chen: 'Dragon', si: 'Snake',
    wu: 'Horse', wei: 'Sheep', shen: 'Monkey', you: 'Rooster', xu: 'Dog', hai: 'Pig',
  };
  return (
    <div className={styles.center} style={{ gridArea: 'center' }}>
      <div className={styles.centerTitle}>Purple Star Chart</div>
      {name && <div className={styles.centerName}>{name}</div>}
      <dl className={styles.centerInfo}>
        <div>
          <dt>Solar</dt>
          <dd>{chart.solarDate}</dd>
        </div>
        <div>
          <dt>Lunar</dt>
          <dd>{chart.chineseDate || chart.lunarDate}</dd>
        </div>
        <div>
          <dt>Five Elements</dt>
          <dd className={styles.cap}>{chart.fiveElementsClass}</dd>
        </div>
        <div>
          <dt>Ming Palace</dt>
          <dd>{animals[chart.soulBranch] || chart.soulBranch} · {chart.soulStar}</dd>
        </div>
        <div>
          <dt>Body Palace</dt>
          <dd>{animals[chart.bodyBranch] || chart.bodyBranch} · {chart.bodyStar}</dd>
        </div>
      </dl>
      <div className={styles.legend}>
        <span className={`${styles.swatch} ${styles.major}`} /> Major star
        <span className={`${styles.swatch} ${styles.minor}`} /> Minor star
        <span className={`${styles.swatch} ${styles.adj}`} /> Influence
      </div>
    </div>
  );
}

export default function PurpleStarChart({ chart, name }) {
  if (!chart || !chart.palaces) return null;
  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {chart.palaces.map((p) => <Palace key={p.branch} p={p} />)}
        <CenterPanel chart={chart} name={name} />
      </div>
    </div>
  );
}
