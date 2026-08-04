import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

export type QuizSegmentedProgressProps = {
  totalSteps: number;
  currentStep: number;
  light?: boolean;
  // Onda-gradiente do elemento-assinatura aplicada ao segmento ativo
  // (ver docs/design-system.md — "Direção visual — Componentes").
  activeGradient?: [string, string];
};

export default function QuizSegmentedProgress({
  totalSteps,
  currentStep,
  light = false,
  activeGradient,
}: QuizSegmentedProgressProps) {
  const Pallete = usePallete();
  const activeColor = light ? Pallete.fonts.light : Pallete.primary;
  const inactiveColor = light
    ? ColorUtils.withAlpha(Pallete.fonts.light, 0.3)
    : ColorUtils.withAlpha(Pallete.primary, 0.15);

  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const active = index <= currentStep;

        if (active && activeGradient) {
          return (
            <LinearGradient
              key={index}
              colors={activeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.segment}
            />
          );
        }

        return (
          <View
            key={index}
            style={[styles.segment, { backgroundColor: active ? activeColor : inactiveColor }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
});
