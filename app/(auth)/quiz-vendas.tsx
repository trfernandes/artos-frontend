import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import FancyPageView from '../../components/containers/FancyPageView';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { QUIZ_VENDAS_QUESTIONS } from '../../constants/quizVendas';
import { QuizVendasRepository } from '../../domain/services/QuizVendasRepository';
import { useLoading } from '../../contexts/LoadingContext';
import Toast from 'react-native-toast-message';

// Scaffold estrutural — estilo final (ilustrações, animações, wave) é etapa de UX separada.
export default function QuizVendasPage() {
  const Pallete = usePallete();
  const { showLoading, hideLoading } = useLoading();
  const [stepIndex, setStepIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [opcaoSelecionadaIndex, setOpcaoSelecionadaIndex] = useState<Record<string, number>>({});

  const question = QUIZ_VENDAS_QUESTIONS[stepIndex];
  const isLastStep = stepIndex === QUIZ_VENDAS_QUESTIONS.length - 1;
  const selecionado = respostas[question.id];
  const indiceSelecionado = opcaoSelecionadaIndex[question.id];

  const selecionarOpcao = (optionIndex: number, pontos: number) => {
    setRespostas((prev) => ({ ...prev, [question.id]: pontos }));
    setOpcaoSelecionadaIndex((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const avancar = async () => {
    if (selecionado === undefined) return;

    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
      return;
    }

    showLoading('Calculando seu resultado...');
    try {
      const resultado = await QuizVendasRepository.submeter({
        respostas: QUIZ_VENDAS_QUESTIONS.map((q) => ({
          questionId: q.id,
          pontos: respostas[q.id],
        })),
      });

      router.push({
        pathname: '/(auth)/quiz-vendas-resultado',
        params: { bucket: resultado.bucket, pontuacaoTotal: String(resultado.pontuacaoTotal) },
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível calcular o resultado',
        text2: 'Verifique sua conexão e tente novamente.',
      });
    } finally {
      hideLoading();
    }
  };

  return (
    <FancyPageView>
      <View style={styles.progressRow}>
        {QUIZ_VENDAS_QUESTIONS.map((q, index) => (
          <View
            key={q.id}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index <= stepIndex
                    ? Pallete.primary
                    : ColorUtils.withAlpha(Pallete.primary, 0.15),
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <FancyText size='small' color={Pallete.fonts.inactive}>
          {question.label}
        </FancyText>
        <FancyText size='large' type='bold' color={Pallete.fonts.dark} style={styles.title}>
          {question.title}
        </FancyText>

        <View style={styles.options}>
          {question.options.map((option, optionIndex) => {
            const ativo = indiceSelecionado === optionIndex;
            return (
              <FancyButton
                key={option.label}
                type={ativo ? 'contained' : 'outlined'}
                label={option.label}
                onPress={() => selecionarOpcao(optionIndex, option.pontos)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <FancyButton
          label={isLastStep ? 'Ver resultado' : 'Continuar'}
          onPress={avancar}
          disabled={selecionado === undefined}
        />
      </View>
    </FancyPageView>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
  },
  title: {
    marginTop: 4,
  },
  options: {
    gap: 10,
  },
  footer: {
    paddingBottom: 8,
  },
});
