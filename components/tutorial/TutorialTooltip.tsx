import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import { usePallete } from '../../hooks/usePallete';
import { TutorialProgressDots } from './TutorialProgressDots';

type TutorialTooltipProps = {
  title: string;
  description: string;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TutorialTooltip({
  title,
  description,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  style,
}: TutorialTooltipProps) {
  const Pallete = usePallete();
  const isLast = stepIndex + 1 >= totalSteps;

  return (
    <View style={[styles.card, { backgroundColor: Pallete.backgroundColor, ...Pallete.shadows[200] }, style]}>
      <FancyText type="semiBold" size="medium" color={Pallete.fonts.dark}>
        {title}
      </FancyText>
      <FancyText type="normal" size="small" color={Pallete.fonts.dark} style={styles.description}>
        {description}
      </FancyText>
      <View style={styles.footer}>
        <TutorialProgressDots total={totalSteps} currentIndex={stepIndex} />
        <View style={styles.actions}>
          {stepIndex > 0 && <FancyButton type="text" label="Voltar" onPress={onBack} />}
          <FancyButton type="text" label="Pular" onPress={onSkip} />
          <FancyButton type="contained" label={isLast ? 'Concluir' : 'Próximo'} onPress={onNext} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    maxWidth: 320,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  description: { marginBottom: 4 },
  footer: { gap: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4 },
});
