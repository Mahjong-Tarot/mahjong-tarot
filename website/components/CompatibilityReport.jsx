import { useState } from 'react';
import BaziChart from './BaziChart';
import { elementColor } from '../lib/bazi';
import styles from './CompatibilityReport.module.css';

const TONE_COLORS = {
  great: '#2c8a4a',
  good:  '#3a7bb8',
  mixed: '#b88c4f',
  rough: '#c0392b',
};

function RatingDial({ rating, tier }) {
  const r = Math.max(0, Math.min(100, rating || 0));
  const color = TONE_COLORS[tier?.tone] || '#444';
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (r / 100) * circumference;
  return (
    <div className={styles.dial}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="56" fill="none" stroke="#eee" strokeWidth="10" />
        <circle
          cx="70" cy="70" r="56"
          fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="68" textAnchor="middle" className={styles.dialNum}>{Math.round(r)}</text>
        <text x="70" y="92" textAnchor="middle" className={styles.dialPct}>%</text>
      </svg>
      {tier && (
        <div className={styles.tier} style={{ color }}>{tier.name}</div>
      )}
    </div>
  );
}

function ElementBar({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className={styles.elementBar}>
      {Object.entries(counts).map(([name, count]) => {
        const pct = (count / total) * 100;
        return (
          <div
            key={name}
            className={styles.elementSegment}
            style={{ background: elementColor(name), width: `${pct}%` }}
            title={`${name}: ${count}`}
          >
            {count > 0 && <span className={styles.elementLabel}>{name} {count}</span>}
          </div>
        );
      })}
    </div>
  );
}

const TABS = [
  { key: 'good',    label: 'The Good' },
  { key: 'bad',     label: 'The Not-So-Good' },
  { key: 'romance', label: 'Romance' },
  { key: 'sex',     label: 'In Bed' },
  { key: 'yinyang', label: 'Yin & Yang' },
];

export default function CompatibilityReport({ result, person1Label = 'You', person2Label = 'Partner' }) {
  const [tab, setTab] = useState('good');
  if (!result) return null;
  const {
    person1, person2,
    rating, tier,
    generalMatchDescription,
    yinYangDescription, yin, yang,
    theGood, theNotSoGood, romance, sex,
    soulMate,
    combinedElements, elementStrength,
  } = result;

  const tabContent = {
    good:    theGood,
    bad:     theNotSoGood,
    romance: romance,
    sex:     sex,
    yinyang: yinYangDescription,
  };

  return (
    <div className={styles.wrap}>
      {/* Hero — rating + headline */}
      <div className={styles.hero}>
        <RatingDial rating={rating} tier={tier} />
        <div className={styles.heroText}>
          <h2 className={styles.matchTitle}>
            {person1Label} <span className={styles.amp}>×</span> {person2Label}
          </h2>
          <p className={styles.matchSubtitle}>
            {person1.sign} {yin != null && yang != null && (
              <span className={styles.yinyang}>· {yin}Y / {yang}Y</span>
            )} {' '}vs{' '} {person2.sign}
          </p>
          {generalMatchDescription && (
            <p className={styles.generalNarrative}>{generalMatchDescription}</p>
          )}
          {soulMate && (
            <span className={`${styles.badge} ${soulMate.isMatch ? styles.badgeYes : styles.badgeNo}`}>
              {soulMate.isMatch ? '★ Soul-mate territory' : `Soul-mate sign: ${soulMate.expectedSoulMate}`}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => {
          const has = !!tabContent[t.key];
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              disabled={!has}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className={styles.tabPanel}>
        {tabContent[tab] || <p className={styles.muted}>No detail available for this section.</p>}
      </div>

      {/* Soul mate detail */}
      {soulMate?.description && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Soul mate verdict</h3>
          <p>{soulMate.description}</p>
        </div>
      )}

      {/* Element balance */}
      {combinedElements && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Element mix</h3>
          <ElementBar counts={combinedElements} />
          {elementStrength?.conclusion && (
            <p className={styles.elementConclusion}>{elementStrength.conclusion}</p>
          )}
        </div>
      )}

      {/* Detail toggle for charts */}
      <details className={styles.chartsDetail}>
        <summary>Show full Four-Pillar charts</summary>
        <div className={styles.chartsGrid}>
          <div>
            <h4 className={styles.chartTitle}>{person1Label} · {person1.sign}</h4>
            <BaziChart pillars={person1.pillars} elements={person1.elements} dominantElement={person1.dominantElement} />
          </div>
          <div>
            <h4 className={styles.chartTitle}>{person2Label} · {person2.sign}</h4>
            <BaziChart pillars={person2.pillars} elements={person2.elements} dominantElement={person2.dominantElement} />
          </div>
        </div>
      </details>
    </div>
  );
}
