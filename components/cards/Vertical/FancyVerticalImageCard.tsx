import { StyleSheet, TouchableOpacity, ImageStyle, View } from 'react-native';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';
import FancyImage from '../../images/FancyImage';

export type FancyVerticalImageCardProps = {
  url?: string | number;
  selected?: boolean;
  imageSize?: number;
  topRightIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
  topLeftIcon?: { onPress?: () => void; customIcon?: CustomIconProps };
} & Pick<FancyVerticalCardProps, 'title' | 'subtitle' | 'containerStyle' | 'additionalElement'>;

export default function FancyVerticalImageCard({
  selected = false,
  url,
  imageSize,
  topRightIcon,
  topLeftIcon,
  containerStyle,
  ...props
}: FancyVerticalImageCardProps) {
  return (
    <FancyVerticalCard
      cardHeight={80}
      topElement={<ImageComponent source={url} />}
      topElementStyle={{ marginBottom: 12 }}
      bottomElementStyle={{
        justifyContent: 'center',
      }}
      {...props}
      containerStyle={[containerStyle, selected && styles.selected]}
    />
  );
}

export function ImageComponent({ source }: { source?: string | number }) {
  const resolvedSource =
    typeof source === 'number'
      ? source
      : typeof source === 'string' && source.trim().length > 0
      ? source
      : undefined;

  return (
    <View
      style={{
        // borderWidth: 1,
        width: '100%',
        height: '100%',
        paddingVertical: '8%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {resolvedSource ? (
        <FancyImage source={{ uri: resolvedSource as string }} style={styles.image} />
      ) : null}
    </View>
  );
}
export function TopLeftMenuButton({
  customIcon,
  onPress,
}: {
  customIcon?: CustomIconProps;
  onPress?: () => void;
}) {
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
        library="MaterialCommunityIcons"
        name="dots-vertical"
        {...customIcon}
        size={customIcon?.size || 18}
        color={customIcon?.color || Pallete.icons.dark}
      />
    </TouchableOpacity>
  );
}

export function TopRightMenuButton({
  customIcon,
  onPress,
}: {
  customIcon?: CustomIconProps;
  onPress?: () => void;
}) {
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
  image: {
    borderRadius: 9999,
    aspectRatio: 1,
    flex: 1,
    resizeMode: 'cover',
  } as ImageStyle,
});
