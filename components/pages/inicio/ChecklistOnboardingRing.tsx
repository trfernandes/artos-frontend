import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';

type ChecklistOnboardingRingProps = {
  concluidos: number;
  total: number;
  size?: number;
  strokeWidth?: number;
};

export default function ChecklistOnboardingRing({
  concluidos,
  total,
  size = 88,
  strokeWidth = 8,
}: ChecklistOnboardingRingProps) {
  const Pallete = usePallete();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progresso = total > 0 ? concluidos / total : 0;
  const dashOffset = circumference * (1 - progresso);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Pallete.disabled3}
          strokeWidth={strokeWidth}
          fill='none'
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Pallete.primary}
          strokeWidth={strokeWidth}
          fill='none'
          strokeLinecap='round'
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.centerContent}>
        <FancyText type='bold' size='medium' style={styles.numText}>
          {concluidos}/{total}
        </FancyText>
        <FancyText type='medium' size='extraSmall' color={Pallete.fonts.inactive}>
          passos
        </FancyText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontVariant: ['tabular-nums'],
  },
});
