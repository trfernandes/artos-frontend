import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import DefaultIcons from '../../../FancyIcons';
import { ThemePalette } from '../../../../constants/colors';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';

export default function CreateIgrejaAccountTabPronto() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <DefaultIcons.Custom
          library='MaterialCommunityIcons'
          name='check'
          size={20}
          color={palette.fonts.light}
        />
      </View>
      <FancyText type='bold' size='medium' color={palette.fonts.dark} style={styles.title}>
        Tudo pronto
      </FancyText>
      <FancyText size='small' color={palette.fonts.inactive} style={[styles.text, styles.textMuted]}>
        Revise rapidamente os dados e toque em Confirmar para finalizar o cadastro da igreja.
      </FancyText>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: palette.confirm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
    },
    text: {
      textAlign: 'center',
      lineHeight: 20,
    },
    textMuted: {
      opacity: 0.85,
    },
  });
}
