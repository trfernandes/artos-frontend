import { Dimensions, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const WAVE_HEIGHT = 36;

export type QuizIllustrationPlaceholderProps = {
  icon?: Pick<CustomIconProps, 'library' | 'name'>;
  image?: ImageSourcePropType;
  accentColor?: string;
  height?: number;
  fullBleed?: boolean;
};

export default function QuizIllustrationPlaceholder({
  icon,
  image,
  accentColor,
  height = 200,
  fullBleed = false,
}: QuizIllustrationPlaceholderProps) {
  const Pallete = usePallete();
  const color = accentColor ?? Pallete.primary;

  if (image) {
    if (fullBleed) {
      return (
        <View style={{ width: SCREEN_WIDTH, height }}>
          <Image
            source={image}
            style={{ width: SCREEN_WIDTH, height }}
            resizeMode='cover'
          />
          <Svg
            width={SCREEN_WIDTH}
            height={WAVE_HEIGHT}
            style={styles.topWave}
          >
            <Path
              d={`M0,0 L0,${WAVE_HEIGHT * 0.7} C${SCREEN_WIDTH * 0.35},${WAVE_HEIGHT} ${SCREEN_WIDTH * 0.6},${-WAVE_HEIGHT * 0.4} ${SCREEN_WIDTH},0 Z`}
              fill={Pallete.backgroundColor}
            />
          </Svg>
          <Svg
            width={SCREEN_WIDTH}
            height={WAVE_HEIGHT}
            style={styles.wave}
          >
            <Path
              d={`M0,${WAVE_HEIGHT * 0.3} C${SCREEN_WIDTH * 0.25},${-WAVE_HEIGHT * 0.4} ${SCREEN_WIDTH * 0.75},${-WAVE_HEIGHT * 0.4} ${SCREEN_WIDTH},${WAVE_HEIGHT * 0.3} L${SCREEN_WIDTH},${WAVE_HEIGHT} L0,${WAVE_HEIGHT} Z`}
              fill={Pallete.backgroundColor}
            />
          </Svg>
        </View>
      );
    }

    return <Image source={image} style={[styles.banner, { height }]} resizeMode='cover' />;
  }

  return (
    <View
      style={[
        styles.banner,
        {
          height,
          backgroundColor: ColorUtils.withAlpha(color, 0.12),
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <DefaultIcons.Custom
        library={icon!.library}
        name={icon!.name}
        size={height * 0.35}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: 16,
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
  },
  topWave: {
    position: 'absolute',
    top: -1,
    left: 0,
  },
});
