import React from 'react';
import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

type TutorialBannerProps = {
  onStart: () => void;
  onDismiss: () => void;
};

export function TutorialBanner({ onStart, onDismiss }: TutorialBannerProps) {
  const Pallete = usePallete();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.08),
          borderColor: Pallete.border,
        },
      ]}
    >
      <FancyText type='medium' size='small' color={Pallete.fonts.dark}>
        Quer conhecer essa tela?
      </FancyText>
      <View style={styles.actions}>
        <FancyButton type='text' label='Agora não' onPress={onDismiss} />
        <FancyButton type='outlined' label='Iniciar Tutorial' onPress={onStart} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
