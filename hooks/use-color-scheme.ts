import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemeModeContext } from '@/contexts/theme-mode';

/**
 * Resolved color scheme. Honors the user's Appearance preference
 * from the ThemeModeProvider, falling back to system. Always returns
 * 'light' | 'dark' (never null).
 */
export function useColorScheme(): 'light' | 'dark' {
  const ctx    = useContext(ThemeModeContext);
  const system = useRNColorScheme() ?? 'light';
  const mode   = ctx?.mode ?? 'system';
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}
