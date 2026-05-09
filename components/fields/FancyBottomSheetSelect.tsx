import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Modal,
    ScrollView,
    StyleProp,
    ViewStyle,
    TextInputProps,
    Animated,
    Dimensions,
    PanResponder,
    InteractionManager,
    Platform,
} from 'react-native';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import FancyText from '../FancyText';
import { ThemePalette } from '../../constants/colors';
import {
    BOLD_FONT,
    ITALIC_MEDIUM_FONT,
    MEDIUM_FONT,
    SMALL_SIZE_FONT,
} from '../../constants/font';
import DefaultIcons from '../FancyIcons';
import { DropDownItemProps } from './FancyDropDownItem';
import { FancyTextInputProps } from './FancyTextInput';
import { ColorUtils } from '../../utils/color_utils';
import FancyImage from '../images/FancyImage';
import { ImageUtils } from '../../utils/image_utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FancySeparator from '../FancySeparator';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION = {
  openDuration: 70,
  closeDuration: 50,
};
const SHEET_TRANSLATE_Y = 32;

export interface FancyBottomSheetSelectProps<T>
  extends
    Pick<FancyTextInputProps, 'disabled' | 'label' | 'placeholder'>,
    Pick<TextInputProps, 'onBlur'> {
  listItems: DropDownItemProps<T>[] | undefined;
  containerStyle?: StyleProp<ViewStyle>;
  value?: T;
  onChange?: (value: T) => void;
  isLoading?: boolean;
  title?: string;
}

export interface FancyBottomSheetSelectRef {
  open: () => void;
  close: () => void;
}

function FancyBottomSheetSelectInner<ValueItem>(
  {
    listItems,
    placeholder = 'Selecione...',
    isLoading,
    disabled,
    label,
    value,
    onChange,
    containerStyle,
    title,
  }: FancyBottomSheetSelectProps<ValueItem>,
  ref: React.Ref<FancyBottomSheetSelectRef>,
) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const [isVisible, setIsVisible] = useState(false);
  const [tempValue, setTempValue] = useState<ValueItem | undefined>(value);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const closeTask = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(
    null,
  );
  const insets = useSafeAreaInsets();

  const isDark = palette.backgroundColor === '#121212';
  // Backdrop com mais opacidade no Android pois o blur lá é menos efetivo
  const reliableBackdropColor = isDark
    ? ColorUtils.withAlpha('#000000', Platform.OS === 'ios' ? 0.55 : 0.78)
    : ColorUtils.withAlpha('#020617', Platform.OS === 'ios' ? 0.45 : 0.68);
  const activeColor = isDark
    ? ColorUtils.withAlpha(palette.primary, 0.18)
    : ColorUtils.lightenColor(palette.primary, 0.85);
  const selectedItem = listItems?.find((item) => item.value === value);
  const innerDisabled = disabled || isLoading || listItems?.length === 0;

  // Calcula altura baseado no número de itens (mostra todos sem rolagem)
  const itemHeight = 58; // altura do item + separador
  const handleHeight = 24; // handle container
  const headerHeight = 60; // header com botões
  const paddingBottom = insets.bottom + 16;
  const paddingTop = 16; // padding do content
  const numItems = listItems?.length ?? 0;
  const sheetHeight = Math.min(
    handleHeight + headerHeight + paddingTop + numItems * itemHeight + paddingBottom,
    SCREEN_HEIGHT * 0.9, // max 90% da tela
  );

  const handleOpen = useCallback(() => {
    closeTask.current?.cancel();
    slideAnim.setValue(SHEET_TRANSLATE_Y);
    dragY.setValue(0);
    backdropAnim.setValue(0);
    setTempValue(value);
    setIsVisible(true);
  }, [value, slideAnim, backdropAnim, dragY]);

  useEffect(() => {
    return () => {
      closeTask.current?.cancel();
    };
  }, []);

  const handleClose = useCallback(() => {
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
      dragY.setValue(0);
      setIsVisible(false);
      setTempValue(undefined);
    });
  }, [backdropAnim, dragY, slideAnim]);

  const scheduleClose = useCallback(() => {
    closeTask.current?.cancel();
    closeTask.current = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        handleClose();
      });
    });
  }, [handleClose]);

  useEffect(() => {
    if (!isVisible) return;
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
  }, [isVisible, backdropAnim, slideAnim]);

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  const handleSelect = useCallback(
    (item: DropDownItemProps<ValueItem>) => {
      const newValue = item.value;
      setTempValue(newValue);
      onChange?.(newValue);
      scheduleClose();
    },
    [onChange, scheduleClose],
  );

  const handleConfirm = useCallback(() => {
    if (tempValue !== undefined) {
      onChange?.(tempValue);
    }
    scheduleClose();
  }, [tempValue, onChange, scheduleClose]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          dragY.setValue(0);
        }
      },
    }),
  ).current;

  const renderItem = useCallback(
    ({ item, index }: { item: DropDownItemProps<ValueItem>; index: number }) => {
      const isSelected = item.value === tempValue;
      return (
        <TouchableOpacity
          style={[
            styles.listItem,
            isSelected && { backgroundColor: activeColor },
          ]}
          activeOpacity={0.7}
          onPress={() => handleSelect(item)}
        >
          {item.left && item.left.type === 'image' && item.left.source && (
            <FancyImage
              size={32}
              source={
                ImageUtils.normalizeImageSource(item.left?.source) ??
                (typeof item.left?.source === 'string'
                  ? { uri: item.left?.source }
                  : item.left?.source)
              }
            />
          )}
          <FancyText
            style={[
              styles.itemText,
              isSelected && { color: palette.primary, fontFamily: BOLD_FONT },
            ]}
          >
            {item.title}
          </FancyText>
          {isSelected && (
            <View style={styles.checkContainer}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='check'
                size={20}
                color={palette.primary}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [tempValue, handleSelect, activeColor],
  );

  const sheetContent = useMemo(() => (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 28 : 60}
              tint={isDark ? 'dark' : 'default'}
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : 'none'}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: reliableBackdropColor }]} />
          </Animated.View>
        </TouchableOpacity>

        {/* Sheet container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              height: sheetHeight,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: Animated.add(slideAnim, dragY) }],
            },
          ]}
        >
          {/* Handle - área arrastável */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} {...panResponder.panHandlers} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
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
              {title ?? label ?? 'Selecione'}
            </FancyText>

            <View style={{ width: 34 }} />
          </View>

          {/* List */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
          >
            {listItems?.map((item, index) => (
              <View key={String(item.value ?? index)}>
                {renderItem({ item, index })}
                {index < listItems.length - 1 && (
                  <FancySeparator style={{ marginTop: 8, marginBottom: 8 }} />
                )}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  ), [
    backdropAnim,
    dragY,
    handleClose,
    insets.bottom,
    isDark,
    label,
    listItems,
    palette,
    panResponder,
    renderItem,
    reliableBackdropColor,
    sheetHeight,
    slideAnim,
    styles,
    title,
  ]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <FancyText size={'extraSmall'} type='semiBold' color={palette.fonts.inactive}>
          {label}
        </FancyText>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.inputContainer,
          innerDisabled && styles.inputDisabled,
          pressed && !innerDisabled && { borderColor: palette.primary },
        ]}
        onPress={() => !innerDisabled && handleOpen()}
        disabled={innerDisabled}
      >
        <FancyText
          style={selectedItem ? styles.selectedText : styles.placeholder}
          color={disabled ? palette.fonts.inactive : palette.fonts.dark}
          numberOfLines={1}
        >
          {selectedItem?.title ?? placeholder}
        </FancyText>
        <View style={styles.iconContainer}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='chevron-down'
            size={22}
            style={{ marginTop: 2 }}
            color={innerDisabled ? palette.fonts.inactive2 : palette.icons.inactive}
          />
        </View>
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType='none'
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        {sheetContent}
      </Modal>
    </View>
  );
}

