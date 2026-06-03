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

  // IMPORTANTE: NUNCA montar/desmontar nem trocar o tipo de elemento nativo no
  // mesmo slot. Alternar <Image> <-> ícone (ou montar/desmontar um deles) faz o
  // Android crashar com "addViewAt: failed to insert view into parent at index"
  // durante a reconciliação — sobretudo quando a tela é desmontada logo depois
  // (ex.: router.back() após salvar). Por isso a <Image> e o ícone ficam SEMPRE
  // montados, nesta ordem, e só a opacity alterna. Assim a contagem e os tipos
  // dos filhos nunca mudam e não há operação addViewAt/removeView para falhar.
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          ...Pallete.shadows[200],
        },
        isEmptyProfilePlaceholder && {
          backgroundColor: '#E2E8F0',
          borderWidth: Math.max(1, Math.round(size * 0.03)),
          borderColor: '#CBD5E1',
        },
        style as any,
        disabled && isEmptyProfilePlaceholder && styles.placeholderDisabled,
      ]}
    >
      <Image
        contentFit='cover'
        transition={100}
        priority='low'
        cachePolicy='memory-disk'
        source={isEmptyProfilePlaceholder ? undefined : resolvedSource}
        style={[
          { width: size, height: size },
          disabled && resolvedSource !== undefined && styles.blackAndWhiteFilter,
          isEmptyProfilePlaceholder && { opacity: 0 },
        ]}
      />
      <DefaultIcons.Custom
        library='MaterialIcons'
        name='person'
        size={Math.max(18, Math.round(size * 0.52))}
        color='#94A3B8'
        style={{
          position: 'absolute',
          opacity: isEmptyProfilePlaceholder ? 1 : 0,
        }}
      />
    </View>
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
