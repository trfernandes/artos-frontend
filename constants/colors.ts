export type ThemeMode = 'light' | 'dark';

export type ThemeShadowToken = {
  shadowColor: string;
  elevation: number;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
};

export type ThemePalette = {
  primary: string;
  secondary: string;
  terciary: string;
  warning: string;
  error: string;
  confirm: string;
  disabled: string;
  disabled2: string;
  disabled3: string;
  selected: string;
  buttons: {
    active: string;
    inactive: string;
  };
  fonts: {
    dark: string;
    light: string;
    inactive: string;
    inactive2: string;
    link: string;
  };
  icons: {
    dark: string;
    light: string;
    inactive: string;
    inactive2: string;
  };
  border: string;
  borderCard: string;
  backgroundColor: string;
  backgroundColor2: string;
  backgroundColor3: string;
  backgroundColor4: string;
  overlays: {
    backdrop: string;
    strongBackdrop: string;
  };
  gradients: {
    auth: [string, string];
    drawerHeader: [string, string];
    dashboard: [string, string];
  };
  shadows: Record<100 | 200 | 300, ThemeShadowToken>;
  // Cores de identidade por plano. `accent` = cor vibrante (ícone/borda/fundo/dot);
  // `text` = variante com contraste AA para uso como texto sobre o fundo do tema.
  plans: Record<
    'avaliacao' | 'starter' | 'essencial' | 'crescimento',
    { accent: string; text: string }
  >;
  // Paleta multitom pra identidade visual por pessoa (avatares da equipe).
  team: [string, string, string, string];
};

export const LightPalette: ThemePalette = {
  primary: '#3B82F6',
  secondary: '#8E44AD',
  terciary: '#F67E3B',
  warning: '#F5A623',
  error: '#C0392B',
  confirm: '#228B22',
  disabled: '#F6F6F6',
  disabled2: '#AABBD5',
  disabled3: '#F4F4F4',
  selected: '#E4EEFF',
  buttons: {
    active: '#1E6FE0',
    inactive: '#E3E3E3',
  },
  fonts: {
    dark: '#3E3E3E',
    light: '#FFFFFF',
    inactive: '#6F6F6F',
    inactive2: '#C7C7CC',
    link: '#1565C5',
  },
  icons: {
    dark: '#3E3E3E',
    light: '#FFFFFF',
    inactive: '#8E8E93',
    inactive2: '#C7C7CC',
  },
  border: '#CBE0FE',
  borderCard: '#A9CCFC',
  backgroundColor: '#FFFFFF',
  backgroundColor2: '#F2F2F7',
  backgroundColor3: '#F6F6F6',
  backgroundColor4: '#F7FAFF',
  overlays: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    strongBackdrop: 'rgba(0, 0, 0, 0.65)',
  },
  gradients: {
    auth: ['#3B82F6', '#234C90'],
    drawerHeader: ['#3B82F6', '#234C90'],
    dashboard: ['#3B82F6', '#234C90'],
  },
  shadows: {
    100: {
      shadowColor: '#C0C0C0',
      elevation: 1,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    200: {
      shadowColor: '#808080',
      elevation: 2,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    300: {
      shadowColor: '#808080',
      elevation: 3,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
  },
  plans: {
    avaliacao: { accent: '#3B82F6', text: '#1E6FE0' },
    starter: { accent: '#5B5CE6', text: '#4F46E5' },
    essencial: { accent: '#27A744', text: '#1E7E34' },
    crescimento: { accent: '#FF7A30', text: '#C2410C' },
  },
  team: ['#5B6CF5', '#00B8A9', '#F5A623', '#EC6B8E'],
};

export const DarkPalette: ThemePalette = {
  primary: '#3B82F6',
  secondary: '#8E44AD',
  terciary: '#F67E3B',
  warning: '#F5A623',
  error: '#E74C3C',
  confirm: '#228B22',
  disabled: '#1E1E1E',
  disabled2: '#4D5661',
  disabled3: '#181818',
  selected: '#1C2B42',
  buttons: {
    active: '#3B82F6',
    inactive: '#2B2B2B',
  },
  fonts: {
    dark: '#F2F2F7',
    light: '#FFFFFF',
    inactive: '#A9A9B2',
    inactive2: '#73737A',
    link: '#6FB0FF',
  },
  icons: {
    dark: '#F2F2F7',
    light: '#FFFFFF',
    inactive: '#A9A9B2',
    inactive2: '#73737A',
  },
  border: '#1E3A5F',
  borderCard: '#274972',
  backgroundColor: '#121212',
  backgroundColor2: '#1A1A1A',
  backgroundColor3: '#202020',
  backgroundColor4: '#171A20',
  overlays: {
    backdrop: 'rgba(0, 0, 0, 0.7)',
    strongBackdrop: 'rgba(0, 0, 0, 0.82)',
  },
  gradients: {
    auth: ['#17345F', '#0E1D3C'],
    drawerHeader: ['#17345F', '#0E1D3C'],
    dashboard: ['#17345F', '#0E1D3C'],
  },
  shadows: {
    100: {
      shadowColor: '#000000',
      elevation: 1,
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
    },
    200: {
      shadowColor: '#000000',
      elevation: 2,
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.28,
      shadowRadius: 2,
    },
    300: {
      shadowColor: '#000000',
      elevation: 3,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.32,
      shadowRadius: 3,
    },
  },
  plans: {
    avaliacao: { accent: '#3B82F6', text: '#60A5FA' },
    starter: { accent: '#5B5CE6', text: '#86A8FF' },
    essencial: { accent: '#27A744', text: '#34D399' },
    crescimento: { accent: '#FF7A30', text: '#FF7A30' },
  },
  team: ['#7C8AFA', '#2DD4C4', '#F6B93B', '#F28AAA'],
};

export function getPaletteForMode(mode: ThemeMode): ThemePalette {
  return mode === 'dark' ? DarkPalette : LightPalette;
}

// Compatibilidade gradual com código legado (light como fallback estático).
export const Pallete = LightPalette;
