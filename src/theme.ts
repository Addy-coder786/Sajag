/**
 * Design tokens: red/white "safety" look with soft pink panels and rounded,
 * shadowed cards. Text colours keep ≥ 4.5:1 contrast on their backgrounds.
 */
export const C = {
  bg: '#FFF7F7',
  surface: '#FFFFFF',
  ink: '#1F1B24',
  muted: '#5C5866',
  line: '#F1DADA',

  red: '#D7261E', // primary (white text on it passes AA)
  redDark: '#B11D17',
  redSoft: '#FDE4E3', // pink panels
  redTint: '#FFF0EF',

  green: '#1E9E4A', // call buttons
  greenSoft: '#E5F6EB',
  blue: '#2457D6',
  blueSoft: '#E8EEFF',
  purple: '#6A3FD6',
  purpleSoft: '#EFEAFE',
  amber: '#9A4A00',
  amberSoft: '#FFF1DC',

  navy: '#2A1E3D',
  white: '#FFFFFF',
  shadow: '#B4302A',
};

export const FONT = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  extrabold: 'Poppins_800ExtraBold',
};

/** Minimum touch targets: 48dp everywhere, 64dp for the main actions. */
export const TOUCH = { min: 48, main: 64 };

export const RADIUS = 18;
export const GAP = 14;

/** Devanagari needs extra line height so matras are not clipped. */
export const LINE_HEIGHT = 1.55;

/** Soft card shadow (iOS/web) + elevation (Android). */
export const SHADOW = {
  shadowColor: C.shadow,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;
