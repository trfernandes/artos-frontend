import { useId } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const WAVE_HEIGHT = 40;
const WAVE_VB_WIDTH = 200;

// Elemento-assinatura do funil quiz-vendas: onda-gradiente entre 2 cores accent,
// reaproveitada na ilustração, no progress bar e na conclusão (ver docs/design-system.md).
export type QuizGradientWaveProps = {
  colors: [string, string];
  height?: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

export function QuizGradientWave({
  colors,
  height = WAVE_HEIGHT,
  opacity = 0.55,
  style,
}: QuizGradientWaveProps) {
  const gradientId = useId();
  const vbHeight = WAVE_VB_WIDTH * (height / WAVE_VB_WIDTH);

  return (
    <Svg
      width='100%'
      height={height}
      viewBox={`0 0 ${WAVE_VB_WIDTH} ${vbHeight}`}
      preserveAspectRatio='none'
      style={style}
    >
      <Defs>
        <LinearGradient id={gradientId} x1='0' y1='0' x2='1' y2='0'>
          <Stop offset='0' stopColor={colors[0]} />
          <Stop offset='1' stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Path
        d={`M0,${vbHeight * 0.5} C${WAVE_VB_WIDTH * 0.25},${vbHeight} ${WAVE_VB_WIDTH * 0.75},0 ${WAVE_VB_WIDTH},${vbHeight * 0.5} L${WAVE_VB_WIDTH},${vbHeight} L0,${vbHeight} Z`}
        fill={`url(#${gradientId})`}
        opacity={opacity}
      />
    </Svg>
  );
}

export type QuizIllustrationPlaceholderProps = {
  icon?: Pick<CustomIconProps, 'library' | 'name'>;
  image?: ImageSourcePropType;
  accentColor?: string;
  nextAccentColor?: string;
  height?: number;
  fullBleed?: boolean;
  showWave?: boolean;
};

export default function QuizIllustrationPlaceholder({
  icon,
  image,
  accentColor,
  nextAccentColor,
  height = 200,
  fullBleed = false,
  showWave = true,
}: QuizIllustrationPlaceholderProps) {
  const Pallete = usePallete();
  const color = accentColor ?? Pallete.primary;

  if (image) {
    if (fullBleed) {
      return (
        <View style={{ width: SCREEN_WIDTH, height }}>
          <Image source={image} style={{ width: SCREEN_WIDTH, height }} resizeMode='cover' />
          <Svg width={SCREEN_WIDTH} height={WAVE_HEIGHT} style={styles.topWave}>
            <Path
              d={`M0,0 Q${SCREEN_WIDTH * 0.15},${WAVE_HEIGHT * 0.65} ${SCREEN_WIDTH * 0.3},0 Q${SCREEN_WIDTH * 0.65},${WAVE_HEIGHT * 0.38} ${SCREEN_WIDTH},0 Z`}
              fill={Pallete.backgroundColor}
            />
          </Svg>
          <Svg width={SCREEN_WIDTH} height={WAVE_HEIGHT} style={styles.wave}>
            <Path
              d={`M0,${WAVE_HEIGHT} Q${SCREEN_WIDTH * 0.3},${WAVE_HEIGHT * 0.55} ${SCREEN_WIDTH * 0.65},${WAVE_HEIGHT} Q${SCREEN_WIDTH * 0.82},${WAVE_HEIGHT * 0.28} ${SCREEN_WIDTH},${WAVE_HEIGHT} Z`}
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
        styles.iconBanner,
        {
          height,
          backgroundColor: ColorUtils.withAlpha(color, 0.12),
        },
      ]}
    >
      <DefaultIcons.Custom
        library={icon!.library}
        name={icon!.name}
        size={height * 0.35}
        color={color}
      />
      <QuizGradientWave
        colors={[color, nextAccentColor ?? color]}
        height={WAVE_HEIGHT}
        style={styles.wave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: 16,
  },
  iconBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  topWave: {
    position: 'absolute',
    top: -1,
    left: 0,
  },
});
