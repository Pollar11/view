/**
 * View design tokens — a restrained, Tesla-adjacent dark system:
 * near-black grounds, high-contrast text, hairline borders, one accent,
 * generous negative space, uppercase tracked labels.
 */
export const palette = {
  black: '#000000',
  ground: '#0A0A0A',
  surface: '#131316',
  surfaceHi: '#1B1B20',
  line: 'rgba(255,255,255,0.10)',
  lineHi: 'rgba(255,255,255,0.22)',
  text: '#F5F5F7',
  textDim: '#A1A1A8',
  textFaint: '#6E6E76',
  accent: '#3E63DD',
  accentHi: '#5B7BFF',
  danger: '#E5484D',
  success: '#30A46C',
  scrim: 'rgba(0,0,0,0.62)',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 40,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const type = {
  hero: { fontSize: 40, lineHeight: 46, fontWeight: '200' as const, letterSpacing: -0.5 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '300' as const, letterSpacing: -0.2 },
  section: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 2, textTransform: 'uppercase' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  meta: { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.3 },
} as const;

export const motion = {
  fast: 140,
  base: 240,
  slow: 420,
} as const;

export const layout = {
  maxContentWidth: 1180,
  railGap: space.md,
  screenPadding: space.lg,
};
