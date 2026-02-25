import { StyleSheet, ImageSourcePropType, ImageStyle, StyleProp, View } from 'react-native';
import { Pallete } from '../../constants/colors';
import { Image } from 'expo-image';
import { ImageUtils } from '../../utils/image_utils';
import { AppImages } from '../../assets/app_images';
import DefaultIcons from '../FancyIcons';

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
  const isEmptyProfilePlaceholder =
    source === AppImages.emptyProfile || resolvedSource === AppImages.emptyProfile;

  if (isEmptyProfilePlaceholder) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#E2E8F0',
            borderWidth: Math.max(1, Math.round(size * 0.03)),
            borderColor: '#CBD5E1',
            justifyContent: 'center',
            alignItems: 'center',
            ...Pallete.shadows[200],
          },
          style as any,
          disabled && styles.placeholderDisabled,
        ]}
      >
        <DefaultIcons.Custom
          library='MaterialIcons'
          name='person'
          size={Math.max(18, Math.round(size * 0.52))}
          color='#94A3B8'
        />
      </View>
    );
  }

  return (
    <Image
      contentFit='cover'
      transition={100}
      priority='low'
      cachePolicy='memory-disk'
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
  placeholderDisabled: {
    opacity: 0.95,
  },
});
