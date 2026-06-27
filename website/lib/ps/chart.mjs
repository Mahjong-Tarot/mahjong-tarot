// Proprietary Purple Star chart placement — NO third-party astrology library.
//
// Replaces the old placement adapter. Same `chart` contract the engine consumes
// (see PROPRIETARY-ENGINE-SPEC.md §2). Browser-safe: takes `data` (which now also
// carries the vendored lunar table). Places the full matrix canon.
//
// Branch index 子=0…亥=11. "顺"=+1 (clockwise), "逆"=−1 (counter-clockwise).

import {
  STEMS, BRANCHES, solarToLunar, yearGanzhi, hourToBranchIdx, bureauFromGanzhi,
} from './lunar.mjs';
import { BRANCH_IDX, BRANCH_ANIMAL, PALACE_CN_TO_KEY, PALACE_LABEL } from './engine.mjs';

const mod = (n) => ((n % 12) + 12) % 12;

// The 20 "Major" stars (matrix Type=Major) → billType Major; everything else Minor.
const MAJOR_SET = new Set('紫微 天机 太阳 武曲 天同 廉贞 天府 太阴 贪狼 巨门 天相 天梁 七杀 破军 文昌 文曲 擎羊 陀罗 火星 铃星'.split(' '));

// palace order counter-clockwise from 命宫
const PALACE_SEQ_CN = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母'];

// display extras (parity with the prior provider)
const SOUL_BY_MING = ['贪狼', '巨门', '禄存', '文曲', '廉贞', '武曲', '破军', '武曲', '廉贞', '文曲', '禄存', '巨门']; // 命主 by 命宫 branch
const BODY_BY_YEAR = ['火星', '天相', '天梁', '天同', '文昌', '天机', '火星', '天相', '天梁', '天同', '文昌', '天机']; // 身主 by 年支
const TIME_RANGE = ['00:00~01:00', '01:00~03:00', '03:00~05:00', '05:00~07:00', '07:00~09:00', '09:00~11:00', '11:00~13:00', '13:00~15:00', '15:00~17:00', '17:00~19:00', '19:00~21:00', '21:00~23:00'];

// ── year-stem keyed tables ────────────────────────────────────────────────────
const LUCUN = { 甲: 2, 乙: 3, 丙: 5, 丁: 6, 戊: 5, 己: 6, 庚: 8, 辛: 9, 壬: 11, 癸: 0 }; // 禄存 branch
const KUI = { 甲: 1, 乙: 0, 丙: 11, 丁: 11, 戊: 1, 己: 0, 庚: 1, 辛: 6, 壬: 3, 癸: 3 }; // 天魁
const YUE = { 甲: 7, 乙: 8, 丙: 9, 丁: 9, 戊: 7, 己: 8, 庚: 7, 辛: 2, 壬: 5, 癸: 5 }; // 天钺
const TIANGUAN = { 甲: 7, 乙: 4, 丙: 5, 丁: 2, 戊: 3, 己: 9, 庚: 11, 辛: 9, 壬: 10, 癸: 6 }; // 天官
const TIANFU_STAR = { 甲: 9, 乙: 8, 丙: 0, 丁: 11, 戊: 3, 己: 2, 庚: 6, 辛: 5, 壬: 6, 癸: 5 }; // 天福
const TIANCHU = { 甲: 5, 乙: 6, 丙: 0, 丁: 5, 戊: 6, 己: 8, 庚: 2, 辛: 6, 壬: 9, 癸: 11 }; // 天厨
// Si-Hua: [禄, 权, 科, 忌] star hanzi by year stem
const SIHUA = {
  甲: ['廉贞', '破军', '武曲', '太阳'], 乙: ['天机', '天梁', '紫微', '太阴'],
  丙: ['天同', '天机', '文昌', '廉贞'], 丁: ['太阴', '天同', '天机', '巨门'],
  戊: ['贪狼', '太阴', '右弼', '天机'], 己: ['武曲', '贪狼', '天梁', '文曲'],
  庚: ['太阳', '武曲', '太阴', '天同'], 辛: ['巨门', '太阳', '文曲', '文昌'],
  壬: ['天梁', '紫微', '左辅', '武曲'], 癸: ['破军', '巨门', '太阴', '贪狼'],
};
const MUTAGEN_CH = ['禄', '权', '科', '忌'];

