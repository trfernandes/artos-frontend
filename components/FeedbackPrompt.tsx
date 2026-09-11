import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FancyText from './FancyText';
import { usePallete } from '../hooks/usePallete';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { ThemePalette } from '../constants/colors';
import { ColorUtils } from '../utils/color_utils';

interface FeedbackOption {
  emoji: string;
  label: string;
  value: 'RUIM' | 'BOM' | 'EXCELENTE';
}

const OPTIONS: FeedbackOption[] = [
  { emoji: '😞', label: 'Ruim', value: 'RUIM' },
  { emoji: '😊', label: 'Bom', value: 'BOM' },
  { emoji: '🎉', label: 'Excelente', value: 'EXCELENTE' },
];

interface FeedbackPromptProps {
  onSelect: (value: 'RUIM' | 'BOM' | 'EXCELENTE') => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export default function FeedbackPrompt({
  onSelect,
  onDismiss,
  isLoading = false,
}: FeedbackPromptProps) {
  const palette = usePallete();
  const styles = useThemedStyles((p) => createStyles(p));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.backgroundColor2, borderColor: palette.borderCard },
      ]}
    >
      <View style={styles.content}>
        <FancyText
          type='bold'
          size='medium'
          color={palette.fonts.dark}
          style={styles.title}
        >
          Como o Diakonia está sendo pra você?
        </FancyText>

        <View style={styles.optionsRow}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => !isLoading && onSelect(option.value)}
              disabled={isLoading}
              activeOpacity={0.7}
              style={styles.optionButton}
            >
              <FancyText size='extraLarge' style={styles.emoji}>
                {option.emoji}
              </FancyText>
              <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                {option.label}
              </FancyText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={onDismiss} disabled={isLoading}>
          <FancyText
            type='medium'
            size='small'
            color={palette.fonts.inactive}
            style={styles.dismissButton}
          >
            Agora não
          </FancyText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      marginHorizontal: 15,
      marginBottom: 12,
      ...palette.shadows[100],
    },
    content: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    title: {
      textAlign: 'center',
      marginBottom: 4,
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginVertical: 8,
    },
    optionButton: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 8,
    },
    emoji: {
      textAlign: 'center',
    },
    dismissButton: {
      textAlign: 'center',
      paddingVertical: 8,
    },
  });
}
