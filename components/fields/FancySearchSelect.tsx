import {
    useState,
    useCallback,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useMemo,
} from 'react';
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
    TouchableOpacity,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import { BOLD_FONT, ITALIC_MEDIUM_FONT, MEDIUM_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import DefaultIcons from '../FancyIcons';
import { DropDownItemProps } from './FancyDropDownItem';
import { FancyTextInputProps } from './FancyTextInput';
import { ColorUtils } from '../../utils/color_utils';
import FancyImage from '../images/FancyImage';
import { ImageUtils } from '../../utils/image_utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FancySearchBar from '../FancySearchBar';
import FancySeparator from '../FancySeparator';
import FancyCheckbox from '../FancyCheckbox';
import FancyList from '../list/FancyList';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION = {
  openDuration: 70,
  closeDuration: 50,
};

export interface FancySearchSelectProps<T>
  extends
    Pick<FancyTextInputProps, 'disabled' | 'label' | 'placeholder'>,
    Pick<TextInputProps, 'onBlur'> {
  listItems: DropDownItemProps<T>[] | undefined;
  containerStyle?: StyleProp<ViewStyle>;
  value?: T | T[];
  onChange?: (value: T | T[]) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  title?: string;
  emptyMessage?: string;
  multiSelect?: boolean;
}

export interface FancySearchSelectRef {
  open: () => void;
  close: () => void;
}

function FancySearchSelectInner<ValueItem>(
  {
    listItems,
    placeholder = 'Selecione...',
    isLoading,
    disabled,
    label,
    value,
    onChange,
    containerStyle,
    searchPlaceholder = 'Buscar...',
    title,
    emptyMessage = 'Nenhum item encontrado',
    multiSelect = false,
  }: FancySearchSelectProps<ValueItem>,
  ref: React.Ref<FancySearchSelectRef>,
) {
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [tempValue, setTempValue] = useState<ValueItem | ValueItem[] | undefined>(value);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const closeTask = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(
    null,
  );
  const insets = useSafeAreaInsets();

  const activeColor = ColorUtils.lightenColor(Pallete.primary, 0.85);
  const selectedItem = multiSelect ? undefined : listItems?.find((item) => item.value === value);
  const selectedCount = multiSelect && Array.isArray(value) ? value.length : 0;
  const innerDisabled = disabled || isLoading || listItems?.length === 0;

  const filteredItems = useMemo(() => {
    if (!search.trim()) return listItems ?? [];
    const searchLower = search.toLowerCase().trim();
    return (listItems ?? []).filter((item) => item.title.toLowerCase().includes(searchLower));
  }, [listItems, search]);

  const handleOpen = useCallback(() => {
    closeTask.current?.cancel();
    slideAnim.setValue(0);
    dragY.setValue(0);
    sheetOpacity.setValue(0);
    backdropAnim.setValue(0);
    if (multiSelect) {
      setTempValue(value ?? []);
    } else {
      setTempValue(value as ValueItem | undefined);
    }
    setSearch('');
    setIsVisible(true);
  }, [value, multiSelect, slideAnim, backdropAnim, dragY, sheetOpacity]);

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
      setSearch('');
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
      if (multiSelect) {
        setTempValue((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          const exists = prevArray.some((v) => v === item.value);
          if (exists) {
            return prevArray.filter((v) => v !== item.value);
          } else {
            return [...prevArray, item.value];
          }
        });
      } else {
        setTempValue(item.value);
        onChange?.(item.value as ValueItem | ValueItem[]);
        scheduleClose();
      }
    },
    [multiSelect, onChange, scheduleClose],
  );

  const handleConfirm = useCallback(() => {
    if (multiSelect) {
      const arrayValue = Array.isArray(tempValue) ? tempValue : [];
      onChange?.(arrayValue as ValueItem | ValueItem[]);
    } else {
      if (tempValue !== undefined && !Array.isArray(tempValue)) {
        onChange?.(tempValue as ValueItem | ValueItem[]);
      }
    }
    scheduleClose();
  }, [tempValue, onChange, scheduleClose, multiSelect]);

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

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='magnify-close'
          size={48}
          color={Pallete.fonts.inactive}
        />
        <FancyText color={Pallete.fonts.inactive} style={{ textAlign: 'center' }}>
          {emptyMessage}
        </FancyText>
      </View>
    ),
    [emptyMessage],
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
          style={selectedItem || selectedCount > 0 ? styles.selectedText : styles.placeholder}
          color={disabled ? Pallete.fonts.inactive : Pallete.fonts.dark}
          numberOfLines={1}
        >
          {multiSelect
            ? selectedCount > 0
              ? `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`
              : placeholder
            : (selectedItem?.title ?? placeholder)}
        </FancyText>
        <View style={styles.iconContainer}>
          <DefaultIcons.Custom
            library='Feather'
            name='search'
            size={16}
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
                  paddingTop: insets.top,
                  paddingBottom: insets.bottom,
                  opacity: sheetOpacity,
                  transform: [{ translateY: Animated.add(slideAnim, dragY) }],
                },
              ]}
            >
              <View style={styles.handleContainer}>
                <View style={styles.handle} {...panResponder.panHandlers} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <DefaultIcons.Custom
                      library='Feather'
                      name='x'
                      size={18}
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

                  {multiSelect ? (
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        Array.isArray(tempValue) &&
                          tempValue.length === 0 &&
                          styles.confirmButtonDisabled,
                      ]}
                      onPress={handleConfirm}
                      activeOpacity={0.7}
                      disabled={Array.isArray(tempValue) && tempValue.length === 0}
                    >
                      <DefaultIcons.Custom
                        library='Feather'
                        name='check'
                        size={18}
                        color={
                          Array.isArray(tempValue) && tempValue.length > 0
                            ? Pallete.fonts.dark
                            : Pallete.fonts.inactive
                        }
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 34 }} />
                  )}
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <FancySearchBar value={search} onSearch={setSearch} />
                </View>
              </View>

              {/* List */}
              <View style={styles.list}>
                <FancyList
                  data={filteredItems}
                  extraData={tempValue}
                  renderItem={({ item }: { item: DropDownItemProps<ValueItem> }) => {
                    const isSelected = multiSelect
                      ? Array.isArray(tempValue) && tempValue.some((v) => v === item.value)
                      : item.value === tempValue;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          !multiSelect && isSelected && { backgroundColor: activeColor },
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
                        {multiSelect ? (
                          <View pointerEvents='none'>
                            <FancyCheckbox value={isSelected} size={22} iconSize={12} />
                          </View>
                        ) : (
                          isSelected && (
                            <View style={styles.checkContainer}>
                              <DefaultIcons.Custom
                                library='MaterialCommunityIcons'
                                name='check'
                                size={20}
                                color={Pallete.primary}
                              />
                            </View>
                          )
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  ItemSeparatorComponent={() => <FancySeparator style={{ marginTop: 8 }} />}
                  keyExtractor={(item: DropDownItemProps<ValueItem>, index: number) =>
                    String(item.value ?? index)
                  }
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'
                  ListEmptyComponent={ListEmptyComponent}
                />
              </View>
            </Animated.View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

const FancySearchSelect = forwardRef(FancySearchSelectInner) as <T>(
  props: FancySearchSelectProps<T> & { ref?: React.Ref<FancySearchSelectRef> },
) => React.ReactElement;

export default FancySearchSelect;

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
    // backgroundColor: ColorUtils.lightenColor(Pallete.primary, 0.9),
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
    backgroundColor: 'transparent',
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: Pallete.backgroundColor,
    marginTop: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Pallete.shadows[300],
  },
  handleContainer: {
    alignItems: 'center',
    paddingBottom: 6,
    backgroundColor: 'white',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Pallete.border,
  },
  header: {
    paddingHorizontal: 16,
    // paddingVertical: 8,
    paddingTop: 5,
    gap: 20,
    paddingBottom: 5,
    // borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
    // ...Pallete.shadows[200],
    // marginBottom: 5,
    backgroundColor: 'white',
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
  searchContainer: {
    backgroundColor: 'white',
    borderBottomColor: ColorUtils.lightenColor(Pallete.border, 0.5),
  },
  list: {
    // borderWidth: 1,
    flex: 1,
    backgroundColor: Pallete.backgroundColor,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
});
