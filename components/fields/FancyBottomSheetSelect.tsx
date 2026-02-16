import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Modal,
    StyleProp,
    ViewStyle,
    TextInputProps,
    Animated,
    Dimensions,
    PanResponder,
    InteractionManager,
} from 'react-native';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION = {
  openDuration: 70,
  closeDuration: 50,
};

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
  const [isVisible, setIsVisible] = useState(false);
  const [tempValue, setTempValue] = useState<ValueItem | undefined>(value);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const closeTask = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(
    null,
  );
  const insets = useSafeAreaInsets();

  const activeColor = ColorUtils.lightenColor(Pallete.primary, 0.85);
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
    slideAnim.setValue(0);
    dragY.setValue(0);
    sheetOpacity.setValue(0);
    backdropAnim.setValue(0);
    setTempValue(value);
    setIsVisible(true);
  }, [value, slideAnim, backdropAnim, dragY, sheetOpacity]);

  useEffect(() => {
    return () => {
      closeTask.current?.cancel();
    };
  }, []);

  const handleClose = useCallback(() => {
    dragY.setValue(0);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: ANIMATION.closeDuration,
        useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: ANIMATION.closeDuration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setTempValue(undefined);
    });
  }, [backdropAnim, dragY, sheetOpacity]);

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
      Animated.timing(sheetOpacity, {
        toValue: 1,
        duration: ANIMATION.openDuration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible, backdropAnim, sheetOpacity]);

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
              isSelected && { color: Pallete.primary, fontFamily: BOLD_FONT },
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
                color={Pallete.primary}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [tempValue, handleSelect, activeColor],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <FancyText size={'extraSmall'} type='semiBold' color={Pallete.fonts.inactive}>
          {label}
        </FancyText>
      )}
      <Pressable
        style={({ pressed }) => [
          styles.inputContainer,
          innerDisabled && styles.inputDisabled,
          pressed && !innerDisabled && { borderColor: Pallete.primary },
        ]}
        onPress={() => !innerDisabled && handleOpen()}
        disabled={innerDisabled}
      >
        <FancyText
          style={selectedItem ? styles.selectedText : styles.placeholder}
          color={disabled ? Pallete.fonts.inactive : Pallete.fonts.dark}
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
            color={innerDisabled ? Pallete.fonts.inactive2 : Pallete.icons.inactive}
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            {/* Backdrop */}
            <TouchableOpacity
              style={styles.backdropTouchable}
              activeOpacity={1}
              onPress={handleClose}
            >
              <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
            </TouchableOpacity>

            {/* Sheet container */}
            <Animated.View
              style={[
                styles.sheetContainer,
                {
                  height: sheetHeight,
                  paddingBottom: insets.bottom + 16,
                  opacity: sheetOpacity,
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
                    color={Pallete.fonts.dark}
                  />
                </TouchableOpacity>

                <FancyText
                  type='bold'
                  size='medium'
                  color={Pallete.fonts.dark}
                  style={styles.headerTitle}
                >
                  {title ?? label ?? 'Selecione'}
                </FancyText>

                <View style={{ width: 34 }} />
              </View>

              {/* List */}
              <View style={styles.list}>
                {listItems?.map((item, index) => (
                  <View key={String(item.value ?? index)}>
                    {renderItem({ item, index })}
                    {index < listItems.length - 1 && (
                      <FancySeparator style={{ marginTop: 8, marginBottom: 8 }} />
                    )}
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

const FancyBottomSheetSelect = forwardRef(FancyBottomSheetSelectInner) as <T>(
  props: FancyBottomSheetSelectProps<T> & { ref?: React.Ref<FancyBottomSheetSelectRef> },
) => React.ReactElement;

export default FancyBottomSheetSelect;

const styles = StyleSheet.create({
  container: { gap: 6 },
  inputContainer: {
    backgroundColor: 'white',
    borderWidth: 0.6,
    borderColor: Pallete.border,
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Pallete.shadows[200],
  },
  inputDisabled: {
    backgroundColor: Pallete.disabled,
    borderColor: Pallete.border,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor: Pallete.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontFamily: ITALIC_MEDIUM_FONT,
    fontSize: SMALL_SIZE_FONT,
    color: Pallete.fonts.inactive,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...Pallete.shadows[300],
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Pallete.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: ColorUtils.lightenColor(Pallete.border, 0.5),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,

    paddingHorizontal: 16,
    // borderWidth:1,
    gap: 12,
    borderRadius: 12,
  },
  itemText: {
    fontFamily: MEDIUM_FONT,
    fontSize: SMALL_SIZE_FONT,
    color: Pallete.fonts.dark,
    flex: 1,
  },
  checkContainer: {
    width: 24,
    alignItems: 'center',
  },
});
