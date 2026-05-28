import { Platform } from 'react-native';
import { useMemo } from 'react';
import { useKeyboardState } from 'react-native-keyboard-controller';

export type KeyboardMetrics = {
  visible: boolean;
  height: number;
  platformInset: number;
};

/**
 * Fonte única de verdade para estado do teclado em todo o app.
 * Implementado sobre react-native-keyboard-controller (lib mantida pela Wix,
 * baseada em Reanimated 3, com paridade iOS/Android).
 *
 * Não usar Keyboard.addListener direto — sempre este hook.
 */
export function useKeyboardMetrics(): KeyboardMetrics {
  const { isVisible, height } = useKeyboardState();

  const platformInset = useMemo(
    () => (Platform.OS === 'ios' ? height : 0),
    [height],
  );

  return { visible: isVisible, height, platformInset };
}

export default useKeyboardMetrics;
