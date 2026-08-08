import { ThemePalette } from '../constants/colors';
import { useAppTheme } from './useAppTheme';

export function usePallete(): ThemePalette {
  const { palette } = useAppTheme();
  return palette;
}
