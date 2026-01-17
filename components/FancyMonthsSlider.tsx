import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Slider } from 'react-native-awesome-slider';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';
import React from 'react';

export type FancyMonthsSliderProps = {
  title?: string | React.ReactNode;
  value?: number;
  onChange?: (value: number) => void;
};

export function FancyMonthsSlider({ title, value, onChange }: FancyMonthsSliderProps) {
  const min = useSharedValue(1);
  const max = useSharedValue(12);
  const progress = useSharedValue(value ?? 1);

  const step = 1;
  const steps = 11; // (12 - 1) / 1 = 11 segmentos => valores 1..12

  return (
    <View style={{ gap: 12, flex: 1, borderWidth: 0, paddingBottom: 3 }}>
      {title &&
        (typeof title === 'string' ? (
          <FancyText size={'medium'} type='bold' style={{ opacity: 0.9 }}>
            {title}
          </FancyText>
        ) : (
          title
        ))}

      <Slider
        progress={progress}
        minimumValue={min}
        maximumValue={max}
        steps={steps}
        markWidth={0}
        theme={{
          minimumTrackTintColor: Pallete.primary,
          maximumTrackTintColor: Pallete.backgroundColor2,
        }}
        style={{ borderWidth: 0, height: 12 }}
        containerStyle={{ borderWidth: 0, borderColor: 'blue', height: 8, borderRadius: 10 }}
        forceSnapToStep
        onValueChange={onChange}
        renderBubble={() => undefined}
      />
    </View>
  );
}
