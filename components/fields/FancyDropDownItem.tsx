import { ImageSourcePropType, StyleSheet, TouchableOpacity, View } from 'react-native';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import { Image } from 'expo-image';
import { ImageUtils } from '../../utils/image_utils';

export interface DropDownItemProps<ValueType> {
  title: string;
  subtitle?: string;
  value: ValueType;
  selected?: boolean;
  left?: { type: 'image'; source: string | ImageSourcePropType } | { type: 'icon'; icon: CustomIconProps } | undefined;
  onPress?: () => void;
}

export default function FancyDropDownItem<ValueItem>(props: DropDownItemProps<ValueItem>) {
  return (
    <TouchableOpacity style={[styles.container, props.selected && styles.selected]} onPress={props.onPress}>
      {props.left &&
        (props.left?.type === 'icon' ? (
          <DefaultIcons.Custom color={Pallete.fonts.dark} {...(props.left.icon as CustomIconProps)} />
        ) : props.left?.source ? (
          <Image
            source={
              ImageUtils.normalizeImageSource(props.left?.source) ??
              (typeof props.left?.source === 'string' ? { uri: props.left?.source } : props.left?.source)
            }
            style={{ width: 30, height: 30, borderRadius: 100 }}
          />
        ) : (
          <Image source={require('../../assets/images/empty_profile_image.png')} style={{ width: 30, height: 30, borderRadius: 100 }} />
        ))}
      <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between', flex: 1 }}>
        <FancyText size={'small'} type={!props.selected ? 'medium' : 'bold'}>
          {props.title}
        </FancyText>
        {props.subtitle && (
          <FancyText size={'extraSmall'} type={'mediumItalic'} color={Pallete.fonts.inactive}>
            {props.subtitle}
          </FancyText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  selected: { backgroundColor: 'rgba(59, 130, 246, 0.16)' },
});
