import { useMemo, useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { ORGANIZATION, WEBSITE, PERSON_BILL, graph, breadcrumb } from '../lib/schema';
import { calculatePillars, STEMS, elementColor } from '../lib/bazi';
import { supabase } from '../lib/supabase';
import overview from '../data/fire-horse/year-overview.json';
import signsScores from '../data/fire-horse/signs-scores.json';
import dmScores from '../data/fire-horse/day-master-scores.json';
import signsNarrative from '../data/fire-horse/signs-narrative.json';
import dmNarrative from '../data/fire-horse/day-master-narrative.json';
import styles from '../styles/FireHorse.module.css';

const SIGNS = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
               'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig'];

const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];

const FIXED_ELEMENT = {
  rat: 'water', ox: 'water', pig: 'water',
  tiger: 'wood', rabbit: 'wood', dragon: 'wood',
  snake: 'fire', horse: 'fire', sheep: 'fire',
  monkey: 'metal', rooster: 'metal', dog: 'metal',
};

const ELEMENT_LABEL = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' };
const SIGN_LABEL = Object.fromEntries(SIGNS.map(s => [s, s[0].toUpperCase() + s.slice(1)]));

const BAND_FOR = (s) => {
  if (s >= 0.85) return { label: 'Peak window',     tone: 'positive', short: 'Peak' };
  if (s >= 0.70) return { label: 'Favorable',       tone: 'positive', short: 'Favorable' };
  if (s >= 0.55) return { label: 'Mildly positive', tone: 'positive', short: 'Mild +' };
  if (s >= 0.45) return { label: 'Neutral',         tone: 'neutral',  short: 'Neutral' };
  if (s >= 0.30) return { label: 'Mildly adverse',  tone: 'negative', short: 'Mild -' };
  if (s >= 0.15) return { label: 'Difficult',       tone: 'negative', short: 'Difficult' };
  return            { label: 'Severe',           tone: 'negative', short: 'Severe' };
};

const BAND_COLOR = {
  positive: '#3a8a3a',
  neutral:  '#b88c4f',
  negative: '#c0392b',
};

function findEntry(sign, element) {
  return signsScores.find((e) => e.sign === sign && e.element === element);
}

function topMonths(monthly, n = 3, ascending = false) {
  const sorted = [...monthly].sort((a, b) => ascending ? a.score - b.score : b.score - a.score);
  return sorted.slice(0, n);
}

