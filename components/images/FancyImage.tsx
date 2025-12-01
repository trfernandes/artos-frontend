import { StyleSheet, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { Pallete } from '../../constants/colors';
import { Image } from 'expo-image';
import { ImageUtils } from '../../utils/image_utils';

export default function FancyImage({
  source,
  disabled = false,
  size = 120,
  style,
}: {
  source?: ImageSourcePropType;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  const resolvedSource = ImageUtils.normalizeImageSource(source) ?? source;

  return (
    <Image
      contentFit="cover"
      transition={100}
      priority="low"
      cachePolicy="memory-disk"
      source={resolvedSource}
      style={[
        { width: size, height: size, borderRadius: size / 2, ...Pallete.shadows[200] },
        style,
        disabled && resolvedSource !== undefined && styles.blackAndWhiteFilter,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  blackAndWhiteFilter: {
    // opacity: 0.4, // Reduz a opacidade
    // tintColor: 'gray', // Aplica um tom de cinza
  },
});
