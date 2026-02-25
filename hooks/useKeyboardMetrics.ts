import { Keyboard, KeyboardEvent, KeyboardEventName, Platform } from 'react-native';
import { useEffect, useMemo, useState } from 'react';

export type KeyboardMetrics = {
  visible: boolean;
  height: number;
  platformInset: number;
};

export function useKeyboardMetrics(): KeyboardMetrics {
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent: KeyboardEventName =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent: KeyboardEventName =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      setVisible(true);
      setHeight(event.endCoordinates?.height ?? 0);
    };

    const onHide = () => {
      setVisible(false);
      setHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, onShow);
    const hideSubscription = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const platformInset = useMemo(() => (Platform.OS === 'ios' ? height : 0), [height]);

  return { visible, height, platformInset };
}

export default useKeyboardMetrics;
