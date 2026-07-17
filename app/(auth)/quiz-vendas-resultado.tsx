import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FancyPageView from '../../components/containers/FancyPageView';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import { usePallete } from '../../hooks/usePallete';
import { QUIZ_VENDAS_BUCKET_COPY, QuizVendasBucket } from '../../constants/quizVendas';

// Scaffold estrutural — wave divider, breakdown de horas e ilustração real são etapa de UX separada.
export default function QuizVendasResultadoPage() {
  const Pallete = usePallete();
  const params = useLocalSearchParams<{ bucket: QuizVendasBucket; pontuacaoTotal: string }>();

  const bucketInfo = params.bucket ? QUIZ_VENDAS_BUCKET_COPY[params.bucket] : undefined;

  useEffect(() => {
    if (!bucketInfo) {
      router.replace('/(auth)/quiz-vendas');
    }
  }, [bucketInfo]);

  if (!bucketInfo) return null;

  return (
    <FancyPageView>
      <View style={styles.content}>
        <FancyText size='small' color={Pallete.fonts.inactive}>
          Seu resultado
        </FancyText>
        <FancyText size='large' type='bold' color={Pallete.fonts.dark} style={styles.tag}>
          {bucketInfo.tag}
        </FancyText>
        <FancyText size='small' color={Pallete.fonts.inactive}>
          {bucketInfo.copy}
        </FancyText>
      </View>

      <View style={styles.footer}>
        <FancyButton
          label='Ver como o Diakonia ajuda'
          onPress={() => router.push('/(auth)/quiz-vendas-funcionalidades')}
        />
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  tag: {
    marginTop: 4,
  },
  footer: {
    paddingBottom: 8,
  },
});
