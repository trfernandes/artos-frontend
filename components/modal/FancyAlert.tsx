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
import { Modal, View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import FancyButton from '../buttons/FancyButton';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { useAppTheme } from '../../hooks/useAppTheme';

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

export function FancyAlertProvider({ children }: { children: ReactNode }) {
  const palette = usePallete();
  const { isDark } = useAppTheme();
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
        // iOS: dispara onPress no onDismiss real do <Modal> nativo, não aqui
        // (Android não tem onDismiss no Modal, então dispara direto).
        if (Platform.OS !== 'ios') {
          const pending = pendingBtnRef.current;
          pendingBtnRef.current = undefined;
          pending?.onPress?.();
        }
      });
    },
    [backdropAnim, slideAnim],
  );

  const handleDismiss = useCallback(() => {
    const pending = pendingBtnRef.current;
    pendingBtnRef.current = undefined;
    pending?.onPress?.();
  }, []);

  const shouldStackButtons = buttons.length > 2;

  return (
    <AlertCtx.Provider value={{ show }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType='none'
        statusBarTranslucent
        onRequestClose={() => close()}
        onDismiss={Platform.OS === 'ios' ? handleDismiss : undefined}
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropAnim, backgroundColor: reliableBackdropColor }]}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 28 : 60}
              tint={isDark ? 'dark' : 'default'}
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

            <View style={styles.content}>
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
      </Modal>
    </AlertCtx.Provider>
  );
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
    paddingBottom: 32,
  },
  title: { marginBottom: 10 },
  message: { marginBottom: 20, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  rowStacked: { flexDirection: 'column' },
  button: { flex: 1, height: 44 },
  buttonStacked: { flex: 0, width: '100%', minHeight: 44, height: 44 },
});
