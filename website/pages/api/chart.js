// Public "free chart" endpoint behind the home-page hero form (/chart).
//
// Runs Bill's reading engines through buildQuickReading (Four Pillars,
// Purple Star, Three Blessings, Fire Horse) and returns only the slice the
// /chart page shows. Every sentence in the response comes from Bill's
// authored data; this file only selects and reshapes it. Nothing is stored.
//
// POST { date: 'YYYY-MM-DD', time?: 'HH:MM', gender?: 'f' | 'm' }
// Purple Star needs a birth time and a gender; without a time it is
// returned as null with purpleStarNeeds: 'time'.

import { buildQuickReading } from '../../lib/quickReading';
import { calculatePillars } from '../../lib/bazi';
import { rateLimit } from '../../lib/rateLimit';

const TYPES = ['bazi', 'ziwei', 'three_blessings', 'fire_horse'];

// Life-stage age bands, as printed in Bill's Four Pillars report
// (lib/fp/render.mjs STAGE_AGES). Used only to mark the stage the person
// is in now.
const STAGE_AGES = { Birth: '0–6', Youth: '6–22', Maturation: '21–35', Adulthood: '35–60', Retirement: '60+' };
const STAGE_STARTS = [['Retirement', 60], ['Adulthood', 35], ['Maturation', 22], ['Youth', 6], ['Birth', 0]];

const FORCE_LABEL = {
  fate: 'Fate', wealth: 'Wealth', opportunity: 'Opportunity', happiness: 'Happiness', recognition: 'Recognition',
};

const LUCK_LABEL = {
  mostLucky: 'Luckiest',
  generallyLucky: 'Generally lucky',
  mixed: 'Mixed luck',
  generallyUnlucky: 'Generally unlucky',
  leastLucky: 'Least lucky',
};

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false;
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return false;
  const thisYear = new Date().getUTCFullYear();
  return y >= 1901 && y <= thisYear && dt.getTime() <= Date.now();
}

function isValidTime(time) {
  const m = /^(\d{2}):(\d{2})$/.exec(time || '');
  return Boolean(m) && Number(m[1]) < 24 && Number(m[2]) < 60;
}

function westernAge(date) {
  const [y, m, d] = date.split('-').map(Number);
  const now = new Date();
  let age = now.getUTCFullYear() - y;
  if (now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d)) age -= 1;
  return age;
}

// "Jù Mén 巨门" -> "Jù Mén"; locked English names ("The Sun") have no hanzi.
function starName(star) {
  const display = star.display || star.en || '';
  return (star.hanzi ? display.replace(star.hanzi, '') : display).trim() || display;
}

function pillarOut(key, label, p) {
  if (!p) return null;
  return {
    key,
    label,
    hanzi: p.pillar,
    name: [p.stem?.element, p.branch?.animal].filter(Boolean).join(' '),
  };
}

function shapeFourPillars(fp, pillars, date) {
  if (!fp) return null;
  const age = westernAge(date);
  const current = (STAGE_STARTS.find(([, start]) => age >= start) || [])[0] || null;
  const order = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const elements = [...(fp.elementMix?.strengths || [])]
    .sort((a, b) => (b.count - a.count) || (order.indexOf(a.element) - order.indexOf(b.element)))
    .map(({ element, count, text }) => ({ element, count, text: (text || '').replace(/\s+/g, ' ').trim() }));

  return {
    hasHour: Boolean(fp.hasHour),
    pillars: [
      pillarOut('year', 'Year', pillars?.year),
      pillarOut('month', 'Month', pillars?.month),
      pillarOut('day', 'Day', pillars?.day),
      pillarOut('hour', 'Hour', pillars?.hour),
    ].filter(Boolean),
    elements,
    stages: (fp.stages || []).map((s) => ({
      stage: s.stage,
      ages: STAGE_AGES[s.stage] || null,
      element: s.element,
      force: FORCE_LABEL[s.force] || s.force,
      // "This is a low normal chi period for you." -> "Low normal chi"
      chiLevel: (() => {
        const m = /This is an? (.+?) chi period/i.exec(s.chi || '');
        return m ? `${m[1].charAt(0).toUpperCase()}${m[1].slice(1)} chi` : null;
      })(),
      chi: s.chi || null,
      fate: (s.fate || '').replace(/\s+/g, ' ').trim() || null,
      current: s.stage === current,
    })),
    conclusion: [fp.conclusion?.desc1, fp.conclusion?.desc2].filter(Boolean),
  };
}

