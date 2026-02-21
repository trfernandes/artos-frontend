import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_TOP_INSET_REDUCTION = 2;

export function useTopSafeInset(reduction: number = DEFAULT_TOP_INSET_REDUCTION): number {
  const insets = useSafeAreaInsets();
  const normalizedReduction = Math.max(0, reduction);

  if (Platform.OS === 'android') {
    const androidStatusBarHeight = RNStatusBar.currentHeight ?? 0;
    const rawInset = Math.max(insets.top, androidStatusBarHeight);
    return Math.max(0, rawInset - normalizedReduction);
  }

  return Math.max(0, insets.top - normalizedReduction);
}
