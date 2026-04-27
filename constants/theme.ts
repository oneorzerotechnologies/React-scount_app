/**
 * scount.my mobile colour tokens.
 *
 * Brand: `moss` (emerald scale, primary CTA + brand mark) + `ink`
 * (deep emerald-black for dark surfaces). Slate fills out neutrals.
 *
 * Light by default. Dark theme mirrors the marketing site.
 */

import { Platform } from 'react-native';

export const moss = {
  50:  '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  300: '#6EE7B7',
  400: '#34D399',
  500: '#10B981', // primary
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

export const ink = {
  900: '#04110A',
  800: '#061A0F',
  700: '#082316',
  600: '#0C2E1D',
} as const;

export const slate = {
  50:  '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
} as const;

export const Colors = {
  light: {
    text:             slate[900],
    textMuted:        slate[600],
    background:       '#F1F5F4',
    surface:          '#FFFFFF',
    surfaceMuted:     slate[100],
    border:           slate[200],
    tint:             moss[700],
    icon:             slate[500],
    tabIconDefault:   slate[400],
    tabIconSelected:  moss[700],
    brand:            moss[500],
  },
  dark: {
    text:             '#E8FFF3',
    textMuted:        'rgba(232,255,243,0.55)',
    background:       '#020A06',
    surface:          ink[800],
    surfaceMuted:     ink[700],
    border:           'rgba(6,78,59,0.40)',
    tint:             moss[300],
    icon:             'rgba(232,255,243,0.55)',
    tabIconDefault:   'rgba(232,255,243,0.40)',
    tabIconSelected:  moss[300],
    brand:            moss[500],
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans:    'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif:   'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    serif:   "ui-serif, serif",
    rounded: "ui-rounded, sans-serif",
    mono:    "JetBrains Mono, ui-monospace, monospace",
  },
});
