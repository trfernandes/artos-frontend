import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import FancyErrorText from '../forms/FancyErrorText';
import { usePallete } from '../../hooks/usePallete';
import {
  RecorrenciaDiaSemanaEnumLabel,
  RecorrenciaDiaSemanaEnumOrder,
} from '../../domain/enums/Evento/recorrencia-dia-semana.enum';
import {
  RecorrenciaSemanaMesEnumOrder,
  RecorrenciaSemanaMesEnumLabel,
} from '../../domain/enums/Evento/recorrencia-semana-mes.enum';

type Props = {
  selectedValues: string[];
  onChange: (values: string[]) => void;
  mode: 'weekly' | 'weekOfMonth';
  label?: string;
  errorMessage?: string;
  /** Quando true, selecionar um item deseleciona os demais */
  singleSelect?: boolean;
};

// Chip individual com animação de scale
function AnimatedChip({
  onPress,
  isSelected,
  children,
  chipStyle,
}: {
  onPress: () => void;
  isSelected: boolean;
  children: React.ReactNode;
  chipStyle: object;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole='checkbox'
      accessibilityState={{ checked: isSelected }}
    >
      <Animated.View style={[chipStyle, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export default function FancyDaySelector({
  selectedValues,
  onChange,
  mode,
  label,
  errorMessage,
  singleSelect = false,
}: Props) {
  const palette = usePallete();

  const handleToggle = (val: string) => {
    if (singleSelect) {
      // Single select: se já está selecionado, deseleciona; senão seleciona só este
      if (selectedValues.includes(val)) {
        onChange([]);
      } else {
        onChange([val]);
      }
    } else {
      if (selectedValues.includes(val)) {
        onChange(selectedValues.filter((v) => v !== val));
      } else {
        onChange([...selectedValues, val]);
      }
    }
  };

  const items = mode === 'weekly' ? RecorrenciaDiaSemanaEnumOrder : RecorrenciaSemanaMesEnumOrder;

  const getLabel = (item: string) => {
    if (mode === 'weekly') {
      return RecorrenciaDiaSemanaEnumLabel[item as keyof typeof RecorrenciaDiaSemanaEnumLabel]
        .abreviado;
    }
    return RecorrenciaSemanaMesEnumLabel[item as keyof typeof RecorrenciaSemanaMesEnumLabel]
      .abreviado;
  };

  return (
    <View style={{ gap: 10 }}>
      {label && (
        <FancyText size='small' type='medium' color={palette.fonts.dark} style={{ opacity: 0.7 }}>
          {label}
        </FancyText>
      )}
      <View style={styles.chipRow}>
        {items.map((item) => {
          const isSelected = selectedValues.includes(item);
          return (
            <AnimatedChip
              key={item}
              onPress={() => handleToggle(item)}
              isSelected={isSelected}
              chipStyle={[
                styles.chip,
                isSelected
                  ? { backgroundColor: palette.primary, borderColor: palette.primary }
                  : {
                      backgroundColor: `${palette.primary}15`,
                      borderColor: `${palette.primary}30`,
                    },
              ]}
            >
              <FancyText
                size='small'
                type='bold'
                color={isSelected ? palette.fonts.light : palette.primary}
              >
                {getLabel(item)}
              </FancyText>
            </AnimatedChip>
          );
        })}
      </View>
      {errorMessage && <FancyErrorText message={errorMessage} />}
    </View>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
