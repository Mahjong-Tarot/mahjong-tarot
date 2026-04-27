import { Solar } from 'lunar-typescript';

export const STEMS = {
  '甲': { en: 'Jia', element: 'Wood',  polarity: 'Yang' },
  '乙': { en: 'Yi',  element: 'Wood',  polarity: 'Yin'  },
  '丙': { en: 'Bing', element: 'Fire', polarity: 'Yang' },
  '丁': { en: 'Ding', element: 'Fire', polarity: 'Yin'  },
  '戊': { en: 'Wu',  element: 'Earth', polarity: 'Yang' },
  '己': { en: 'Ji',  element: 'Earth', polarity: 'Yin'  },
  '庚': { en: 'Geng', element: 'Metal', polarity: 'Yang' },
  '辛': { en: 'Xin', element: 'Metal', polarity: 'Yin'  },
  '壬': { en: 'Ren', element: 'Water', polarity: 'Yang' },
  '癸': { en: 'Gui', element: 'Water', polarity: 'Yin'  },
};

export const BRANCHES = {
  '子': { en: 'Zi',   animal: 'Rat',     element: 'Water' },
  '丑': { en: 'Chou', animal: 'Ox',      element: 'Earth' },
  '寅': { en: 'Yin',  animal: 'Tiger',   element: 'Wood'  },
  '卯': { en: 'Mao',  animal: 'Rabbit',  element: 'Wood'  },
  '辰': { en: 'Chen', animal: 'Dragon',  element: 'Earth' },
  '巳': { en: 'Si',   animal: 'Snake',   element: 'Fire'  },
  '午': { en: 'Wu',   animal: 'Horse',   element: 'Fire'  },
  '未': { en: 'Wei',  animal: 'Sheep',   element: 'Earth' },
  '申': { en: 'Shen', animal: 'Monkey',  element: 'Metal' },
  '酉': { en: 'You',  animal: 'Rooster', element: 'Metal' },
  '戌': { en: 'Xu',   animal: 'Dog',     element: 'Earth' },
  '亥': { en: 'Hai',  animal: 'Pig',     element: 'Water' },
};

const ELEMENT_COLORS = {
  Wood:  '#3a8a3a',
  Fire:  '#c0392b',
  Earth: '#b88c4f',
  Metal: '#999999',
  Water: '#2d6cdf',
};

export function elementColor(name) {
  return ELEMENT_COLORS[name] || '#444';
}

function buildPillar(gan, zhi) {
  return {
    gan,
    zhi,
    pillar: gan + zhi,
    stem: STEMS[gan] || null,
    branch: BRANCHES[zhi] || null,
  };
}

/**
 * Compute the BaZi four-pillars chart.
 * @param {string} birthday  YYYY-MM-DD
 * @param {string|null} birthTime  HH:MM (24h) or null
 * @returns { year, month, day, hour|null, hasTime }
 */
export function calculatePillars(birthday, birthTime) {
  if (!birthday) return null;
  const [y, m, d] = birthday.split('-').map(Number);
  if (!y || !m || !d) return null;

  let hour = 12, minute = 0, hasTime = false;
  if (birthTime) {
    const parts = birthTime.split(':').map(Number);
    if (!Number.isNaN(parts[0])) {
      hour = parts[0];
      minute = parts[1] || 0;
      hasTime = true;
    }
  }

  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  const ec = solar.getLunar().getEightChar();

  return {
    year:  buildPillar(ec.getYearGan(),  ec.getYearZhi()),
    month: buildPillar(ec.getMonthGan(), ec.getMonthZhi()),
    day:   buildPillar(ec.getDayGan(),   ec.getDayZhi()),
    hour:  hasTime ? buildPillar(ec.getTimeGan(), ec.getTimeZhi()) : null,
    hasTime,
  };
}

/** Quick Chinese zodiac animal from birthday alone. */
export function getZodiacAnimal(birthday) {
  const p = calculatePillars(birthday, null);
  return p?.year?.branch?.animal ?? null;
}

/** Tally the five elements across all pillars. */
export function tallyElements(pillars) {
  const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  if (!pillars) return counts;
  const positions = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean);
  for (const p of positions) {
    if (p.stem?.element) counts[p.stem.element]++;
    if (p.branch?.element) counts[p.branch.element]++;
  }
  return counts;
}

/** Dominant element (returns the one with highest count, or 'Balanced' if tied). */
export function dominantElement(counts) {
  const max = Math.max(...Object.values(counts));
  if (max === 0) return null;
  const winners = Object.entries(counts).filter(([, v]) => v === max);
  return winners.length === 1 ? winners[0][0] : 'Balanced';
}

const ELEMENT_GENERATES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const ELEMENT_DESTROYS  = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };

const INTERACTION_COPY = {
  aligned:    { headline: 'Aligned',           line: "Today's energy mirrors your own. Steady, familiar, a good day to settle in." },
  feeds:      { headline: 'You set the tone',  line: 'Your energy fuels the day. Lead, initiate, decide. Things you push will move.' },
  fed_by:     { headline: 'Wind at your back', line: 'Today supports you. Let things come, accept help, take what is offered.' },
  controls:   { headline: 'Take charge',       line: "You have the upper hand today. Push on stalled work, ask for what you want." },
  controlled: { headline: 'Move carefully',    line: "Today's energy can wear on you. Conserve, observe, save the big asks for tomorrow." },
};

/** Classic five-element interaction: how does `self` element relate to `other`? */
export function elementInteraction(self, other) {
  if (!self || !other) return null;
  if (self === other)                    return { kind: 'aligned',    ...INTERACTION_COPY.aligned };
  if (ELEMENT_GENERATES[self] === other) return { kind: 'feeds',      ...INTERACTION_COPY.feeds };
  if (ELEMENT_GENERATES[other] === self) return { kind: 'fed_by',     ...INTERACTION_COPY.fed_by };
  if (ELEMENT_DESTROYS[self]  === other) return { kind: 'controls',   ...INTERACTION_COPY.controls };
  if (ELEMENT_DESTROYS[other] === self)  return { kind: 'controlled', ...INTERACTION_COPY.controlled };
  return null;
}
