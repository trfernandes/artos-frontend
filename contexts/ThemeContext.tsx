import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { getPaletteForMode, ThemeMode, ThemePalette } from '../constants/colors';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  palette: ThemePalette;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// No cold start do Android, o valor reportado logo após a troca de tema da
// splash (postSplashScreenTheme) pode vir nulo/incorreto antes do SO resolver
// o modo noturno real. A splash é sempre escura, então tratamos esse caso
// indefinido como 'dark' — evita o flash claro que aparecia antes da correção
// via Appearance.addChangeListener.
function normalizeScheme(colorScheme: ColorSchemeName): ThemeMode {
  return colorScheme === 'light' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => normalizeScheme(Appearance.getColorScheme()));

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setMode(normalizeScheme(colorScheme));
    });

    return () => subscription.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const palette = getPaletteForMode(mode);

    return {
      mode,
      isDark: mode === 'dark',
      palette,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return context;
}
