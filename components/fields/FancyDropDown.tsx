import { FlatList, StyleProp, StyleSheet, TextInputProps, View, ViewStyle } from 'react-native';
import FancyTextInput, { FancyTextInputProps } from './FancyTextInput';
import { useEffect, useState } from 'react';
import FancyDropDownItem, { DropDownItemProps } from './FancyDropDownItem';
import { Pallete } from '../../constants/colors';
import { DefaultIconsNames } from '../../constants/icons';
import FancySeparator from '../FancySeparator';
import { Image } from 'expo-image';

export interface FancyDropDownProps<T>
  extends Pick<FancyTextInputProps, 'disabled' | 'label' | 'placeholder' | 'inputContainerStyle'>,
    Pick<TextInputProps, 'onBlur'> {
  listItems?: DropDownItemProps<T>[];
  containerStyle?: StyleProp<ViewStyle>;
  value?: T;
  onChange?: (value: T) => void;
}

export default function FancyDropDown<ValueItem>(props: FancyDropDownProps<ValueItem>) {
  const [showList, setShowList] = useState(false);
  const [listTopOffset, setListTopOffset] = useState(0);
  const [selectedItem, setSelectedItem] = useState<DropDownItemProps<ValueItem> | undefined>();

  useEffect(() => {
    setSelectedItem(props.listItems?.find(item => item.value == props.value));
  }, [props]);

  return (
    <View style={[styles.container, props.containerStyle]}>
      <FancyTextInput
        {...props}
        leftContainer={
          selectedItem?.left && selectedItem?.left?.type === 'image' ? (
            selectedItem?.left.source ? (
              <Image
                source={typeof selectedItem.left?.source === 'string' ? { uri: selectedItem.left?.source } : selectedItem.left?.source}
                style={{ width: 25, height: 25, borderRadius: 100 }}
              />
            ) : (
              <Image source={require('../../assets/images/empty_profile_image.png')} style={{ width: 30, height: 30, borderRadius: 100 }} />
            )
          ) : null
        }
        inputProps={{ readOnly: true, onBlur: props.onBlur, onPress: () => setShowList(!showList) }}
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
          },
          { gap: 0 },
        ]}
        rightContainer={[
          {
            icon: {
              library: showList ? DefaultIconsNames['chevron-up'].library : DefaultIconsNames['chevron-down'].library,
              size: 24,
              color: props.disabled ? Pallete.icons.inactive2 : Pallete.icons.inactive,
              name: showList ? DefaultIconsNames['chevron-up'].name : DefaultIconsNames['chevron-down'].name,
              style: { paddingTop: 1, borderWidth: 0, marginRight: 8 },
            },
            onPress: !props.disabled
              ? () => {
                  setShowList(!showList);
                }
              : undefined,
          },
        ]}
      />
      {showList && (
        <View style={[styles.listContainer, Pallete.shadows[100], { top: listTopOffset }]}>
          <FlatList
            data={props.listItems?.sort((a, b) => a.title.localeCompare(b.title)) || []}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            renderItem={({ item, index }) => (
              <FancyDropDownItem
                key={index}
                onPress={() => {
                  setSelectedItem(item);
                  props.onChange?.(item.value);
                  setShowList(false);
                }}
                selected={item.value === selectedItem?.value}
                {...item}
              />
            )}
            ItemSeparatorComponent={() => <FancySeparator />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
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
