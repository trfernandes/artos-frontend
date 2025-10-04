import { StyleSheet, View, TouchableOpacity, LayoutChangeEvent, StyleProp, ImageStyle } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import FancyVerticalCard, { FancyVerticalCardProps } from './FancyVerticalCard';
import DefaultIcons, { CustomIconProps } from '../../FancyIcons';
import { Pallete } from '../../../constants/colors';
import { Image } from 'expo-image';

const AUTO_IMAGE_SCALE = 0.68;
const MIN_AUTO_IMAGE_SIZE = 60;

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
      topElement={<ImageComponent source={url} size={imageSize} />}
      topRightElement={
        topRightIcon && (
          <TopRightMenuButton customIcon={topRightIcon?.customIcon} onPress={topRightIcon?.onPress} />
        )
      }
      topLeftElement={
        topLeftIcon && (
          <TopLeftMenuButton customIcon={topLeftIcon?.customIcon} onPress={topLeftIcon?.onPress} />
        )
      }
      {...props}
      containerStyle={[containerStyle, selected && styles.selected]}
    />
  );
}

export function ImageComponent({ source, size }: { source?: string | number; size?: number }) {
  const [autoSize, setAutoSize] = useState<number>();

  const resolvedSource =
    typeof source === 'number'
      ? source
      : typeof source === 'string' && source.trim().length > 0
      ? source
      : undefined;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (size) return;

      const { width, height } = event.nativeEvent.layout;
      if (!width || !height) return;

      const base = Math.min(width, height) * AUTO_IMAGE_SCALE;
      const nextSize = Math.max(base, MIN_AUTO_IMAGE_SIZE);
      if (!autoSize || Math.abs(nextSize - autoSize) > 1) {
        setAutoSize(nextSize);
      }
    },
    [size, autoSize]
  );

  const effectiveSize = size ?? autoSize;
  const imageStyle: StyleProp<ImageStyle> = useMemo(() => {
    const stylesArray = [styles.image];
    if (effectiveSize) {
      stylesArray.push({
        width: effectiveSize,
        height: effectiveSize,
        borderRadius: effectiveSize / 2,
        aspectRatio: undefined,
      });
    }
    return stylesArray;
  }, [effectiveSize]);

  return (
    <View style={styles.imageContainer} onLayout={handleLayout}>
      {resolvedSource ? <Image source={resolvedSource} style={imageStyle} resizeMode="cover" /> : null}
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
  imageContainer: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    borderRadius: 9999,
    aspectRatio: 1,
  } as ImageStyle,
});
