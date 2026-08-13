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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import FancyText, { FancyTextProps } from '../FancyText';
import { ThemePalette } from '../../constants/colors';
import {
  BOLD_FONT,
  EXTRA_SMALL_SIZE_FONT,
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
import FancySearchBar from '../FancySearchBar';
import FancySeparator from '../FancySeparator';
import FancyCheckbox from '../FancyCheckbox';
import FancyList from '../list/FancyList';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAppTheme } from '../../hooks/useAppTheme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ANIMATION = {
  openDuration: 70,
  closeDuration: 50,
};
const SHEET_TRANSLATE_Y = 32;

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
  loadingMessage?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  multiSelect?: boolean;
  /** Override do label (cor/estilo) — para superfícies escuras/gradiente. */
  labelProps?: FancyTextProps;
  /** Chamado quando o Modal nativo termina de fechar (isVisible vira false). */
  onClosed?: () => void;
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
    loadingMessage = 'Carregando...',
    errorMessage,
    onRetry,
    retryLabel = 'Tentar novamente',
    multiSelect = false,
    labelProps,
    onClosed,
  }: FancySearchSelectProps<ValueItem>,
  ref: React.Ref<FancySearchSelectRef>,
) {
  const palette = usePallete();
  const { isDark } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  // Backdrop com mais opacidade no Android pois o blur lá é menos efetivo
  const reliableBackdropColor = isDark
    ? ColorUtils.withAlpha('#000000', Platform.OS === 'ios' ? 0.55 : 0.78)
    : ColorUtils.withAlpha('#020617', Platform.OS === 'ios' ? 0.45 : 0.68);
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [tempValue, setTempValue] = useState<ValueItem | ValueItem[] | undefined>(value);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const closeTask = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  const insets = useSafeAreaInsets();

  const activeColor = isDark
    ? ColorUtils.withAlpha(palette.primary, 0.22)
    : ColorUtils.lightenColor(palette.primary, 0.85);
  const selectedItem = multiSelect ? undefined : listItems?.find((item) => item.value === value);
  const selectedCount = multiSelect && Array.isArray(value) ? value.length : 0;
  const innerDisabled = disabled;

  const filteredItems = useMemo(() => {
    if (!search.trim()) return listItems ?? [];
    const searchLower = search.toLowerCase().trim();
    return (listItems ?? []).filter((item) => item.title.toLowerCase().includes(searchLower));
  }, [listItems, search]);

  const handleOpen = useCallback(() => {
    closeTask.current?.cancel();
    slideAnim.setValue(SHEET_TRANSLATE_Y);
    dragY.setValue(0);
    backdropAnim.setValue(0);
    if (multiSelect) {
      setTempValue(value ?? []);
    } else {
      setTempValue(value as ValueItem | undefined);
    }
    setSearch('');
    setIsVisible(true);
  }, [value, multiSelect, slideAnim, backdropAnim, dragY]);

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
      setSearch('');
      onClosed?.();
    });
  }, [backdropAnim, dragY, slideAnim, onClosed]);

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

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size='small' color={palette.primary} />
          <FancyText color={palette.fonts.inactive} style={styles.stateText}>
            {loadingMessage}
          </FancyText>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.stateContainer}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='alert-circle-outline'
            size={36}
            color={palette.error}
          />
          <FancyText color={palette.fonts.inactive} style={styles.stateText}>
            {errorMessage}
          </FancyText>
          {onRetry ? (
            <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={onRetry}>
              <FancyText type='semiBold' size='small' color={palette.primary}>
                {retryLabel}
              </FancyText>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='magnify-close'
          size={48}
          color={palette.fonts.inactive}
        />
        <FancyText color={palette.fonts.inactive} style={styles.stateText}>
          {emptyMessage}
        </FancyText>
      </View>
    );
  }, [
    emptyMessage,
    errorMessage,
    isLoading,
    loadingMessage,
    onRetry,
    palette.error,
    palette.fonts.inactive,
    palette.primary,
    retryLabel,
    styles.emptyContainer,
    styles.retryButton,
    styles.stateContainer,
    styles.stateText,
  ]);

  const sheetContent = useMemo(
    () => (
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
              <View
                style={[StyleSheet.absoluteFillObject, { backgroundColor: reliableBackdropColor }]}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Sheet container */}
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
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
                          ? palette.fonts.dark
                          : palette.fonts.inactive
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 34 }} />
                )}
              </View>

              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <FancySearchBar
                  value={search}
                  onSearch={setSearch}
                  placeholder={searchPlaceholder}
                />
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
                      <View style={styles.itemTextContainer}>
                        <FancyText
                          style={[
                            styles.itemText,
                            isSelected && { color: palette.primary, fontFamily: BOLD_FONT },
                          ]}
                        >
                          {item.title}
                        </FancyText>
                        {item.subtitle && (
                          <FancyText style={styles.itemSubtitle}>{item.subtitle}</FancyText>
                        )}
                      </View>
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
                              color={palette.primary}
                            />
                          </View>
                        )
                      )}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <FancySeparator style={{ marginTop: 8 }} />}
                keyExtractor={(item: DropDownItemProps<ValueItem>, index: number) =>
                  `${index}_${String(item.value ?? '')}`
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
    ),
    [
      ListEmptyComponent,
      activeColor,
      backdropAnim,
      dragY,
      filteredItems,
      handleClose,
      handleConfirm,
      handleSelect,
      insets.bottom,
      insets.top,
      isDark,
      label,
      multiSelect,
      palette,
      panResponder,
      search,
      searchPlaceholder,
      reliableBackdropColor,
      slideAnim,
      styles,
      tempValue,
      title,
    ],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <FancyText
          size={'extraSmall'}
          type='semiBold'
          color={palette.fonts.inactive}
          {...labelProps}
        >
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
          style={selectedItem || selectedCount > 0 ? styles.selectedText : styles.placeholder}
          color={disabled ? palette.fonts.inactive : palette.fonts.dark}
          numberOfLines={1}
        >
          {multiSelect
            ? selectedCount > 0
              ? `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`
              : placeholder
            : (selectedItem?.title ?? placeholder)}
        </FancyText>
        <View style={styles.iconContainer}>
          {isLoading ? (
            <ActivityIndicator size='small' color={palette.primary} />
          ) : (
            <DefaultIcons.Custom
              library='Feather'
              name='search'
              size={16}
              color={innerDisabled ? palette.fonts.inactive2 : palette.icons.inactive}
            />
          )}
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

