import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ChartForm from '../components/ChartForm';
import { supabase } from '../lib/supabase';
import useSpamGuard from '../lib/useSpamGuard';
import styles from '../styles/Chart.module.css';

// Every sentence about the person on this page comes from /api/chart, which
// passes through Bill's authored engine text unchanged. Copy written here is
// headings and UI only.

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ELEMENT_CLASS = {
  Wood: styles.elWood, Fire: styles.elFire, Earth: styles.elEarth, Metal: styles.elMetal, Water: styles.elWater,
};

const VERDICT_CLASS = { LUCKY: styles.vLucky, NEUTRAL: styles.vNeutral, UNLUCKY: styles.vUnlucky };

const one = (v) => (Array.isArray(v) ? v[0] : v) || '';

function formatDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function formatTime(time) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function listMonths(months) {
  const parts = months.map(ordinal);
  if (parts.length < 2) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

function sentenceCase(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

function article(phrase) {
  return /^[aeiou]/i.test(phrase || '') ? 'an' : 'a';
}

// The newsletter's sign list (NewsletterSignup) says "Goat" where the engine says "Sheep".
function newsletterSign(animal) {
  return animal === 'Sheep' ? 'Goat' : animal || null;
}

/* ── Sections ─────────────────────────────────────────────────────────── */

function Header({ chart, onEdit }) {
  const { input, sign } = chart;
  const born = [
    `born ${formatDate(input.date)}`,
    formatTime(input.time),
    input.gender === 'f' ? 'female' : input.gender === 'm' ? 'male' : null,
  ].filter(Boolean).join(', ');
  const fp = chart.fourPillars;
  const ps = chart.purpleStar;
  const tb = chart.threeBlessings;
  const fh = chart.fireHorse;

  const summary = [
    { label: 'Four Pillars', value: chart.dayMaster ? `${chart.dayMaster.polarity} ${chart.dayMaster.element} Day Master` : null },
    { label: 'Purple Star', value: ps?.luckiestPalace ? `Luckiest palace: ${ps.luckiestPalace.label}` : 'Needs a birth time' },
    { label: 'Three Blessings', value: tb && tb.totalLucky != null ? `Lucky in ${tb.totalLucky} of 3` : null },
    { label: 'Fire Horse year', value: fh?.band || null },
  ].filter((s) => s.value);

  return (
    <section className={styles.header}>
      <div className={styles.wrap}>
        <div className={styles.headerTop}>
          <p className={styles.overline}>Your chart · {born}</p>
          <button type="button" className={styles.textButton} onClick={onEdit}>
            <span aria-hidden="true">←</span> Change birth details
          </button>
        </div>
        <div className={styles.headline}>
          {sign && (
            <h1 className={styles.h1}>
              You are {article(sign.combined)} {sign.combined}. <em>That is one angle.</em>
            </h1>
          )}
          {sign?.personality && <p className={styles.lede}>&ldquo;{sign.personality}&rdquo;</p>}
        </div>
        {summary.length > 0 && (
          <dl className={styles.summary}>
            {summary.map((s) => (
              <div key={s.label} className={styles.summaryItem}>
                <dt className={styles.label}>{s.label}</dt>
                <dd className={styles.summaryValue}>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {!fp?.hasHour && (
          <p className={styles.notice}>
            No birth time given, so this chart has no Hour pillar and no Purple Star.{' '}
            <button type="button" className={styles.inlineButton} onClick={onEdit}>Add a birth time</button>
          </p>
        )}
      </div>
    </section>
  );
}

function SectionHead({ num, title, aside }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{num} · {title}</h2>
      {aside && <span className={styles.sectionAside}>{aside}</span>}
    </div>
  );
}

function FourPillars({ fp }) {
  const [selected, setSelected] = useState(
    () => (fp.stages.find((s) => s.current) || fp.stages[0])?.stage || null,
  );
  const max = Math.max(1, ...fp.elements.map((e) => e.count));
  const active = fp.stages.find((s) => s.stage === selected);

  return (
    <section className={styles.section}>
      <div className={styles.wrap}>
        <SectionHead num="01" title="Four Pillars" aside="Your elements and the five stages of your life" />

        <div className={styles.pillars}>
          {fp.pillars.map((p) => (
            <div key={p.key} className={`${styles.pillar} ${p.key === 'year' ? styles.pillarYear : ''}`}>
              <div className={styles.label}>{p.label}</div>
              <div lang="zh" className={styles.pillarHan}>{p.hanzi}</div>
              <div className={styles.pillarName}>{p.name}</div>
            </div>
          ))}
          {!fp.hasHour && (
            <div className={`${styles.pillar} ${styles.pillarEmpty}`}>
              <div className={styles.label}>Hour</div>
              <div className={styles.pillarMissing}>Needs a birth time</div>
            </div>
          )}
        </div>

        <h3 className={styles.h3}>Your element mix</h3>
        <ul className={styles.elements}>
          {fp.elements.map((el) => (
            <li key={el.element} className={styles.elementRow}>
              <span className={styles.elementName}>{el.element}</span>
              <span className={styles.bar} aria-hidden="true">
                <span className={`${styles.barFill} ${ELEMENT_CLASS[el.element] || ''} ${styles[`w${Math.round((el.count / max) * 10)}`]}`} />
              </span>
              <span className={styles.elementCount}>{el.count}</span>
              <span className={styles.elementText}>&ldquo;{el.text}&rdquo;</span>
            </li>
          ))}
        </ul>

        <h3 className={styles.h3}>The five stages of your life</h3>
        {fp.conclusion.map((t) => (
          <p key={t} className={styles.quiet}>&ldquo;{t}&rdquo;</p>
        ))}
        <div className={styles.stages} role="group" aria-label="Choose a life stage">
          {fp.stages.map((s) => (
            <button
              key={s.stage}
              type="button"
              className={`${styles.stage} ${s.stage === selected ? styles.stageOn : ''}`}
              aria-pressed={s.stage === selected}
              onClick={() => setSelected(s.stage)}
            >
              <span className={styles.label}>
                {s.stage}{s.ages ? ` · ${s.ages}` : ''}{s.current ? ' · now' : ''}
              </span>
              <span className={styles.stageForce}>{s.force}</span>
              <span className={styles.stageMeta}>
                Ruled by {s.element}
                {s.chiLevel && <><br />{s.chiLevel}</>}
              </span>
            </button>
          ))}
        </div>
        {active && (
          <div className={styles.stageText} aria-live="polite">
            {active.fate && <p><strong>{active.stage}:</strong> &ldquo;{active.fate}&rdquo;</p>}
            {active.chi && <p className={styles.quiet}>&ldquo;{active.chi}&rdquo;</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function palaceTag(p) {
  if (p.isLuckiest) return 'luckiest';
  if (p.isUnluckiest) return 'least lucky';
  if (p.isCurrent) return 'you are here';
  if (p.isBody) return 'body';
  return null;
}

function PurpleStar({ ps, needs, onEdit }) {
  if (!ps) {
    return (
      <section className={`${styles.section} ${styles.tinted}`}>
        <div className={styles.wrap}>
          <SectionHead num="02" title="Purple Star" aside="Twelve palaces, each ruling ten years" />
          <div className={styles.needs}>
            <p>
              {needs === 'time'
                ? 'Purple Star needs a birth time. Add yours to see your twelve palaces.'
                : 'We could not draw the Purple Star chart for these details.'}
            </p>
            {needs === 'time' && (
              <button type="button" className="btn-primary" onClick={onEdit}>Add a birth time</button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // DOM in life order (ages), so phones read the palaces decade by decade;
  // on wider screens each palace is placed on the 4x4 ring by its branch.
  const palaces = [...ps.palaces].sort((a, b) => (a.ages?.[0] ?? 999) - (b.ages?.[0] ?? 999));

  return (
    <section className={`${styles.section} ${styles.tinted}`}>
      <div className={styles.wrap}>
        <SectionHead num="02" title="Purple Star" aside="Twelve palaces, each ruling ten years" />

        <div className={styles.palaceGrid}>
          {ps.fate && (
            <div className={styles.palaceCentre}>
              <div className={styles.centreLabel}>
                Your Fate palace{ps.fate.stars.length ? ` · ${ps.fate.stars.join(', ')}` : ''}{ps.fate.luck ? ` · ${ps.fate.luck.toLowerCase()}` : ''}
              </div>
              {ps.fate.conclusion && <p className={styles.centreText}>&ldquo;{ps.fate.conclusion}&rdquo;</p>}
              {ps.fate.traits.length > 0 && (
                <p className={styles.centreTraits}>{ps.fate.traits.join(' · ')}</p>
              )}
            </div>
          )}
          {palaces.map((p) => {
            const tag = palaceTag(p);
            const cls = [
              styles.palace,
              styles[`b${p.branchIdx}`],
              p.isLuckiest ? styles.palaceLucky : '',
              p.isUnluckiest ? styles.palaceUnlucky : '',
              p.isCurrent ? styles.palaceNow : '',
              p.key === 'Ming' ? styles.palaceFate : '',
            ].join(' ');
            return (
              <div key={p.key} className={cls}>
                <div className={styles.palaceLabel}>{p.label}{tag ? ` · ${tag}` : ''}</div>
                <div className={p.stars.length ? styles.palaceStars : styles.palaceNoStar}>
                  {p.stars.length ? p.stars.join(', ') : 'No major star'}
                </div>
                {p.ages && (
                  <div className={styles.palaceAges}>
                    Ages {p.ages[0]}–{p.ages[1]}{p.rating ? ` · ${sentenceCase(p.rating)}` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.twoUp}>
          {ps.luckiestPalace?.text && (
            <div className={styles.ruled}>
              <div className={`${styles.label} ${styles.labelLucky}`}>Your luckiest palace · {ps.luckiestPalace.label}</div>
              <p>&ldquo;{ps.luckiestPalace.text}&rdquo;</p>
            </div>
          )}
          {ps.luckiestDecade?.text && (
            <div className={styles.ruled}>
              <div className={styles.label}>
                Your luckiest decade · ages {ps.luckiestDecade.ages[0]} to {ps.luckiestDecade.ages[1]}
              </div>
              <p>&ldquo;{ps.luckiestDecade.text}&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BlessingsAndHorse({ tb, fh }) {
  if (!tb && !fh) return null;
  return (
    <section className={`${styles.section} ${styles.ruledTop}`}>
      <div className={`${styles.wrap} ${styles.split}`}>
        {tb && (
          <div className={styles.splitCol}>
            <SectionHead num="03" title="Three Blessings" />
            <ul className={styles.blessings}>
              {tb.rows.map((r) => (
                <li key={r.key} className={styles.blessing}>
                  <span className={styles.blessingName}>
                    {r.label}{' '}
                    {r.verdict && <span className={`${styles.verdict} ${VERDICT_CLASS[r.verdict] || ''}`}>{r.verdict}</span>}
                  </span>
                  <span className={styles.tally}>
                    {r.tally.lucky} lucky · {r.tally.neutral} neutral · {r.tally.unlucky} unlucky
                  </span>
                </li>
              ))}
            </ul>
            {tb.narrative && <p className={styles.afterList}>&ldquo;{tb.narrative}&rdquo;</p>}
          </div>
        )}
        {fh && (
          <div className={styles.splitCol}>
            <SectionHead num="04" title={`Your Fire Horse year${fh.band ? ` · rated ${fh.band.toLowerCase()}` : ''}`} />
            {fh.headline && <h3 className={styles.h3Tight}>{fh.headline}</h3>}
            {fh.lead && <p>&ldquo;{fh.lead}&rdquo;</p>}
            {fh.dayMaster?.headline && (
              <div className={styles.dayMaster}>
                {fh.dayMaster.archetype && <div className={styles.label}>{fh.dayMaster.archetype}</div>}
                <div className={styles.dayMasterLine}>{fh.dayMaster.headline}</div>
              </div>
            )}
            <div className={styles.months}>
              {fh.bestMonths.length > 0 && (
                <span><strong className={styles.best}>Best months:</strong> {listMonths(fh.bestMonths)} lunar</span>
              )}
              {fh.worstMonths.length > 0 && (
                <span><strong className={styles.worst}>Hardest:</strong> {listMonths(fh.worstMonths)} lunar</span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function EmailStep({ sign }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const { checkSpam, SpamField } = useSpamGuard();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    if (checkSpam()) { setStatus('success'); return; }
    setStatus('submitting');
    if (!supabase) { setStatus('error'); return; }
    const { error } = await supabase.rpc('submit_newsletter', {
      p_email: email,
      p_chinese_sign: newsletterSign(sign?.animal),
      p_source: 'chart',
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Chart newsletter signup error:', error);
      setStatus('error');
    } else {
      setStatus('success');
      setEmail('');
    }
  }

  return (
    <section className={styles.emailBand}>
      <div className={`${styles.wrap} ${styles.emailInner}`}>
        <div className={styles.emailCopy}>
          <p className={styles.overline}>Bill&rsquo;s newsletter</p>
          <h2 className={styles.h2}>
            That is the first page. <em>Keep reading with Bill.</em>
          </h2>
          <p className={styles.quiet}>
            Join Bill&rsquo;s newsletter: insights on Mahjong, tarot and Chinese astrology, sent to your inbox.
          </p>
        </div>
        {status === 'success' ? (
          <div className={styles.emailForm} role="status">
            <p className={styles.success}>You&rsquo;re in. Watch your inbox for Bill&rsquo;s next letter.</p>
          </div>
        ) : (
          <form className={styles.emailForm} onSubmit={handleSubmit}>
            <SpamField />
            <label htmlFor="chart-email" className={styles.label}>Email</label>
            <input
              id="chart-email"
              type="email"
              autoComplete="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className={styles.submit} disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Joining…' : <>Join the newsletter <span aria-hidden="true">→</span></>}
            </button>
            {status === 'error' && <p className={styles.error} role="alert">Something went wrong. Please try again.</p>}
          </form>
        )}
      </div>
    </section>
  );
}

function Membership() {
  return (
    <section className={styles.section}>
      <div className={`${styles.wrap} ${styles.cta}`}>
        <h2 className={styles.h2}>There is more to your chart.</h2>
        <Link href="/membership" className="btn-primary btn-lg">
          See what members get <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function ChartPage() {
  const router = useRouter();
  const date = one(router.query.date);
  const time = one(router.query.time);
  const gender = one(router.query.gender);
  const [state, setState] = useState({ status: 'idle', chart: null, error: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!router.isReady || !date) return undefined;
    let cancelled = false;
    setEditing(false);
    setState({ status: 'loading', chart: null, error: '' });
    fetch('/api/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time: time || undefined, gender: gender || undefined }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: 'error', chart: null, error: body.error || 'We could not build this chart.' });
        } else {
          setState({ status: 'ready', chart: body, error: '' });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', chart: null, error: 'We could not reach the server. Please try again.' });
      });
    return () => { cancelled = true; };
  }, [router.isReady, date, time, gender]);

  const showForm = router.isReady && (!date || editing || state.status === 'error');
  const chart = state.status === 'ready' ? state.chart : null;

  return (
    <>
      <SEO
        title="Your free Chinese astrology chart | Mahjong Tarot"
        description="Enter your birth date and see your Four Pillars, Purple Star palaces, Three Blessings and Fire Horse year, from Bill Hajdu's reading engine. Free, no account needed."
        path="/chart"
      />
      <Nav />
      <main className={styles.main}>
        {showForm && (
          <section className={styles.formSection}>
            <div className={styles.wrap}>
              <p className={styles.overline}>Your free chart</p>
              <h1 className={styles.h1}>
                {date ? 'Change your birth details.' : <>See your chart. <em>It takes a minute.</em></>}
              </h1>
              {state.status === 'error' && <p className={styles.errorBlock} role="alert">{state.error}</p>}
              <div className={styles.formWrap}>
                <ChartForm initial={date ? { date, time, gender } : null} />
              </div>
              {editing && chart && (
                <button type="button" className={styles.textButton} onClick={() => setEditing(false)}>
                  Back to my chart
                </button>
              )}
            </div>
          </section>
        )}

        {date && state.status === 'loading' && (
          <section className={styles.formSection}>
            <div className={styles.wrap}>
              <p className={styles.loading} role="status">Working out your chart…</p>
            </div>
          </section>
        )}

        {chart && !editing && (
          <>
            <Header chart={chart} onEdit={() => setEditing(true)} />
            {chart.fourPillars && <FourPillars key={chart.input.date} fp={chart.fourPillars} />}
            <PurpleStar ps={chart.purpleStar} needs={chart.purpleStarNeeds} onEdit={() => setEditing(true)} />
            <BlessingsAndHorse tb={chart.threeBlessings} fh={chart.fireHorse} />
            <EmailStep sign={chart.sign} />
            <Membership />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
