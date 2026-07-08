// Four Pillars (Life Cycle) engine data.
//
// Ported verbatim from Bill's own engine, astro-eng/astro:
//   init/v1.0.0/pillars-of-fate.sql  (the 60-row sexagenary table)
//   src/library/chinese-astrology/calculation.ts  (element ids + matriculation constants)
//
// Element ids follow Bill's convention: 1=Wood, 2=Fire, 3=Earth, 4=Metal, 5=Water.
// stemElement / branchElement are the elements of the pillar's heavenly stem and
// earthly branch; nayinElement is the 納音 (na yin) element of the stem-branch pair.
// See docs/features/four-pillars-report/PHASE-1-FINDINGS.md.

export const ELEMENT_NAMES = { 1: 'Wood', 2: 'Fire', 3: 'Earth', 4: 'Metal', 5: 'Water' };

// SignID / earthly-branch index (1-12) -> animal.
export const SIGN_NAMES = {
  1: 'Rat', 2: 'Ox', 3: 'Tiger', 4: 'Rabbit', 5: 'Dragon', 6: 'Snake',
  7: 'Horse', 8: 'Sheep', 9: 'Monkey', 10: 'Rooster', 11: 'Dog', 12: 'Pig',
};

// Heavenly stems (天干) and earthly branches (地支) in canonical order (1-indexed).
export const STEM_ORDER = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Productive cycle order and the matriculation window, from calculation.ts:
//   arrintElementOrder = [1,2,3,4,5]; arrintMatriculationElement = [4,5,1,2,3,4,5]
export const ELEMENT_ORDER = [1, 2, 3, 4, 5];
export const MATRICULATION_ELEMENTS = [4, 5, 1, 2, 3, 4, 5];

// The five life stages, in order. Index 0..4 = Birth..Retirement (Plate order in calc).
export const STAGES = ['Birth', 'Youth', 'Maturation', 'Adulthood', 'Retirement'];