// 紫微 placement table (the classical 起紫微 table), indexed [bureauNum][day-1] → branch.
const ZIWEI_TABLE = {
  2: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4],
  3: [4, 1, 2, 5, 2, 3, 6, 3, 4, 7, 4, 5, 8, 5, 6, 9, 6, 7, 10, 7, 8, 11, 8, 9, 0, 9, 10, 1, 10, 11],
  4: [11, 4, 1, 2, 0, 5, 2, 3, 1, 6, 3, 4, 2, 7, 4, 5, 3, 8, 5, 6, 4, 9, 6, 7, 5, 10, 7, 8, 6, 11],
  5: [6, 11, 4, 1, 2, 7, 0, 5, 2, 3, 8, 1, 6, 3, 4, 9, 2, 7, 4, 5, 10, 3, 8, 5, 6, 11, 4, 9, 6, 7],
  6: [9, 6, 11, 4, 1, 2, 10, 7, 0, 5, 2, 3, 11, 8, 1, 6, 3, 4, 0, 9, 2, 7, 4, 5, 1, 10, 3, 8, 5, 6],
};

// ── year-branch keyed tables (triads) ─────────────────────────────────────────
const TRIAD = (yb) => yb % 4; // 申子辰=0group? we index by explicit maps below instead
const HUOXING_START = { // 火星 start by year-branch triad
  寅: 1, 午: 1, 戌: 1, 申: 2, 子: 2, 辰: 2, 巳: 3, 酉: 3, 丑: 3, 亥: 9, 卯: 9, 未: 9,
};
const LINGXING_START = {
  寅: 3, 午: 3, 戌: 3, 申: 10, 子: 10, 辰: 10, 巳: 10, 酉: 10, 丑: 10, 亥: 10, 卯: 10, 未: 10,
};
const TIANMA = { 申: 2, 子: 2, 辰: 2, 寅: 8, 午: 8, 戌: 8, 巳: 11, 酉: 11, 丑: 11, 亥: 5, 卯: 5, 未: 5 };
const XIANCHI = { 申: 9, 子: 9, 辰: 9, 寅: 3, 午: 3, 戌: 3, 巳: 6, 酉: 6, 丑: 6, 亥: 0, 卯: 0, 未: 0 }; // 咸池
const HUAGAI = { 申: 4, 子: 4, 辰: 4, 寅: 10, 午: 10, 戌: 10, 巳: 1, 酉: 1, 丑: 1, 亥: 7, 卯: 7, 未: 7 }; // 华盖(三合)
const JIANGXING = { 申: 0, 子: 0, 辰: 0, 寅: 6, 午: 6, 戌: 6, 巳: 9, 酉: 9, 丑: 9, 亥: 3, 卯: 3, 未: 3 }; // 将星
const POSUI = { 子: 5, 午: 5, 卯: 5, 酉: 5, 寅: 9, 申: 9, 巳: 9, 亥: 9, 辰: 1, 戌: 1, 丑: 1, 未: 1 }; // 破碎
// 孤辰/寡宿 by year-branch season group
function guChenGuaSu(yb) { // returns [孤辰, 寡宿] branch idx
  const b = BRANCHES[yb];
  if (['寅', '卯', '辰'].includes(b)) return [5, 1];   // 巳, 丑
  if (['巳', '午', '未'].includes(b)) return [8, 4];   // 申, 辰
  if (['申', '酉', '戌'].includes(b)) return [11, 7];  // 亥, 未
  return [2, 10];                                      // 亥子丑 → 寅, 戌
}
const LONGCHI = (yb) => mod(4 + yb);   // 龙池 辰起子顺
const FENGGE = (yb) => mod(10 - yb);   // 凤阁 戌起子逆
const TIANKU = (yb) => mod(6 - yb);    // 天哭 午起子逆
const TIANXU = (yb) => mod(6 + yb);    // 天虚 午起子顺
const HONGLUAN = (yb) => mod(3 - yb);  // 红鸾 卯起子逆
const TIANKONG = (yb) => mod(yb + 1);  // 天空 = 岁建(年支)前一位

