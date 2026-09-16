import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancyScrollView from '../../../../../components/FancyScrollView';
import FancyText from '../../../../../components/FancyText';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyButton from '../../../../../components/buttons/FancyButton';
import FancyVerticalSpacer from '../../../../../components/FancyVerticalSpacer';
import { usePallete } from '../../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../../hooks/useThemedStyles';
import { usePoliticaPrivacidade } from '../../../../../hooks/usePoliticaPrivacidade';
import { ThemePalette } from '../../../../../constants/colors';

export default function PoliticaPrivacidadePage() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { data, isLoading, isError, refetch } = usePoliticaPrivacidade();

  if (isLoading) {
    return (
      <FancyPageView style={styles.centerContainer}>
        <FancyLoading />
      </FancyPageView>
    );
  }

  if (isError || !data) {
    return (
      <FancyPageView style={styles.centerContainer}>
        <FancyText size='medium' type='semiBold' color={palette.fonts.dark}>
          Não foi possível carregar a política de privacidade
        </FancyText>
        <FancyText size='small' color={palette.fonts.inactive} style={styles.centerText}>
          Verifique sua conexão e tente novamente.
        </FancyText>
        <FancyVerticalSpacer height={8} />
        <FancyButton
          label='Tentar novamente'
          onPress={() => refetch()}
          containerStyle={styles.retryButton}
        />
      </FancyPageView>
    );
  }

  return (
    <FancyPageView>
      <FancyScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
          Versão vigente: {data.versao}
        </FancyText>
        {data.secoes.map((secao) => (
          <View key={secao.titulo} style={styles.secao}>
            <FancyText size='medium' type='bold' color={palette.fonts.dark}>
              {secao.titulo}
            </FancyText>
            <FancyText size='small' color={palette.fonts.inactive} style={styles.corpo}>
              {secao.corpo}
            </FancyText>
          </View>
        ))}
      </FancyScrollView>
    </FancyPageView>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    centerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 24,
    },
    centerText: {
      textAlign: 'center',
    },
    retryButton: {
      minWidth: 160,
    },
    content: {
      padding: 16,
      gap: 18,
    },
    secao: {
      gap: 6,
    },
    corpo: {
      lineHeight: 20,
    },
  });
}
