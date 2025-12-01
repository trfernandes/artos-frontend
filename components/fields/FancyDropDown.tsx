import {
  ActivityIndicator,
  ImageSourcePropType,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import FancyTextInput, { FancyTextInputProps } from './FancyTextInput';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import FancyDropDownItem, { DropDownItemProps } from './FancyDropDownItem';
import { Pallete } from '../../constants/colors';
import { DefaultIconsNames } from '../../constants/icons';
import FancySeparator from '../FancySeparator';
import { Image } from 'expo-image';
import { ImageUtils } from '../../utils/image_utils';

const EMPTY_PROFILE_IMAGE = require('../../assets/images/empty_profile_image.png');

export interface FancyDropDownProps<T>
  extends Pick<FancyTextInputProps, 'disabled' | 'label' | 'placeholder' | 'inputContainerStyle'>,
    Pick<TextInputProps, 'onBlur'> {
  listItems?: DropDownItemProps<T>[];
  containerStyle?: StyleProp<ViewStyle>;
  value?: T;
  onChange?: (value: T) => void;
  showSelectedImage?: boolean;
  isLoading?: boolean;
}

export default function FancyDropDown<ValueItem>(props: FancyDropDownProps<ValueItem>) {
  const { listItems, containerStyle, value, onChange, showSelectedImage, onBlur, ...textInputProps } = props;
  const [showList, setShowList] = useState(false);
  const [listTopOffset, setListTopOffset] = useState(0);
  const [selectedItem, setSelectedItem] = useState<DropDownItemProps<ValueItem> | undefined>();

  const isDisabled = Boolean(textInputProps.disabled);
  type LeftDisplay = { type?: string; source?: string | ImageSourcePropType };

  const selectedImageSource = useMemo<ImageSourcePropType | undefined>(() => {
    if (!showSelectedImage) {
      return undefined;
    }

    const left = selectedItem?.left as LeftDisplay | undefined;

    if (!left || left.type === 'icon') {
      return undefined;
    }

    if (left.source) {
      return (
        ImageUtils.normalizeImageSource(left.source) ??
        (typeof left.source === 'string' ? { uri: left.source } : left.source)
      );
    }

    if (left.type === 'image') {
      return EMPTY_PROFILE_IMAGE;
    }

    return undefined;
  }, [selectedItem, showSelectedImage]);

  const items = listItems ?? [];

  const toggleList = useCallback(() => {
    if (isDisabled) {
      return;
    }

    setShowList(prev => !prev);
  }, [isDisabled]);

  const isSameValue = (a: unknown, b: unknown) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => item === b[index]);
    }

    return a === b;
  };

  useEffect(() => {
    setSelectedItem(items.find(item => isSameValue(item.value, value)));
  }, [items, value]);
  return (
    <View style={[styles.container, containerStyle]}>
      <FancyTextInput
        {...textInputProps}
        onPress={toggleList}
        leftContainer={
          selectedImageSource ? (
            <Image source={selectedImageSource} style={{ width: 25, height: 25, borderRadius: 100 }} />
          ) : undefined
        }
        inputProps={{ readOnly: true, onBlur, onPress: toggleList }}
        value={selectedItem?.title}
        inputContainerProps={{
          onLayout: e => {
            const height = e.nativeEvent.layout.height;
            setListTopOffset(height);
          },
        }}
        inputContainerStyle={[
          showList && {
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            borderBottomWidth: 0,
            height: 40,
          },
          { gap: 0, height: 40 },
        ]}
        rightContainer={
          !props.isLoading ? (
            [
              {
                icon: {
                  library: showList
                    ? DefaultIconsNames['chevron-up'].library
                    : DefaultIconsNames['chevron-down'].library,
                  size: 20,
                  color: isDisabled ? Pallete.icons.inactive2 : Pallete.icons.inactive,
                  name: showList ? DefaultIconsNames['chevron-up'].name : DefaultIconsNames['chevron-down'].name,
                  style: { paddingTop: 1, borderWidth: 0, marginRight: 8 },
                },
                onPress: toggleList,
              },
            ]
          ) : (
            <ActivityIndicator color={Pallete.primary} style={{ marginRight: 10 }} />
          )
        }
      />
      {showList && (
        <View style={[styles.listContainer, Pallete.shadows[100], { top: listTopOffset }]}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
          >
            {items.map((item, itemIdx) => {
              const key =
                typeof item.value === 'string' || typeof item.value === 'number' ? String(item.value) : `${itemIdx}`;

              return (
                <Fragment key={key}>
                  <FancyDropDownItem
                    onPress={() => {
                      onChange?.(item.value);
                      setSelectedItem(item);
                      setShowList(false);
                    }}
                    selected={item.value === selectedItem?.value}
                    {...item}
                  />
                  {itemIdx < items.length - 1 && <FancySeparator />}
                </Fragment>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // height: 40,
    // borderWidth: 1,
  },
  listContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 5,
    borderColor: Pallete.border,
    left: 0,

    width: '100%',
    // paddingVertical: 5,
    // height: 200,
    zIndex: 10000,
  },
});