// ── month keyed tables (month is 1..12) ───────────────────────────────────────
const TIANYAO = (m) => mod(1 + (m - 1));   // 天姚 丑起正月顺
const TIANXING = (m) => mod(9 + (m - 1));  // 天刑 酉起正月顺
const TIANWU = (m) => [5, 8, 2, 11][(m - 1) % 4]; // 天巫 巳申寅亥 cycle
const JIESHEN_M = (m) => mod(8 + 2 * Math.floor((m - 1) / 2)); // 解神 申起,每两月顺一位
const YINSHA = (m) => [2, 0, 10, 8, 6, 4][(m - 1) % 6]; // 阴煞 寅子戌申午辰
const TIANYUE = (m) => [10, 5, 4, 2, 7, 3, 11, 7, 2, 6, 10, 2][m - 1]; // 天月 (month table)
// 蜚廉 by year branch (triad table)
const FEILIAN = { 子: 8, 丑: 9, 寅: 10, 卯: 5, 辰: 6, 巳: 7, 午: 2, 未: 3, 申: 4, 酉: 11, 戌: 0, 亥: 1 };

// ── hour keyed ────────────────────────────────────────────────────────────────
const TAIFU = (h) => mod(6 + h);  // 台辅 午起子时顺
const FENGGAO = (h) => mod(2 + h); // 封诰 寅起子时顺

function makeStar(hanzi, data) {
  const overlay = (data.stars || []).find((s) => s.hanzi === hanzi);
  const billType = MAJOR_SET.has(hanzi) ? 'Major' : 'Minor';
  let display = hanzi, roman = '', en = hanzi;
  if (overlay) {
    roman = overlay.romanization || '';
    const locked = overlay.nameStatus === 'locked' && overlay.modernName;
    display = locked ? overlay.modernName : `${overlay.pinyin || overlay.romanization || ''} ${hanzi}`.trim();
    en = locked ? overlay.modernName : (overlay.romanization || hanzi);
  }
  return { hanzi, roman, display, en, brightness: '', mutagen: '', billType };
}

