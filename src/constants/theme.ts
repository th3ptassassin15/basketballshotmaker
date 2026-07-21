/**
 * Fixed, high-contrast, low-clutter palette for TapVoice Creator.
 * The app intentionally does not support a dark theme: consistent, predictable
 * color and layout matters more for AAC users than user preference here.
 */

export const colors = {
  background: '#F4F8FB',
  surface: '#FFFFFF',
  primary: '#3E7CB1',
  primaryDark: '#2C5F8A',
  secondary: '#7FB77E',
  accent: '#F2B880',
  text: '#1F2A33',
  textMuted: '#5A6B75',
  border: '#D7E3EA',
  highlight: '#FFD166',
  danger: '#C0392B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  label: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 17, fontWeight: '400' as const },
  small: { fontSize: 14, fontWeight: '500' as const },
};

/** Apple/Android accessibility guidelines recommend at least 44-48pt touch targets; AAC users benefit from larger. */
export const minTouchTarget = 88;