function MonthlyBars({ scores, label }) {
  const max = 1.0;
  return (
    <div className={styles.chart}>
      <div className={styles.chartLabel}>{label}</div>
      <div className={styles.chartGrid}>
        <div className={styles.chartGuide} style={{ bottom: '85%' }}><span>0.85</span></div>
        <div className={styles.chartGuide} style={{ bottom: '50%' }}><span>0.50</span></div>
        <div className={styles.chartGuide} style={{ bottom: '15%' }}><span>0.15</span></div>
        <div className={styles.chartBars}>
          {scores.map((m) => {
            const band = BAND_FOR(m.score);
            const height = `${(m.score / max) * 100}%`;
            return (
              <div key={m.month} className={styles.barWrap} title={`Month ${m.month}: ${m.score.toFixed(3)}`}>
                <div className={styles.bar} style={{ height, background: BAND_COLOR[band.tone] }}>
                  <span className={styles.barScore}>{m.score.toFixed(2)}</span>
                </div>
                <div className={styles.barLabel}>{SIGN_LABEL[m.sign].slice(0, 3)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function YearOfTheFireHorse() {
  const [sign, setSign]         = useState('');
  const [element, setElement]   = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [profile, setProfile]   = useState(null);
  const [profileAttempted, setProfileAttempted] = useState(false);

  // Try to pull profile from Supabase if signed in
  useEffect(() => {
    if (!supabase || profileAttempted) return;
    setProfileAttempted(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) setProfile(data);
    })();
  }, [profileAttempted]);

  // If user has a profile and hasn't manually selected sign yet, auto-fill from profile
  useEffect(() => {
    if (!profile?.pillars || sign) return;
    const animal = profile.pillars.year?.branch?.animal?.toLowerCase();
    const elemMaybe = profile.pillars.year?.stem?.element?.toLowerCase();
    if (animal && SIGNS.includes(animal)) setSign(animal);
    if (elemMaybe && ELEMENTS.includes(elemMaybe)) setElement(elemMaybe);
    if (profile.birthday) setBirthDate(profile.birthday);
  }, [profile, sign]);

  // Compute Day Master from birth date if entered manually
  const dayMasterStem = useMemo(() => {
    if (profile?.pillars?.day?.gan) {
      const dmHan = profile.pillars.day.gan;
      const dmInfo = STEMS[dmHan];
      return dmInfo ? Object.entries(STEMS).find(([han]) => han === dmHan)?.[1] : null;
    }
    if (birthDate) {
      const p = calculatePillars(birthDate, birthTime || null);
      const dmHan = p?.day?.gan;
      return dmHan ? STEMS[dmHan] : null;
    }
    return null;
  }, [profile, birthDate, birthTime]);

  const dayMasterEntry = useMemo(() => {
    if (!dayMasterStem) return null;
    return dmScores.find((d) => d.stem === dayMasterStem.en);
  }, [dayMasterStem]);

  const effectiveElement = element || (sign ? FIXED_ELEMENT[sign] : '');
  const baseEntry = sign && effectiveElement ? findEntry(sign, effectiveElement) : null;

  // Compose final scores with optional Day Master overlay
  const composed = useMemo(() => {
    if (!baseEntry) return null;
    const yearLift = dayMasterEntry?.year_lift ?? 0;
    const monthLifts = dayMasterEntry?.monthly_lifts ?? [];
    const finalMonthly = baseEntry.monthly_scores.map((m, i) => {
      const monthLift = monthLifts[i]?.lift ?? 0;
      const raw = m.score + yearLift + monthLift;
      const score = Math.max(0.05, Math.min(0.95, raw));
      return { ...m, score, base_score: m.score, monthLift };
    });
    const finalYear = Math.max(
      0.05,
      Math.min(0.95, baseEntry.year_score + yearLift)
    );
    const monthlyAvg = finalMonthly.reduce((sum, m) => sum + m.score, 0) / 12;
    return { yearScore: finalYear, monthlyAvg, monthly: finalMonthly };
  }, [baseEntry, dayMasterEntry]);

  const yearBand = composed ? BAND_FOR(composed.yearScore) : null;

  return (
    <>
      <SEO
        title="Year of the Fire Horse 2026 — Personal Forecast | Mahjong Tarot"
        description="Personalized forecast for the 2026 Year of the Fire Horse. The Fire Horse comes once every 60 years and is the most polarized year in the entire Chinese astrology cycle. See your sign, element, and Day Master reading."
        path="/year-of-the-fire-horse"
        image="/images/book-cover.webp"
        jsonLd={graph([
          ORGANIZATION,
          WEBSITE,
          PERSON_BILL,
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Year of the Fire Horse 2026', url: '/year-of-the-fire-horse' },
          ]),
        ])}
      />
      <Nav />

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Once every 60 years &middot; {overview.stem_branch}</p>
            <h1 className={styles.title}>The Year of the <em>Fire Horse</em></h1>
            <p className={styles.lead}>
              {overview.gregorian_range.begin} &mdash; {overview.gregorian_range.end}.
              The Fire Horse is the rarest and most polarized year in the entire Chinese
              60-year cycle. <strong>Double fire.</strong> All or nothing. Some signs
              will have one of the best years of their lives. Others will face a steep
              uphill battle. This is your personalized reading.
            </p>
          </div>
        </div>
      </section>

      {/* Year framing */}
      <section className={styles.framing}>
        <div className="container">
          <div className={styles.framingGrid}>
            <div className={styles.framingCard}>
              <h3>The Setup</h3>
              <p>
                Bing-Wu (丙午). Yang Fire stem on a Yang Fire branch. Two fires
                stacked together — the rarest amplifier in the 60-year cycle.
                Last seen in 1966. Next in 2086.
              </p>
            </div>
            <div className={styles.framingCard}>
              <h3>The Pattern</h3>
              <p>
                Outcomes get pushed to both extremes. Strong relationships
                strengthen; weak ones break. Bold signs win big; cautious signs
                struggle to keep up. The boring middle shrinks.
              </p>
            </div>
            <div className={styles.framingCard}>
              <h3>The Method</h3>
              <p>
                Probabilistic, not deterministic. A favorable score means the
                deck is stacked toward good outcomes &mdash; not a guarantee. A
                challenging score means real headwinds &mdash; not a verdict.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Forecast form */}
      <section className={styles.forecast}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Find Your Forecast</h2>
            <p className={styles.sectionLead}>
              Pick your zodiac sign for the basic reading. Add your birth element for the deeper 60-sign reading. Add your birth date to unlock the Day Master overlay &mdash; the layer that real BaZi practitioners use.
            </p>
          </div>

          {profile && (
            <div className={styles.profilePill}>
              Loaded from your profile: <strong>{profile.name || 'Account'}</strong>
              {profile.birthday && <> &middot; born {profile.birthday}</>}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Your zodiac sign</label>
              <div className={styles.signGrid}>
                {SIGNS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.signBtn} ${sign === s ? styles.signBtnActive : ''}`}
                    onClick={() => setSign(s)}
                  >
                    {SIGN_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Your birth element <span className={styles.opt}>(optional)</span></label>
              <div className={styles.elementGrid}>
                <button
                  type="button"
                  className={`${styles.elemBtn} ${!element ? styles.elemBtnActive : ''}`}
                  onClick={() => setElement('')}
                >
                  Use sign default
                </button>
                {ELEMENTS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={`${styles.elemBtn} ${element === e ? styles.elemBtnActive : ''}`}
                    onClick={() => setElement(e)}
                  >
                    <span className={styles.elemSwatch} style={{ background: elementColor(ELEMENT_LABEL[e]) }} />
                    {ELEMENT_LABEL[e]}
                  </button>
                ))}
              </div>
              {sign && !element && (
                <p className={styles.hint}>Defaulting to <strong>{ELEMENT_LABEL[FIXED_ELEMENT[sign]]}</strong> (the {SIGN_LABEL[sign]}’s fixed element).</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Birth date <span className={styles.opt}>(optional, unlocks Day Master)</span></label>
              <div className={styles.dateRow}>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className={styles.input}
                  placeholder="Birth time (optional)"
                />
              </div>
              {dayMasterStem && (
                <p className={styles.hint}>
                  Day Master detected: <strong>{dayMasterStem.en} ({dayMasterStem.polarity} {dayMasterStem.element})</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Result */}
      {composed && (
        <section className={styles.result}>
          <div className="container">
            <div className={styles.resultHeader}>
              <p className={styles.resultEyebrow}>
                {SIGN_LABEL[sign]} &middot; {ELEMENT_LABEL[effectiveElement]}
                {dayMasterStem && <> &middot; Day Master {dayMasterStem.en}</>}
              </p>
              <div className={styles.scoreBlock}>
                <div className={styles.scoreNum}>{composed.yearScore.toFixed(2)}</div>
                <div className={styles.scoreBand} style={{ color: BAND_COLOR[yearBand.tone] }}>
                  {yearBand.label}
                </div>
              </div>
            </div>

            {(() => {
              const sn = signsNarrative[sign];
              const dn = dayMasterStem ? dmNarrative[dayMasterStem.en] : null;
              return (
                <>
                  <div className={styles.summary}>
                    <p className={styles.headlineQuote}>&ldquo;{sn.headline}&rdquo;</p>
                    <p>{sn.lead}</p>

                    <div className={styles.lifeAreas}>
                      <div className={styles.lifeArea}>
                        <h4>Career</h4>
                        <p>{sn.career}</p>
                      </div>
                      <div className={styles.lifeArea}>
                        <h4>Money</h4>
                        <p>{sn.money}</p>
                      </div>
                      <div className={styles.lifeArea}>
                        <h4>Love</h4>
                        <p>{sn.love}</p>
                      </div>
                    </div>

                    <p className={styles.advice}>
                      <span className={styles.adviceLabel}>This year's advice for you</span>
                      {sn.advice}
                    </p>
                  </div>

                  {dn && (
                    <div className={styles.dmSection}>
                      <p className={styles.dmEyebrow}>Day Master overlay &middot; {dn.ten_gods}</p>
                      <h3 className={styles.dmHeadline}>{dn.headline}</h3>
                      <p className={styles.dmArchetype}>{dn.archetype} &middot; {dayMasterEntry.year_lift >= 0 ? '+' : ''}{dayMasterEntry.year_lift.toFixed(2)} to your year score</p>
                      <p>{dn.extended}</p>
                      <div className={styles.dmGrid}>
                        <div>
                          <h4>For your career</h4>
                          <p>{dn.career}</p>
                        </div>
                        <div>
                          <h4>For your relationships</h4>
                          <p>{dn.relationships}</p>
                        </div>
                      </div>
                      <p className={styles.advice}>
                        <span className={styles.adviceLabel}>Day Master advice</span>
                        {dn.advice}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}

            <MonthlyBars scores={composed.monthly} label="Your 12-month curve" />

            <div className={styles.keyMonths}>
              <div className={styles.keyMonthsCol}>
                <h4>Best windows</h4>
                <ul>
                  {topMonths(composed.monthly, 3).map((m) => {
                    const date = overview.lunar_months.find(lm => lm.index === m.month);
                    return (
                      <li key={m.month}>
                        <strong>{date?.stem_branch} ({SIGN_LABEL[m.sign]} month)</strong>
                        <span className={styles.monthDate}>{date?.begin} &mdash; {date?.end}</span>
                        <span className={styles.monthScore}>{m.score.toFixed(2)} &middot; {BAND_FOR(m.score).short}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className={styles.keyMonthsCol}>
                <h4>Hardest windows</h4>
                <ul>
                  {topMonths(composed.monthly, 3, true).map((m) => {
                    const date = overview.lunar_months.find(lm => lm.index === m.month);
                    return (
                      <li key={m.month}>
                        <strong>{date?.stem_branch} ({SIGN_LABEL[m.sign]} month)</strong>
                        <span className={styles.monthDate}>{date?.begin} &mdash; {date?.end}</span>
                        <span className={styles.monthScore}>{m.score.toFixed(2)} &middot; {BAND_FOR(m.score).short}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About methodology */}
      <section className={styles.method}>
        <div className="container">
          <div className={styles.methodInner}>
            <h2>About this forecast</h2>
            <p>
              The scoring engine combines three layers: the structural sign-vs-Horse compatibility (12 signs), an element overlay for your birth element (60-sign view), and an optional Day Master overlay derived from your birth date (10 Heavenly Stems, 10 Gods 十神 framework). The Fire Horse year applies a volatility model on top — element relationships are amplified ×1.4 and final scores are stretched toward the extremes, mathematically encoding the &ldquo;all or nothing&rdquo; nature of double-fire years.
            </p>
            <p>
              Every score is probabilistic. A 0.26 score for the Rat does not mean the year will be bad — it means the structural deck is stacked toward headwinds, and the Rats who navigate it well are the ones who recognize that and adapt. Even the worst sign has its Peak windows, and even the best sign has months where the right move is to wait.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
