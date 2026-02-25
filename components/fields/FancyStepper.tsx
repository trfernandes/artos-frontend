import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import DefaultIcons from '../FancyIcons';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  unit?: (value: number) => string;
};

export default function FancyStepper({ value, onChange, min = 1, max = 99, label, unit }: Props) {
  const palette = usePallete();

  const canDecrement = value > min;
  const canIncrement = value < max;

  const unitLabel = unit ? unit(value) : String(value);

  const opacity = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.15, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [value]);

  return (
    <View style={{ gap: 8 }}>
      {label && (
        <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
          {label}
        </FancyText>
      )}

      <View style={styles.row}>
        {/* Botão − */}
        <Pressable
          onPress={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: palette.backgroundColor2,
              opacity: !canDecrement ? 0.35 : pressed ? 0.6 : 1,
            },
          ]}
          accessibilityLabel='Diminuir'
          accessibilityRole='button'
        >
          <DefaultIcons.Custom library='Feather' name='minus' size={18} color={palette.fonts.dark} />
        </Pressable>

        {/* Valor central */}
        <Animated.View style={{ opacity, flex: 1, alignItems: 'center' }}>
          <FancyText size={18} type='semiBold' color={palette.fonts.dark}>
            {unitLabel}
          </FancyText>
        </Animated.View>

        {/* Botão + */}
        <Pressable
          onPress={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: palette.backgroundColor2,
              opacity: !canIncrement ? 0.35 : pressed ? 0.6 : 1,
            },
          ]}
          accessibilityLabel='Aumentar'
          accessibilityRole='button'
        >
          <DefaultIcons.Custom library='Feather' name='plus' size={18} color={palette.fonts.dark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
