import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Modal, FlatList, StyleProp, ViewStyle, TextInputProps } from 'react-native';
import FancyText from '../FancyText';
import { ThemePalette } from '../../constants/colors';
import { BOLD_FONT, ITALIC_SEMI_BOLD_FONT, MEDIUM_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import DefaultIcons from '../FancyIcons';
import { DefaultIconsNames } from '../../constants/icons';
import { DropDownItemProps } from './FancyDropDownItem';
import { FancyTextInputProps } from './FancyTextInput';
import { ColorUtils } from '../../utils/color_utils';
import FancyImage from '../images/FancyImage';
import { ImageUtils } from '../../utils/image_utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export interface FancySelectFieldProps<T>
  extends Pick<FancyTextInputProps, 'disabled' | 'label' | 'placeholder'>,
    Pick<TextInputProps, 'onBlur'> {
  listItems: DropDownItemProps<T>[] | undefined;
  containerStyle?: StyleProp<ViewStyle>;
  value?: T;
  onChange?: (value: T) => void;
  isLoading?: boolean;
  modalTitle?: string;
}

export default function FancySelectField<ValueItem>({
  listItems,
  placeholder = 'Selecione...',
  isLoading,
  disabled,
  label,
  value,
  onChange,
  containerStyle,
  modalTitle,
}: FancySelectFieldProps<ValueItem>) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const activeColor = ColorUtils.lightenColor(Pallete.primary, 0.7);

  const selectedItem = listItems?.find((item) => item.value === value);
  const innerDisabled = disabled || isLoading || listItems?.length === 0;

  const handleSelect = useCallback(
    (item: DropDownItemProps<ValueItem>) => {
      onChange?.(item.value);
      setIsModalVisible(false);
    },
    [onChange],
  );

  const renderItem = useCallback(
    ({ item }: { item: DropDownItemProps<ValueItem> }) => {
      const isSelected = item.value === value;
      return (
        <Pressable
          style={[styles.listItem, isSelected && { backgroundColor: activeColor }]}
          onPress={() => handleSelect(item)}
        >
          {item.left && item.left.type === 'image' && item.left.source && (
            <FancyImage
              size={30}
              source={
                ImageUtils.normalizeImageSource(item.left?.source) ??
                (typeof item.left?.source === 'string' ? { uri: item.left?.source } : item.left?.source)
              }
            />
          )}
          <FancyText style={styles.itemText}>{item.title}</FancyText>
          {isSelected && (
            <DefaultIcons.Custom library='MaterialCommunityIcons' name='check' size={20} color={Pallete.primary} />
          )}
        </Pressable>
      );
    },
    [value, handleSelect, activeColor],
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <FancyText size={'extraSmall'} type='semiBold' color={Pallete.fonts.inactive}>
          {label}
        </FancyText>
      )}
      <Pressable
        style={[styles.inputContainer, innerDisabled && { backgroundColor: Pallete.disabled }]}
        onPress={() => !innerDisabled && setIsModalVisible(true)}
        disabled={innerDisabled}
      >
        <FancyText
          style={selectedItem ? styles.selectedText : styles.placeholder}
          numberOfLines={1}
        >
          {selectedItem?.title ?? placeholder}
        </FancyText>
        <DefaultIcons.Custom
          library={DefaultIconsNames['chevron-down'].library}
          name={DefaultIconsNames['chevron-down'].name}
          size={16}
          color={Pallete.icons.inactive}
        />
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.modalHeader}>
              <FancyText type='bold' size='medium'>
                {modalTitle ?? label ?? 'Selecione'}
              </FancyText>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <DefaultIcons.Custom library='Ionicons' name='close' size={24} color={Pallete.fonts.dark} />
              </Pressable>
            </View>
            <FlatList
              data={listItems}
              renderItem={renderItem}
              keyExtractor={(item, index) => String(item.value ?? index)}
              style={styles.list}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    container: { gap: 5 },
    inputContainer: {
      backgroundColor: Pallete.backgroundColor,
      borderWidth: 0.6,
      borderColor: Pallete.border,
      borderRadius: 10,
      minHeight: 44,
      padding: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...Pallete.shadows[200],
    },
    placeholder: {
      fontFamily: ITALIC_SEMI_BOLD_FONT,
      fontSize: SMALL_SIZE_FONT,
      opacity: 0.8,
      color: Pallete.fonts.inactive,
      flex: 1,
    },
    selectedText: {
      fontFamily: BOLD_FONT,
      fontSize: SMALL_SIZE_FONT,
      color: Pallete.fonts.dark,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: Pallete.overlays.backdrop,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: Pallete.backgroundColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '60%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: Pallete.border,
    },
    list: {
      paddingHorizontal: 8,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      paddingHorizontal: 12,
      gap: 10,
      borderRadius: 10,
    },
    itemText: {
      fontFamily: MEDIUM_FONT,
      fontSize: SMALL_SIZE_FONT,
      color: Pallete.fonts.dark,
      flex: 1,
    },
    separator: {
      height: 1,
      backgroundColor: Pallete.border,
      marginHorizontal: 8,
    },
  });
}
