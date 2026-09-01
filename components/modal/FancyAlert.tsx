// components/overlays/FancyAlert.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  isValidElement,
} from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ModalStack } from './GlobalModalHost';

type Button = {
  text: string;
  onPress?: () => void;
  style?: 'cancel' | 'destructive' | 'default';
};

type AlertContextType = {
  show: (
    title: string | React.ReactNode,
    message?: string | React.ReactNode,
    buttons?: Button[],
  ) => void;
};

const AlertCtx = createContext<AlertContextType | null>(null);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION = {
  openDuration: 70,
  closeDuration: 50,
};
const SHEET_TRANSLATE_Y = 32;
const MODAL_STACK_ID = 'fancy-alert';

export function FancyAlertProvider({ children }: { children: ReactNode }) {
  const palette = usePallete();
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | React.ReactNode>();
  const [message, setMessage] = useState<string | React.ReactNode>('');
  const [buttons, setButtons] = useState<Button[]>([]);
  const pendingBtnRef = useRef<Button | undefined>(undefined);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const reliableBackdropColor = isDark
    ? ColorUtils.withAlpha('#000000', Platform.OS === 'ios' ? 0.55 : 0.78)
    : ColorUtils.withAlpha('#020617', Platform.OS === 'ios' ? 0.45 : 0.68);

  const show = (t: string | React.ReactNode, m?: string | React.ReactNode, b?: Button[]) => {
    setTitle(t);
    setMessage(m || '');
    setButtons(b || [{ text: 'OK' }]);
    slideAnim.setValue(SHEET_TRANSLATE_Y);
    backdropAnim.setValue(0);
    setVisible(true);
  };

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: ANIMATION.openDuration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION.openDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdropAnim, slideAnim]);

  const close = useCallback(
    (btn?: Button) => {
      pendingBtnRef.current = btn;
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: ANIMATION.closeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SHEET_TRANSLATE_Y,
          duration: ANIMATION.closeDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        const pending = pendingBtnRef.current;
        pendingBtnRef.current = undefined;
        pending?.onPress?.();
      });
    },
    [backdropAnim, slideAnim],
  );

  const shouldStackButtons = buttons.length > 2;

  const content = (
    <View style={styles.modalContainer}>
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim, backgroundColor: reliableBackdropColor }]}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 28 : 25}
          tint='dark'
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheetContainer,
          { backgroundColor: palette.backgroundColor },
          palette.shadows[300],
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: palette.border }]} />
        </View>

        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          {title ? (
            isValidElement(title) ? (
              title
            ) : (
              <FancyText type='bold' size='large' style={styles.title}>
                {title}
              </FancyText>
            )
          ) : null}
          {message ? (
            isValidElement(message) ? (
              message
            ) : (
              <FancyText type='medium' size='medium' style={styles.message}>
                {message}
              </FancyText>
            )
          ) : null}

          <View style={[styles.row, shouldStackButtons && styles.rowStacked]}>
            {buttons.map((btn, i) => (
              <FancyButton
                key={i}
                label={btn.text}
                onPress={() => close(btn)}
                textProps={{
                  adjustsFontSizeToFit: !shouldStackButtons,
                  numberOfLines: shouldStackButtons ? 2 : 1,
                }}
                containerStyle={[
                  styles.button,
                  shouldStackButtons && styles.buttonStacked,
                  btn.style === 'destructive' ? { backgroundColor: palette.error } : {},
                ]}
                type={
                  btn.style === 'cancel'
                    ? 'text'
                    : btn.style === 'default'
                      ? 'outlined'
                      : 'contained'
                }
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );

  useEffect(() => {
    if (visible) {
      ModalStack.push(MODAL_STACK_ID, content, () => close());
    } else {
      ModalStack.pop(MODAL_STACK_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible) ModalStack.update(MODAL_STACK_ID, content);
  });

  useEffect(() => () => ModalStack.pop(MODAL_STACK_ID), []);

  return <AlertCtx.Provider value={{ show }}>{children}</AlertCtx.Provider>;
}

// 🔗 hook opcional (não é usado na API estática, mas fica disponível se quiser)
export function useFancyAlert() {
  const ctx = useContext(AlertCtx);
  if (!ctx) throw new Error('useFancyAlert deve estar dentro do FancyAlertProvider');
  return ctx;
}

export const FancyAlert = {
  alert(title: string | React.ReactNode, message?: string | React.ReactNode, buttons?: Button[]) {
    globalShow?.(title, message, buttons);
  },
};

let globalShow: AlertContextType['show'] | null = null;

// Conector invisível para expor o show globalmente
export function FancyAlertConnector() {
  const { show } = useFancyAlert();
  globalShow = show;
  return null;
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 22,
  },
  title: { marginBottom: 10 },
  message: { marginBottom: 20, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  rowStacked: { flexDirection: 'column' },
  button: { flex: 1, height: 44 },
  buttonStacked: { flex: 0, width: '100%', minHeight: 44, height: 44 },
});
