import { createContext, useContext, useState, type ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedScheme = 'light' | 'dark';

type Ctx = {
  mode:    ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolved: ResolvedScheme;
};

export const ThemeModeContext = createContext<Ctx | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const system = useRNColorScheme() ?? 'light';
  const resolved: ResolvedScheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, resolved }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): Ctx {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside <ThemeModeProvider>');
  return ctx;
}

export function useResolvedScheme(): ResolvedScheme {
  return useContext(ThemeModeContext)?.resolved ?? 'light';
}