const FancyBottomSheetSelect = forwardRef(FancyBottomSheetSelectInner) as <T>(
  props: FancyBottomSheetSelectProps<T> & { ref?: React.Ref<FancyBottomSheetSelectRef> },
) => React.ReactElement;

export default FancyBottomSheetSelect;

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { gap: 6 },
    inputContainer: {
      backgroundColor: palette.backgroundColor,
      borderWidth: 0.6,
      borderColor: palette.border,
      borderRadius: 12,
      height: 44,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...palette.shadows[200],
    },
    inputDisabled: {
      backgroundColor: palette.disabled,
      borderColor: palette.border,
    },
    iconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholder: {
      fontFamily: ITALIC_MEDIUM_FONT,
      fontSize: SMALL_SIZE_FONT,
      color: palette.fonts.inactive,
      flex: 1,
    },
    selectedText: {
      fontFamily: MEDIUM_FONT,
      fontSize: SMALL_SIZE_FONT,
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdropTouchable: {
      ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
      flex: 1,
    },
    sheetContainer: {
      backgroundColor: palette.backgroundColor,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      ...palette.shadows[300],
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.border,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: ColorUtils.lightenColor(palette.border, 0.5),
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
    list: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 16,
    },
    listContent: {
      paddingHorizontal: 0,
      paddingTop: 16,
      paddingBottom: 24,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
      borderRadius: 12,
    },
    itemText: {
      fontFamily: MEDIUM_FONT,
      fontSize: SMALL_SIZE_FONT,
      color: palette.fonts.dark,
      flex: 1,
    },
    checkContainer: {
      width: 24,
      alignItems: 'center',
    },
  });
}
