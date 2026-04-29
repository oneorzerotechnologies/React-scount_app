import { useContext, useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemeModeContext } from '@/contexts/theme-mode';

/**
 * Web variant. Same override-aware logic as native, with hydration guard.
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => { setHasHydrated(true); }, []);

  const ctx    = useContext(ThemeModeContext);
  const system = useRNColorScheme() ?? 'light';
  const mode   = ctx?.mode ?? 'system';

  if (!hasHydrated) return 'light';
  if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
  return mode;
}