const FancySearchSelect = forwardRef(FancySearchSelectInner) as <T>(
  props: FancySearchSelectProps<T> & { ref?: React.Ref<FancySearchSelectRef> },
) => React.ReactElement;

export default FancySearchSelect;

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
      backgroundColor: 'transparent',
    },
    backdropTouchable: {
      ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
      flex: 1,
    },
    sheetContainer: {
      flex: 1,
      backgroundColor: palette.backgroundColor,
      marginTop: 40,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: 'hidden',
      ...palette.shadows[300],
    },
    handleContainer: {
      alignItems: 'center',
      paddingBottom: 6,
      backgroundColor: palette.backgroundColor,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.border,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 5,
      gap: 20,
      paddingBottom: 5,
      backgroundColor: palette.backgroundColor,
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
    searchContainer: {
      backgroundColor: palette.backgroundColor,
      borderBottomColor: ColorUtils.lightenColor(palette.border, 0.5),
    },
    list: {
      flex: 1,
      backgroundColor: palette.backgroundColor,
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
    itemTextContainer: {
      flex: 1,
      gap: 2,
    },
    itemText: {
      fontFamily: MEDIUM_FONT,
      fontSize: SMALL_SIZE_FONT,
      color: palette.fonts.dark,
    },
    itemSubtitle: {
      fontFamily: MEDIUM_FONT,
      fontSize: EXTRA_SMALL_SIZE_FONT,
      color: palette.fonts.inactive,
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
    stateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 24,
      gap: 12,
    },
    stateText: {
      textAlign: 'center',
      lineHeight: 20,
    },
    retryButton: {
      minHeight: 40,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.24),
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.08),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
