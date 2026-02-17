import { useMemo } from 'react';
import { ThemePalette } from '../constants/colors';
import { usePallete } from './usePallete';

export function useThemedStyles<T>(
  styleFactory: (palette: ThemePalette) => T,
  deps: ReadonlyArray<unknown> = [],
): T {
  const palette = usePallete();

  return useMemo(() => styleFactory(palette), [palette, ...deps]);
}
