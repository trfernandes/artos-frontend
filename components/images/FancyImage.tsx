import { StyleSheet, ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { Pallete } from '../../constants/colors';
import { Image } from 'expo-image';

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
  return (
    <Image
      source={source}
      style={[
        style,
        { width: size, height: size, borderRadius: size / 2, ...Pallete.shadows[200] },
        disabled && source !== undefined && styles.blackAndWhiteFilter,
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