// Sexagenary table: cyclical number (1-60) -> stem/branch numbers + the three elements.
export const PILLARS_OF_FATE = [
  { cyclical: 1, stem: 1, branch: 1, stemElement: 1, branchElement: 5, nayinElement: 4 },
  { cyclical: 2, stem: 2, branch: 2, stemElement: 1, branchElement: 3, nayinElement: 4 },
  { cyclical: 3, stem: 3, branch: 3, stemElement: 2, branchElement: 1, nayinElement: 2 },
  { cyclical: 4, stem: 4, branch: 4, stemElement: 2, branchElement: 1, nayinElement: 2 },
  { cyclical: 5, stem: 5, branch: 5, stemElement: 3, branchElement: 3, nayinElement: 1 },
  { cyclical: 6, stem: 6, branch: 6, stemElement: 3, branchElement: 2, nayinElement: 1 },
  { cyclical: 7, stem: 7, branch: 7, stemElement: 4, branchElement: 2, nayinElement: 3 },
  { cyclical: 8, stem: 8, branch: 8, stemElement: 4, branchElement: 3, nayinElement: 3 },
  { cyclical: 9, stem: 9, branch: 9, stemElement: 5, branchElement: 4, nayinElement: 4 },
  { cyclical: 10, stem: 10, branch: 10, stemElement: 5, branchElement: 4, nayinElement: 4 },
  { cyclical: 11, stem: 1, branch: 11, stemElement: 1, branchElement: 3, nayinElement: 2 },
  { cyclical: 12, stem: 2, branch: 12, stemElement: 1, branchElement: 5, nayinElement: 2 },
  { cyclical: 13, stem: 3, branch: 1, stemElement: 2, branchElement: 5, nayinElement: 5 },
  { cyclical: 14, stem: 4, branch: 2, stemElement: 2, branchElement: 3, nayinElement: 5 },
  { cyclical: 15, stem: 5, branch: 3, stemElement: 3, branchElement: 1, nayinElement: 3 },
  { cyclical: 16, stem: 6, branch: 4, stemElement: 3, branchElement: 1, nayinElement: 3 },
  { cyclical: 17, stem: 7, branch: 5, stemElement: 4, branchElement: 3, nayinElement: 4 },
  { cyclical: 18, stem: 8, branch: 6, stemElement: 4, branchElement: 2, nayinElement: 4 },
  { cyclical: 19, stem: 9, branch: 7, stemElement: 5, branchElement: 2, nayinElement: 1 },
  { cyclical: 20, stem: 10, branch: 8, stemElement: 5, branchElement: 3, nayinElement: 1 },
  { cyclical: 21, stem: 1, branch: 9, stemElement: 1, branchElement: 4, nayinElement: 5 },
  { cyclical: 22, stem: 2, branch: 10, stemElement: 1, branchElement: 4, nayinElement: 5 },
  { cyclical: 23, stem: 3, branch: 11, stemElement: 2, branchElement: 3, nayinElement: 3 },
  { cyclical: 24, stem: 4, branch: 12, stemElement: 2, branchElement: 5, nayinElement: 3 },
  { cyclical: 25, stem: 5, branch: 1, stemElement: 3, branchElement: 5, nayinElement: 2 },
  { cyclical: 26, stem: 6, branch: 2, stemElement: 3, branchElement: 3, nayinElement: 2 },
  { cyclical: 27, stem: 7, branch: 3, stemElement: 4, branchElement: 1, nayinElement: 1 },
  { cyclical: 28, stem: 8, branch: 4, stemElement: 4, branchElement: 1, nayinElement: 1 },
  { cyclical: 29, stem: 9, branch: 5, stemElement: 5, branchElement: 3, nayinElement: 5 },
  { cyclical: 30, stem: 10, branch: 6, stemElement: 5, branchElement: 2, nayinElement: 5 },
  { cyclical: 31, stem: 1, branch: 7, stemElement: 1, branchElement: 2, nayinElement: 4 },
  { cyclical: 32, stem: 2, branch: 8, stemElement: 1, branchElement: 3, nayinElement: 4 },
  { cyclical: 33, stem: 3, branch: 9, stemElement: 2, branchElement: 4, nayinElement: 2 },
  { cyclical: 34, stem: 4, branch: 10, stemElement: 2, branchElement: 4, nayinElement: 2 },
  { cyclical: 35, stem: 5, branch: 11, stemElement: 3, branchElement: 3, nayinElement: 1 },
  { cyclical: 36, stem: 6, branch: 12, stemElement: 3, branchElement: 5, nayinElement: 1 },
  { cyclical: 37, stem: 7, branch: 1, stemElement: 4, branchElement: 5, nayinElement: 3 },
  { cyclical: 38, stem: 8, branch: 2, stemElement: 4, branchElement: 3, nayinElement: 3 },
  { cyclical: 39, stem: 9, branch: 3, stemElement: 5, branchElement: 1, nayinElement: 4 },
  { cyclical: 40, stem: 10, branch: 4, stemElement: 5, branchElement: 1, nayinElement: 4 },
  { cyclical: 41, stem: 1, branch: 5, stemElement: 1, branchElement: 3, nayinElement: 2 },
  { cyclical: 42, stem: 2, branch: 6, stemElement: 1, branchElement: 2, nayinElement: 2 },
  { cyclical: 43, stem: 3, branch: 7, stemElement: 2, branchElement: 2, nayinElement: 5 },
  { cyclical: 44, stem: 4, branch: 8, stemElement: 2, branchElement: 3, nayinElement: 5 },
  { cyclical: 45, stem: 5, branch: 9, stemElement: 3, branchElement: 4, nayinElement: 3 },
  { cyclical: 46, stem: 6, branch: 10, stemElement: 3, branchElement: 4, nayinElement: 3 },
  { cyclical: 47, stem: 7, branch: 11, stemElement: 4, branchElement: 3, nayinElement: 4 },
  { cyclical: 48, stem: 8, branch: 12, stemElement: 4, branchElement: 5, nayinElement: 4 },
  { cyclical: 49, stem: 9, branch: 1, stemElement: 5, branchElement: 5, nayinElement: 1 },
  { cyclical: 50, stem: 10, branch: 2, stemElement: 5, branchElement: 3, nayinElement: 1 },
  { cyclical: 51, stem: 1, branch: 3, stemElement: 1, branchElement: 1, nayinElement: 5 },
  { cyclical: 52, stem: 2, branch: 4, stemElement: 1, branchElement: 1, nayinElement: 5 },
  { cyclical: 53, stem: 3, branch: 5, stemElement: 2, branchElement: 3, nayinElement: 3 },
  { cyclical: 54, stem: 4, branch: 6, stemElement: 2, branchElement: 2, nayinElement: 3 },
  { cyclical: 55, stem: 5, branch: 7, stemElement: 3, branchElement: 2, nayinElement: 2 },
  { cyclical: 56, stem: 6, branch: 8, stemElement: 3, branchElement: 3, nayinElement: 2 },
  { cyclical: 57, stem: 7, branch: 9, stemElement: 4, branchElement: 4, nayinElement: 1 },
  { cyclical: 58, stem: 8, branch: 10, stemElement: 4, branchElement: 4, nayinElement: 1 },
  { cyclical: 59, stem: 9, branch: 11, stemElement: 5, branchElement: 3, nayinElement: 5 },
  { cyclical: 60, stem: 10, branch: 12, stemElement: 5, branchElement: 5, nayinElement: 5 },
];
