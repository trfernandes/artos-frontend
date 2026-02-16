import { StyleSheet, TouchableOpacity, View, ImageSourcePropType } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';
import { Image } from 'expo-image';

export type FancyVerticalImageCardProps = {
  source?: ImageSourcePropType;
  selected?: boolean;
  imageSize?: number;
  highlighted?: boolean;
  topRightIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
  topLeftIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle' | 'containerStyle' | 'additionalElement'>;

export default function FancyVerticalImageCard({
  selected = false,
  source,
  imageSize,
  topRightIcon,
  topLeftIcon,
  containerStyle,
  highlighted = false,
  ...props
}: FancyVerticalImageCardProps) {
  return (
    <FancyVerticalCard
      cardHeight={125}
      topElement={source && <ImageComponent source={source} highlighted={highlighted} />}
      contentContainerStyle={{}}
      {...props}
      containerStyle={[containerStyle, selected && styles.selected]}
    />
  );
}

export function ImageComponent({ source, highlighted = false }: { source: ImageSourcePropType; highlighted?: boolean }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 9999,
        ...Pallete.shadows[200],
      }}
    >
      {source ? <Image source={source} style={styles.image} contentFit='fill' /> : null}
    </View>
  );
}

export function TopLeftMenuButton({ customIcon, onPress }: { customIcon?: CustomIconProps; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: `100%`,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
      }}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='dots-vertical'
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
      style={{
        width: `100%`,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
      }}
    >
      <DefaultIcons.Custom
        library='MaterialCommunityIcons'
        name='dots-vertical'
        {...customIcon}
        size={customIcon?.size || 18}
        color={customIcon?.color || Pallete.icons.dark}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selected: { backgroundColor: Pallete.selected },
  image: {
    borderRadius: 9999,
    aspectRatio: 1,
    width: '50%',
  },
});
