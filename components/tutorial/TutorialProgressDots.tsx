import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type TutorialProgressDotsProps = {
  total: number;
  currentIndex: number;
};

export function TutorialProgressDots({ total, currentIndex }: TutorialProgressDotsProps) {
  const Pallete = usePallete();

  if (total <= 1) return null;

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index === currentIndex ? Pallete.primary : ColorUtils.withAlpha(Pallete.primary, 0.25),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
