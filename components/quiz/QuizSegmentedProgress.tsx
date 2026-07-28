import { StyleSheet, View } from 'react-native';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

export type QuizSegmentedProgressProps = {
  totalSteps: number;
  currentStep: number;
  light?: boolean;
};

export default function QuizSegmentedProgress({
  totalSteps,
  currentStep,
  light = false,
}: QuizSegmentedProgressProps) {
  const Pallete = usePallete();
  const activeColor = light ? Pallete.fonts.light : Pallete.primary;
  const inactiveColor = light
    ? ColorUtils.withAlpha(Pallete.fonts.light, 0.3)
    : ColorUtils.withAlpha(Pallete.primary, 0.15);

  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            { backgroundColor: index <= currentStep ? activeColor : inactiveColor },
          ]}
        />
      ))}
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