export function buildChartFromBirth({ solarDate, hour, gender }, data) {
  const table = data.lunarTable;
  const lunar = solarToLunar(table, solarDate);
  const day = lunar.lunarDay;
  // Leap-month convention: days 1–15 count as the current month, days 16+ as the
  // next month (闰月前半算本月，后半算下月).
  const month = lunar.lunarMonth + (lunar.isLeap && day >= 16 ? 1 : 0);
  const yg = yearGanzhi(lunar.lunarYear);
  const yb = yg.branchIdx;
  const hourIdx = hourToBranchIdx(hour);
  const male = gender === 'male';
  const forward = yg.yang === male;        // 阳男阴女顺 / 阴男阳女逆

  // palaces + stems + life/body
  const mingIdx = mod(2 + (month - 1) - hourIdx);
  const bodyIdx = mod(2 + (month - 1) + hourIdx);
  const yinStemIdx = ((yg.stemIdx % 5) * 2 + 2) % 10; // 五虎遁: 寅 cell stem
  const palaceStemIdx = (b) => (yinStemIdx + mod(b - 2)) % 10;

  // bins of stars per branch cell
  const bin = Array.from({ length: 12 }, () => []);
  const put = (hanzi, branchIdx) => bin[mod(branchIdx)].push(hanzi);

  // Bureau from 命宫 ganzhi
  const bureau = bureauFromGanzhi(palaceStemIdx(mingIdx), mingIdx);
  const n = bureau.num;

  // 紫微 (classical placement table)
  const ziwei = ZIWEI_TABLE[n][day - 1];

  // 14 majors
  put('紫微', ziwei); put('天机', ziwei - 1); put('太阳', ziwei - 3);
  put('武曲', ziwei - 4); put('天同', ziwei - 5); put('廉贞', ziwei - 8);
  const tianfu = mod(4 - ziwei);
  put('天府', tianfu); put('太阴', tianfu + 1); put('贪狼', tianfu + 2);
  put('巨门', tianfu + 3); put('天相', tianfu + 4); put('天梁', tianfu + 5);
  put('七杀', tianfu + 6); put('破军', tianfu + 10);

  // hour-based
  put('文昌', mod(10 - hourIdx)); put('文曲', mod(4 + hourIdx));
  put('地劫', mod(11 + hourIdx)); put('地空', mod(11 - hourIdx));
  put('台辅', TAIFU(hourIdx)); put('封诰', FENGGAO(hourIdx));
  // month-based
  put('左辅', mod(4 + (month - 1))); put('右弼', mod(10 - (month - 1)));
  put('天姚', TIANYAO(month)); put('天刑', TIANXING(month)); put('天巫', TIANWU(month));
  put('解神', JIESHEN_M(month)); put('阴煞', YINSHA(month)); put('天月', TIANYUE(month));
  put('年解', mod(10 - yb));        // 戌起子年逆
  put('月德', mod(yb + 5));
  put('蜚廉', FEILIAN[BRANCHES[yb]]);
  // year-stem-based
  const lucun = LUCUN[yg.stem];
  put('禄存', lucun); put('擎羊', lucun + 1); put('陀罗', lucun - 1);
  put('天魁', KUI[yg.stem]); put('天钺', YUE[yg.stem]);
  put('天官', TIANGUAN[yg.stem]); put('天福', TIANFU_STAR[yg.stem]); put('天厨', TIANCHU[yg.stem]);
  // year-branch-based
  put('天马', TIANMA[BRANCHES[yb]]);
  put('火星', mod(HUOXING_START[BRANCHES[yb]] + hourIdx));
  put('铃星', mod(LINGXING_START[BRANCHES[yb]] + hourIdx));
  put('咸池', XIANCHI[BRANCHES[yb]]);
  put('红鸾', HONGLUAN(yb)); put('天喜', mod(HONGLUAN(yb) + 6));
  put('龙池', LONGCHI(yb)); put('凤阁', FENGGE(yb));
  put('天哭', TIANKU(yb)); put('天虚', TIANXU(yb));
  put('破碎', POSUI[BRANCHES[yb]]); put('天空', TIANKONG(yb));
  const [gu, gua] = guChenGuaSu(yb); put('孤辰', gu); put('寡宿', gua);
  // day-based: 三台/八座/恩光/天贵 walk from 左辅/右弼/文昌/文曲
  put('三台', mod((mod(4 + (month - 1))) + (day - 1)));      // 左辅 + (day-1) 顺
  put('八座', mod((mod(10 - (month - 1))) - (day - 1)));     // 右弼 − (day-1) 逆
  put('恩光', mod((mod(10 - hourIdx)) + (day - 1) - 1));     // 文昌 + (day-1) −1
  put('天贵', mod((mod(4 + hourIdx)) + (day - 1) - 1));      // 文曲 + (day-1) −1
  // 天才 = 命宫 + 年支; 天寿 = 身宫 + 年支
  put('天才', mod(mingIdx + yb)); put('天寿', mod(bodyIdx + yb));
  // 华盖 (三合) — also appears in jiangqian series at same cell
  put('华盖', HUAGAI[BRANCHES[yb]]);

  // Si-Hua mutagens (tag, not place)
  const mut = {}; SIHUA[yg.stem].forEach((h, i) => { mut[h] = MUTAGEN_CH[i]; });

  // 旬空 — the void branch of the year's 旬; iztro picks the 2nd void for yin stems.
  const cyc = (() => { for (let i = 0; i < 60; i++) if (i % 10 === yg.stemIdx && i % 12 === yb) return i; })();
  const xunHead = cyc - (cyc % 10);
  put('旬空', mod(xunHead + 10 + (yg.stemIdx % 2)));
  // 截路 / 空亡 by year stem (consecutive pair)
  const JIELU = { 甲: 8, 己: 8, 乙: 6, 庚: 6, 丙: 4, 辛: 4, 丁: 2, 壬: 2, 戊: 0, 癸: 0 };
  put('截路', JIELU[yg.stem]); put('空亡', mod(JIELU[yg.stem] + 1));

  // cyclical 12-god series ------------------------------------------------------
  const CS = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
  const CS_START = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 }[n]; // by bureau
  const csDir = forward ? 1 : -1;
  const csAt = {}; CS.forEach((s, i) => { csAt[mod(CS_START + csDir * i)] = s; });

  const BS = ['博士', '力士', '青龙', '小耗', '将军', '奏书', '飞廉', '喜神', '病符', '大耗', '伏兵', '官府'];
  const bsAt = {}; BS.forEach((s, i) => { bsAt[mod(lucun + csDir * i)] = s; });

  const JQ = ['将星', '攀鞍', '岁驿', '息神', '华盖', '劫煞', '灾煞', '天煞', '指背', '咸池', '月煞', '亡神'];
  const jqStart = JIANGXING[BRANCHES[yb]];
  const jqAt = {}; JQ.forEach((s, i) => { jqAt[mod(jqStart + i)] = s; }); // 顺 always

  const SQ = ['岁建', '晦气', '丧门', '贯索', '官符', '小耗', '大耗', '龙德', '白虎', '天德', '吊客', '病符'];
  const sqAt = {}; SQ.forEach((s, i) => { sqAt[mod(yb + i)] = s; }); // 顺 always

  // ── assemble palaces ─────────────────────────────────────────────────────────
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    const b = mod(mingIdx - i);
    const cn = PALACE_SEQ_CN[i];
    const key = PALACE_CN_TO_KEY[cn];
    const placed = bin[b];
    const majors = [], minors = [];
    for (const h of placed) {
      const star = makeStar(h, data);
      if (mut[h]) star.mutagen = MUTAGEN_CH[SIHUA[yg.stem].indexOf(h)];
      (star.billType === 'Major' ? majors : minors).push(star);
    }
    palaces.push({ _cn: cn, key, label: PALACE_LABEL[key], branchHan: BRANCHES[b], branchIdx: b,
      animal: BRANCH_ANIMAL[BRANCHES[b]], _csName: csAt[b], _bsName: bsAt[b], _jqName: jqAt[b], _sqName: sqAt[b],
      majors, minors, decade: null, ages: [] });
  }

  // attach the 4 cyclical-series stars as minors (canon, billType Minor)
  for (const p of palaces) {
    for (const nm of [p._csName, p._bsName, p._jqName, p._sqName]) {
      if (nm) p.minors.push(makeStar(nm, data));
    }
  }
  // 天伤 always in 仆役/交友 (seq idx 7); 天使 always in 疾厄 (seq idx 5)
  palaces[7].minors.push(makeStar('天伤', data));
  palaces[5].minors.push(makeStar('天使', data));

  // decades 大限: first start age = bureau n; walk from 命宫, 阳男阴女 顺(+) / 阴男阳女 逆(−)
  const byBranch = {}; for (const p of palaces) byBranch[p.branchIdx] = p;
  for (let s = 0; s < 12; s++) {
    const b = mod(mingIdx + (forward ? s : -s));
    const p = byBranch[b];
    if (p) p.decade = { range: [n + 10 * s, n + 10 * s + 9] };
  }

  // 小限 ages: start by year-branch triad; age1 there; male 顺 / female 逆
  const XIAOXIAN_START = { 寅: 4, 午: 4, 戌: 4, 申: 10, 子: 10, 辰: 10, 巳: 7, 酉: 7, 丑: 7, 亥: 1, 卯: 1, 未: 1 };
  const xxStart = XIAOXIAN_START[BRANCHES[yb]];
  const xxDir = male ? 1 : -1;
  for (let age = 1; age <= 120; age++) {
    const b = mod(xxStart + xxDir * (age - 1));
    const p = byBranch[b]; if (p) p.ages.push(age);
  }

  // mark body palace
  for (const p of palaces) p.isBody = (p.branchIdx === bodyIdx);

  return {
    meta: {
      solarDate, hour, timeIndex: hourIdx, gender,
      lunar: `${lunar.lunarYear}-${lunar.lunarMonth}-${lunar.lunarDay}${lunar.isLeap ? ' (leap)' : ''}`,
      chinese: `${yg.stem}${yg.branch}`,
      fiveElements: bureau.cn, bureauNum: n,
      soul: SOUL_BY_MING[mingIdx], body: BODY_BY_YEAR[yb],
      bodyBranch: BRANCHES[bodyIdx], timeRange: TIME_RANGE[hourIdx],
    },
    palaces: palaces.map(({ _cn, _csName, _bsName, _jqName, _sqName, ...p }) => p),
  };
}

export function chineseAge(solarDate, now = new Date()) {
  const [by, bm, bd] = solarDate.split('-').map(Number);
  let west = now.getFullYear() - by;
  if (now.getMonth() + 1 < bm || (now.getMonth() + 1 === bm && now.getDate() < bd)) west -= 1;
  return west + 1;
}
