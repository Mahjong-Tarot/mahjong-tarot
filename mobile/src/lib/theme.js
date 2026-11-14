// Mirrors website/styles/globals.css after the 12 Nov 2026 redesign:
// Libre Franklin headings, Inter body, EB Garamond only for Chinese
// characters, upright fire-red emphasis, light surfaces.
export const color = {
  paper: '#FFFFFF',
  ink: '#14161B',
  ink2: '#2A2D35',
  ink3: '#50545E',
  ink4: '#6B6F79',
  rule: '#E4E5EA',
  rule2: '#EFEFF2',
  fire50: '#FFF4F2',
  fire100: '#FFE2DD',
  fire500: '#E63329',
  fire600: '#C8261C',
  fire700: '#9E1B14',
  gold: '#B8893A',
  goodBg: '#E8F5E8',
  goodInk: '#1E6334',
  neutralBg: '#F6F0E2',
  neutralInk: '#8A6526',
  badBg: '#FFF4F2',
  badInk: '#9E1B14',
};

export const element = {
  Wood: '#3E8E5A',
  Fire: '#E63329',
  Earth: '#B8893A',
  Metal: '#8A8F99',
  Water: '#2F5D8C',
};

export const tone = {
  auspicious: { bg: '#E8F5E8', ink: '#1E6334', label: 'Auspicious day' },
  favorable: { bg: '#F0F6E8', ink: '#4E7530', label: 'Favourable day' },
  neutral: { bg: '#F6F0E2', ink: '#8A6526', label: 'Neutral day' },
  cautionary: { bg: '#FBEEE4', ink: '#A3501C', label: 'Cautionary day' },
  challenging: { bg: '#FFF4F2', ink: '#9E1B14', label: 'Challenging day' },
};

export const font = {
  heading: 'LibreFranklin_600SemiBold',
  headingRegular: 'LibreFranklin_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  book: 'EBGaramond_500Medium',
};

export const space = { xs: 4, sm: 8, sm2: 12, md: 16, lg: 24, lg2: 32, xl: 40 };
export const radius = { sm: 4, md: 8, lg: 12, pill: 999 };
