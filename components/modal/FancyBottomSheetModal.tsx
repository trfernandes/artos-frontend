import { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { ColorUtils } from '../../utils/color_utils';
import { usePallete } from '../../hooks/usePallete';
import { useKeyboardMetrics } from '../../hooks/useKeyboardMetrics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION_DURATION = 180;
const SHEET_TRANSLATE_Y = 32;

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  avoidKeyboard?: boolean;
  keyboardExtraOffset?: number;
  closeDisabled?: boolean;
};

export default function FancyBottomSheetModal({
  visible,
  onClose,
  title,
  children,
  footer,
  avoidKeyboard = true,
  keyboardExtraOffset = 10,
  closeDisabled = false,
}: Props) {
  const palette = usePallete();
  const isDark = palette.backgroundColor === '#121212';
  // Backdrop com mais opacidade no Android pois o blur lá é menos efetivo
  const reliableBackdropColor = isDark
    ? ColorUtils.withAlpha('#000000', Platform.OS === 'ios' ? 0.5 : 0.65)
    : ColorUtils.withAlpha('#020617', Platform.OS === 'ios' ? 0.4 : 0.55);
  const insets = useSafeAreaInsets();
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_TRANSLATE_Y)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  // Altura do teclado via react-native-keyboard-controller (fonte única do app).
  // O Keyboard.addListener nativo não dispara dentro de um <Modal> no Android,
  // por isso o sheet não subia acima do teclado nesse caso.
  const { height: keyboardHeight } = useKeyboardMetrics();
  // No iOS a altura reportada inclui a safe area inferior (já aplicada como
  // padding do sheet), então descontamos insets.bottom para não subir demais.
  // No Android o keyboard-controller mede a altura acima da barra de navegação,
  // então NÃO descontamos — descontar deixava o footer atrás do teclado.
  const keyboardOffset =
    avoidKeyboard && visible && keyboardHeight > 0
      ? Math.max(
          0,
          keyboardHeight - (Platform.OS === 'ios' ? insets.bottom : 0) + keyboardExtraOffset,
        )
      : 0;
  const sheetMaxHeight =
    keyboardOffset > 0
      ? Math.max(180, SCREEN_HEIGHT * 0.88 - keyboardOffset)
      : SCREEN_HEIGHT * 0.88;
  const sheetBottomPadding = keyboardOffset > 0 ? 6 : insets.bottom + 16;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      sheetTranslateY.setValue(SHEET_TRANSLATE_Y);
      dragY.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    if (closeDisabled) return;

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_TRANSLATE_Y,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [backdropAnim, closeDisabled, onClose, sheetTranslateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) handleClose();
        else dragY.setValue(0);
      },
    }),
  ).current;

  const sheetContent = useMemo(
    () => (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Backdrop */}
          <Animated.View
            style={[StyleSheet.absoluteFillObject, { opacity: backdropAnim }]}
            pointerEvents='none'
          >
            <BlurView
              style={StyleSheet.absoluteFillObject}
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={Platform.OS === 'ios' ? 10 : 8}
              reducedTransparencyFallbackColor={isDark ? '#000000' : '#f8fafc'}
            />
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: reliableBackdropColor }]}
            />
          </Animated.View>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />

          {/* Shadow gradient above sheet */}
          <Animated.View
            style={[
              styles.topShadowWrap,
              {
                opacity: backdropAnim,
                transform: [{ translateY: Animated.add(sheetTranslateY, dragY) }],
              },
            ]}
            pointerEvents='none'
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.18)']}
              locations={[0, 0.55, 1]}
              style={styles.topShadow}
            />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.sheet,
              {
                maxHeight: sheetMaxHeight,
                marginBottom: keyboardOffset,
                paddingBottom: sheetBottomPadding,
                backgroundColor: palette.backgroundColor,
                transform: [{ translateY: Animated.add(sheetTranslateY, dragY) }],
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={[styles.handle, { backgroundColor: palette.border }]} />
            </View>

            {/* Header */}
            <View
              style={[
                styles.header,
                { borderBottomColor: ColorUtils.lightenColor(palette.border, 0.5) },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14) },
                ]}
                onPress={handleClose}
                disabled={closeDisabled}
              >
                <DefaultIcons.Custom
                  library='Feather'
                  name='x'
                  size={20}
                  color={palette.fonts.dark}
                />
              </TouchableOpacity>
              <FancyText
                type='bold'
                size='medium'
                color={palette.fonts.dark}
                style={styles.headerTitle}
              >
                {title}
              </FancyText>
              <View style={{ width: 34 }} />
            </View>

            {/* Body */}
            <ScrollView
              style={{ flexShrink: 1, width: '100%' }}
              contentContainerStyle={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              keyboardDismissMode='interactive'
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            >
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    ),
    [
      backdropAnim,
      children,
      closeDisabled,
      dragY,
      footer,
      handleClose,
      insets.bottom,
      keyboardOffset,
      isDark,
      palette,
      panResponder,
      reliableBackdropColor,
      sheetBottomPadding,
      sheetMaxHeight,
      sheetTranslateY,
      title,
    ],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType='none'
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {sheetContent}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  topShadowWrap: {
    marginBottom: -28,
    zIndex: 0,
  },
  topShadow: {
    height: 56,
  },
  sheet: {
    zIndex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    gap: 22,
  },
  footer: {
    paddingHorizontal: 25,
    paddingTop: 4,
  },
});
