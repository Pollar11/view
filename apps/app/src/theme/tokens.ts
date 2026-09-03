/**
 * View design system — inspired by tesla.com, then taken its own direction:
 * near-black grounds, cinematic full-bleed imagery, one hairline weight for
 * structure, thin display type with tight tracking, wide-tracked uppercase
 * labels, a single restrained accent, and a generous vertical rhythm.
 */
export const palette = {
  black: '#000000',
  ground: '#0B0B0C',
  groundElevated: '#0F0F11',
  surface: '#161619',
  surfaceHi: '#1E1E22',
  line: 'rgba(255,255,255,0.09)',
  lineHi: 'rgba(255,255,255,0.20)',
  text: '#F4F4F5',
  textDim: '#9B9BA3',
  textFaint: '#67676E',
  accent: '#3457D5',
  accentHi: '#6E8BFF',
  danger: '#E5484D',
  live: '#FF453A',
  success: '#32D74B',
  scrim: 'rgba(0,0,0,0.55)',
  navBlur: 'rgba(11,11,12,0.72)',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
  section: 72,
  hero: 96,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 52, lineHeight: 56, fontWeight: '300' as const, letterSpacing: -1 },
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '300' as const, letterSpacing: -0.6 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '400' as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 18, lineHeight: 25, fontWeight: '400' as const, letterSpacing: -0.1 },
  section: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 2.4, textTransform: 'uppercase' as const },
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' as const },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  meta: { fontSize: 12, lineHeight: 17, fontWeight: '400' as const, letterSpacing: 0.2 },
} as const;

export const motion = {
  fast: 130,
  base: 220,
  slow: 420,
} as const;

export const layout = {
  maxContentWidth: 1240,
  gutter: 20,
  navHeight: 60,
};