function shapePurpleStar(chart, full) {
  if (!chart || !full) return null;
  const ratingByPalace = {};
  for (const d of full.decades || []) ratingByPalace[d.palace] = d.rating;
  const age = chart.currentAge;

  const palaces = chart.palaces.map((p) => {
    const range = p.decade?.range || null;
    return {
      key: p.key,
      label: p.label,
      branchIdx: p.branchIdx,
      stars: p.majors.map(starName),
      ages: range,
      rating: ratingByPalace[p.label] || null,
      luck: p.luck,
      isBody: Boolean(p.isBody),
      isLuckiest: chart.luckiest === p,
      isUnluckiest: chart.unluckiest === p,
      isCurrent: Boolean(range && age >= range[0] && age <= range[1]),
    };
  });

  const ming = chart.palaces.find((p) => p.key === 'Ming');
  const mingFull = full.palaces.find((p) => p.key === 'Ming');
  const luckiestFull = chart.luckiest ? full.palaces.find((p) => p.key === chart.luckiest.key) : null;

  return {
    palaces,
    fate: ming && mingFull ? {
      stars: ming.majors.map(starName),
      luck: LUCK_LABEL[ming.luck] || null,
      conclusion: mingFull.conclusion || null,
      // Bill's trait lines, e.g. "Strong willed, Quick witted," (trailing comma dropped).
      traits: (mingFull.fate || [])
        .map((t) => t.replace(/\s+/g, ' ').replace(/[,\s]+$/, '').trim())
        .filter(Boolean),
    } : null,
    luckiestPalace: luckiestFull ? { label: luckiestFull.label, text: luckiestFull.conclusion || null } : null,
    luckiestDecade: full.luckiestDecade ? {
      ages: full.luckiestDecade.ages,
      palace: full.luckiestDecade.palace,
      text: full.luckiestDecade.period || null,
    } : null,
  };
}

function shapeThreeBlessings(tb) {
  if (!tb) return null;
  const rows = [['luck', 'Luck'], ['prosperity', 'Prosperity'], ['longevity', 'Longevity']]
    .filter(([key]) => tb[key])
    .map(([key, label]) => ({
      key,
      label,
      verdict: tb.LUCK_NAME?.[tb[key].verdict] || null,
      tally: { lucky: tb[key].tally?.L ?? 0, neutral: tb[key].tally?.N ?? 0, unlucky: tb[key].tally?.U ?? 0 },
    }));
  return {
    rows,
    totalLucky: tb.grand?.totalLucky ?? null,
    narrative: tb.grand?.narrative || null,
  };
}

function shapeFireHorse(fh) {
  if (!fh) return null;
  return {
    band: fh.yearBand?.label || null,
    tone: fh.yearBand?.tone || null,
    headline: fh.signNarrative?.headline || null,
    lead: fh.signNarrative?.lead || null,
    dayMaster: fh.dayMaster?.narrative ? {
      archetype: fh.dayMaster.narrative.archetype || null,
      headline: fh.dayMaster.narrative.headline || null,
    } : null,
    bestMonths: (fh.bestMonths || []).map((m) => m.month),
    worstMonths: (fh.worstMonths || []).map((m) => m.month),
  };
}

function buildChart({ date, time, gender }) {
  const reading = buildQuickReading({
    subject: { birthday: date, birthTime: time || null, gender: gender === 'f' ? 'F' : 'M' },
    types: TYPES,
  });
  const pillars = calculatePillars(date, time || null);
  const fp = reading.fourPillars;
  const ys = fp?.yearSign || null;
  const dm = pillars?.day?.stem || null;

  return {
    input: { date, time: time || null, gender: gender || null },
    sign: ys ? {
      combined: ys.combined,
      element: ys.element,
      animal: ys.animal,
      personality: ys.personality || null,
    } : null,
    dayMaster: dm ? { hanzi: pillars.day.gan, polarity: dm.polarity, element: dm.element } : null,
    fourPillars: shapeFourPillars(fp, pillars, date),
    purpleStar: time ? shapePurpleStar(reading.ziwei, reading.ziweiFull) : null,
    purpleStarNeeds: time ? null : 'time',
    threeBlessings: shapeThreeBlessings(reading.threeBlessings),
    fireHorse: shapeFireHorse(reading.fireHorse),
  };
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!rateLimit(req, res, { name: 'chart', limit: 20, windowMs: 10 * 60_000 })) return;

  const { date, time, gender } = req.body || {};
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'Enter a real birth date between 1901 and today.' });
  }
  if (time && !isValidTime(time)) {
    return res.status(400).json({ error: 'Birth time must be HH:MM.' });
  }
  if (gender && gender !== 'f' && gender !== 'm') {
    return res.status(400).json({ error: 'Gender must be f or m.' });
  }
  if (time && !gender) {
    return res.status(400).json({ error: 'Purple Star needs to know if you are female or male.' });
  }

  try {
    const chart = buildChart({ date, time: time || null, gender: gender || null });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(chart);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('chart: build failed', err);
    return res.status(500).json({ error: 'We could not build this chart. Please check the date and try again.' });
  }
}
