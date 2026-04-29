import { useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { ColorUtils } from '../../utils/color_utils';
import { usePallete } from '../../hooks/usePallete';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION_DURATION = 180;

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  avoidKeyboard?: boolean;
  keyboardExtraOffset?: number;
};

export default function FancyBottomSheetModal({
  visible,
  onClose,
  title,
  children,
  footer,
  avoidKeyboard = true,
  keyboardExtraOffset = 10,
}: Props) {
  const palette = usePallete();
  const insets = useSafeAreaInsets();
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardOffset = avoidKeyboard && visible && keyboardHeight > 0
    ? Math.max(0, keyboardHeight - insets.bottom + keyboardExtraOffset)
    : 0;
  const sheetMaxHeight = keyboardOffset > 0
    ? Math.max(180, SCREEN_HEIGHT * 0.88 - keyboardOffset)
    : SCREEN_HEIGHT * 0.88;
  const sheetBottomPadding = keyboardOffset > 0 ? 16 : insets.bottom + 16;

  useEffect(() => {
    if (visible) {
      backdropAnim.setValue(0);
      sheetOpacity.setValue(0);
      dragY.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(sheetOpacity, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !avoidKeyboard) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [avoidKeyboard, visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }),
      Animated.timing(sheetOpacity, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [onClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,
      onPanResponderMove: (_, g) => { if (g.dy > 0) dragY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) handleClose();
        else dragY.setValue(0);
      },
    }),
  ).current;

  return (
    <Modal visible={visible} transparent animationType='none' onRequestClose={handleClose} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Backdrop */}
          <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={handleClose}>
            <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
          </TouchableOpacity>

          {/* Shadow gradient above sheet */}
          <Animated.View
            style={[styles.topShadowWrap, { opacity: sheetOpacity, transform: [{ translateY: dragY }] }]}
            pointerEvents='none'
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.18)']}
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
                opacity: sheetOpacity,
                backgroundColor: palette.backgroundColor,
                transform: [{ translateY: dragY }],
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={[styles.handle, { backgroundColor: palette.border }]} />
            </View>

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: ColorUtils.lightenColor(palette.border, 0.5) }]}>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14) }]}
                onPress={handleClose}
              >
                <DefaultIcons.Custom library='Feather' name='x' size={20} color={palette.fonts.dark} />
              </TouchableOpacity>
              <FancyText type='bold' size='medium' color={palette.fonts.dark} style={styles.headerTitle}>
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topShadowWrap: {
    marginBottom: -1,
    zIndex: 1,
  },
  topShadow: {
    height: 28,
  },
  sheet: {
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
    paddingTop: 8,
  },
});
