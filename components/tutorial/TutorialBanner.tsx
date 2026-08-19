import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
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
        { backgroundColor: ColorUtils.blendOver(Pallete.primary, 0.08, Pallete.backgroundColor) },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.14) }]}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='lightbulb-on-outline'
          size={16}
          color={Pallete.primary}
        />
      </View>

      <Pressable
        onPress={onStart}
        style={styles.content}
        hitSlop={4}
        accessibilityRole='button'
        accessibilityLabel='Iniciar tutorial desta tela'
      >
        <FancyText type='medium' size='extraSmall' color={Pallete.fonts.dark} numberOfLines={2}>
          Quer conhecer essa tela?{' '}
          <FancyText type='semiBold' size='extraSmall' color={Pallete.primary}>
            Iniciar tutorial
          </FancyText>
        </FancyText>
      </Pressable>

      <Pressable
        onPress={onDismiss}
        hitSlop={10}
        style={styles.dismiss}
        accessibilityRole='button'
        accessibilityLabel='Dispensar dica'
      >
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='close'
          size={16}
          color={Pallete.fonts.inactive}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, minWidth: 0 },
  dismiss: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
