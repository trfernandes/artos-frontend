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
      source={resolvedSource}
      style={[
        style,
        { width: size, height: size, borderRadius: size / 2, ...Pallete.shadows[200] },
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
