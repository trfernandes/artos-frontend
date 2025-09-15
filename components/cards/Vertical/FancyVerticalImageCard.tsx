import { StyleSheet, View, TouchableOpacity } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';
import { Image } from 'expo-image';

export type FancyVerticalImageCardProps = {
  url?: string;
  selected?: boolean;
  topRightIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
  topLeftIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle' | 'containerStyle' | 'additionalElement'>;

export default function FancyVerticalImageCard({ selected = false, ...props }: FancyVerticalImageCardProps) {
  return (
    <FancyVerticalCard
      topElement={<ImageComponent url={props.url!} />}
      topRightElement={
        props.topRightIcon && (
          <TopRightMenuButton customIcon={props.topRightIcon?.customIcon} onPress={props.topRightIcon?.onPress} />
        )
      }
      topLeftElement={
        props.topLeftIcon && <TopLeftMenuButton customIcon={props.topLeftIcon?.customIcon} onPress={props.topLeftIcon?.onPress} />
      }
      {...props}
      containerStyle={[props.containerStyle, selected && styles.selected]}
    />
  );
}

export function ImageComponent({ url }: { url: string }) {
  return (
    <View style={styles.imageContainer}>
      <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

export function TopLeftMenuButton({ customIcon, onPress }: { customIcon?: CustomIconProps; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: `100%`, height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0 }}
    >
      <DefaultIcons.Custom
        library="MaterialCommunityIcons"
        name="dots-vertical"
        {...customIcon}
        size={customIcon?.size || 18}
        color={customIcon?.color || Pallete.icons.dark}
      />
    </TouchableOpacity>
  );
}

export function TopRightMenuButton({ customIcon, onPress }: { customIcon?: CustomIconProps; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: `100%`, height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 0 }}
    >
      <DefaultIcons.Custom
        library="MaterialCommunityIcons"
        name="dots-vertical"
        {...customIcon}
        size={customIcon?.size || 18}
        color={customIcon?.color || Pallete.icons.dark}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selected: { backgroundColor: Pallete.selected },
  imageContainer: {
    alignItems: 'center',
    width: '100%',
    // height: '100%',
    // borderWidth: 1,
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    // borderWidth: 1,
    borderRadius: 100,
    aspectRatio: 1,
  },
});
