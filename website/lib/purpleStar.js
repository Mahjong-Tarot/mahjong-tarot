import { astro } from 'iztro';

const IZTRO_TO_KEY = {
  yin: 'yin', mao: 'mao', chen: 'chen', si: 'si',
  woo: 'wu', wei: 'wei', shen: 'shen', you: 'you',
  xu: 'xu', hai: 'hai', zi: 'zi', chou: 'chou',
};

const BRANCH_DETAILS = {
  zi:   { animal: 'Rat',     han: '子' },
  chou: { animal: 'Ox',      han: '丑' },
  yin:  { animal: 'Tiger',   han: '寅' },
  mao:  { animal: 'Rabbit',  han: '卯' },
  chen: { animal: 'Dragon',  han: '辰' },
  si:   { animal: 'Snake',   han: '巳' },
  wu:   { animal: 'Horse',   han: '午' },
  wei:  { animal: 'Sheep',   han: '未' },
  shen: { animal: 'Monkey',  han: '申' },
  you:  { animal: 'Rooster', han: '酉' },
  xu:   { animal: 'Dog',     han: '戌' },
  hai:  { animal: 'Pig',     han: '亥' },
};

const PALACE_LABELS = {
  soul:     'Ming',
  body:     'Body',
  parents:  'Parents',
  spirit:   'Leisure',
  property: 'Property',
  career:   'Career',
  friends:  'Servants',
  surface:  'Travel',
  health:   'Health',
  wealth:   'Wealth',
  children: 'Children',
  spouse:   'Marriage',
  siblings: 'Siblings',
};

const STEM_HAN = {
  jia: '甲', yi: '乙', bing: '丙', ding: '丁', wu: '戊',
  ji: '己', geng: '庚', xin: '辛', ren: '壬', gui: '癸',
};

const MUTAGEN_LABELS = {
  A: 'Lu',  B: 'Quan', C: 'Ke',  D: 'Ji',
  禄: 'Lu', 权: 'Quan', 科: 'Ke', 忌: 'Ji',
};

export function hourToTimeIndex(hour) {
  if (hour == null || Number.isNaN(hour)) return null;
  return Math.floor(((hour % 24) + 1) / 2) % 12;
}

function genderToZh(g) {
  if (g === 'F' || g === 'female' || g === '女') return '女';
  return '男';
}

function brightnessLabel(b) {
  if (!b) return '';
  // iztro returns strings like '[+3]', '[+2]', '[0]', '[-3]'
  const m = String(b).match(/-?\d+/);
  if (!m) return String(b);
  const n = parseInt(m[0], 10);
  if (n >= 3) return 'Bright';
  if (n >= 1) return 'Strong';
  if (n === 0) return 'Even';
  if (n >= -1) return 'Weak';
  return 'Dim';
}

function mutagenLabel(m) {
  if (!m) return null;
  const key = String(m).trim();
  return MUTAGEN_LABELS[key] || key;
}

function normalizeStar(s) {
  return {
    name:       s.name,
    type:       s.type,
    brightness: s.brightness || '',
    bright:     brightnessLabel(s.brightness),
    mutagen:    mutagenLabel(s.mutagen),
    scope:      s.scope,
  };
}

/**
 * Compute a Purple Star (Zi Wei Dou Shu) chart.
 * Requires both date and time of birth.
 *
 * @param {object}  args
 * @param {string}  args.birthday   YYYY-MM-DD
 * @param {string}  args.birthTime  HH:MM (24h)
 * @param {string}  [args.gender]   'M' | 'F' (defaults to male)
 */
export function calculatePurpleStar({ birthday, birthTime, gender }) {
  if (!birthday || !birthTime) return null;

  const [hh] = birthTime.split(':').map(Number);
  const ti = hourToTimeIndex(hh);
  if (ti == null) return null;

  let a;
  try {
    a = astro.bySolar(birthday, ti, genderToZh(gender), true, 'en-US');
  } catch (err) {
    return null;
  }

  const palaces = a.palaces.map((p) => {
    const branchKey = IZTRO_TO_KEY[p.earthlyBranch] || p.earthlyBranch;
    const detail = BRANCH_DETAILS[branchKey] || {};
    return {
      branch:    branchKey,
      animal:    detail.animal || p.earthlyBranch,
      branchHan: detail.han || '',
      stem:      p.heavenlyStem,
      stemHan:   STEM_HAN[p.heavenlyStem] || '',
      name:      PALACE_LABELS[p.name] || p.name,
      rawName:   p.name,
      isMing:    p.isOriginalPalace || p.name === 'soul',
      isBody:    p.isBodyPalace,
      decade:    p.decadal?.range || null,
      ages:      Array.isArray(p.ages) ? p.ages : [],
      majorStars: (p.majorStars || []).map(normalizeStar),
      minorStars: (p.minorStars || []).map(normalizeStar),
      adjStars:   (p.adjectiveStars || []).map(normalizeStar),
    };
  });

  return {
    solarDate:   a.solarDate,
    lunarDate:   a.lunarDate,
    chineseDate: a.chineseDate,
    sign:        a.sign,
    zodiac:      a.zodiac,
    soulBranch:  IZTRO_TO_KEY[a.earthlyBranchOfSoulPalace] || a.earthlyBranchOfSoulPalace,
    bodyBranch:  IZTRO_TO_KEY[a.earthlyBranchOfBodyPalace] || a.earthlyBranchOfBodyPalace,
    soulStar:    a.soul,
    bodyStar:    a.body,
    fiveElementsClass: a.fiveElementsClass,
    palaces,
  };
}
