// Chart placement provider (iztro adapter).
//
// This is the SWAPPABLE seam: it turns birth data into the provider-agnostic
// `chart` object the engine consumes, restricted to Bill's 37-star canon and
// reclassified by his Major/Minor split. A future native iztro-free placement
// engine can replace this file without touching engine.mjs / render.mjs.

import { astro } from 'iztro';
import { BRANCH_IDX, BRANCH_ANIMAL, PALACE_CN_TO_KEY, PALACE_LABEL } from './engine.mjs';

function display(c) {
  if (c.nameStatus === 'locked' && c.modernName) return c.modernName;
  return `${c.pinyin || ''} ${c.hanzi}`.trim();
}

// Bill's day rule: a civil day is the day — no rollover for a late-night (子)
// hour. iztro keeps timeIndex 0 (23:00–01:00) on the civil date, which matches.
function hourToTimeIndex(h) { return Math.floor(((h + 1) % 24) / 2); }

export function buildChartFromBirth({ solarDate, hour, gender }, data) {
  const CANON = {};
  for (const s of data.stars) if (s.hanzi && s.kind !== 'Transformation') CANON[s.hanzi] = s;

  const timeIndex = hourToTimeIndex(hour);
  const a = astro.bySolar(solarDate, timeIndex, gender, true);
  const palaces = a.palaces.map((p) => {
    const raw = [...(p.majorStars || []), ...(p.minorStars || []), ...(p.adjectiveStars || [])];
    for (const cyc of ['changsheng12', 'boshi12', 'suiqian12', 'jiangqian12']) {
      const v = p[cyc]; const name = typeof v === 'string' ? v : v && v.name;
      if (name && CANON[name]) raw.push({ name, brightness: '', mutagen: '' });
    }
    const majors = [], minors = [];
    for (const st of raw) {
      const c = CANON[st.name];
      if (!c) continue; // honor Bill's 37 — drop everything else
      // Placement + tagging only. rating/weight/code come from the auspiciousness
      // matrix in engine.scoreChart (needs palace context). brightness is display.
      const star = {
        hanzi: c.hanzi, roman: c.romanization, display: display(c),
        en: (c.nameStatus === 'locked' && c.modernName) ? c.modernName : c.romanization,
        brightness: st.brightness || '', mutagen: st.mutagen || '', billType: c.billType,
      };
      (c.billType === 'Major' ? majors : minors).push(star);
    }
    return {
      key: PALACE_CN_TO_KEY[p.name], label: PALACE_LABEL[PALACE_CN_TO_KEY[p.name]],
      branchHan: p.earthlyBranch, branchIdx: BRANCH_IDX[p.earthlyBranch],
      animal: BRANCH_ANIMAL[p.earthlyBranch],
      decade: p.decadal ? { range: p.decadal.range } : null, ages: p.ages || [],
      majors, minors,
    };
  }).filter((p) => p.key);

  return {
    meta: { solarDate, hour, timeIndex, gender, lunar: a.lunarDate, chinese: a.chineseDate,
      sign: a.sign, zodiac: a.zodiac, soul: a.soul, body: a.body,
      fiveElements: a.fiveElementsClass, timeRange: a.timeRange },
    palaces,
  };
}

export function chineseAge(solarDate, now = new Date()) {
  const [by, bm, bd] = solarDate.split('-').map(Number);
  let west = now.getFullYear() - by;
  if (now.getMonth() + 1 < bm || (now.getMonth() + 1 === bm && now.getDate() < bd)) west -= 1;
  return west + 1;
}
