import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import QuizFlatLayout from '../../components/quiz/QuizFlatLayout';
import QuizSegmentedProgress from '../../components/quiz/QuizSegmentedProgress';
import QuizIllustrationPlaceholder from '../../components/quiz/QuizIllustrationPlaceholder';
import QuizAnswerOption from '../../components/quiz/QuizAnswerOption';
import { usePallete } from '../../hooks/usePallete';
import { useLoading } from '../../contexts/LoadingContext';
import { AppImages } from '../../assets/app_images';
import { QUIZ_VENDAS_QUESTIONS } from '../../constants/quizVendas';
import { QuizVendasRepository } from '../../domain/services/QuizVendasRepository';

const QUESTION_IMAGES = [
  AppImages.quizPergunta1,
  AppImages.quizPergunta2,
  AppImages.quizPergunta3,
  AppImages.quizPergunta4,
  AppImages.quizPergunta5,
  AppImages.quizPergunta6,
];

export default function QuizVendasPage() {
  const Pallete = usePallete();
  const { showLoading, hideLoading } = useLoading();
  const [stepIndex, setStepIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [opcaoSelecionadaIndex, setOpcaoSelecionadaIndex] = useState<Record<string, number>>({});

  const question = QUIZ_VENDAS_QUESTIONS[stepIndex];
  const isFirstStep = stepIndex === 0;
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

      hideLoading();
      router.push({
        pathname: '/(auth)/quiz-vendas-resultado',
        params: { bucket: resultado.bucket, pontuacaoTotal: String(resultado.pontuacaoTotal) },
      });
    } catch {
      hideLoading();
      Toast.show({
        type: 'error',
        text1: 'Não foi possível calcular o resultado',
        text2: 'Verifique sua conexão e tente novamente.',
      });
    }
  };

  const voltar = () => {
    if (isFirstStep) {
      router.back();
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  const pular = () => router.replace('/(auth)/login');

  return (
    <QuizFlatLayout
      onPressBack={voltar}
      showBackButton={!isFirstStep}
      hero={<QuizIllustrationPlaceholder image={QUESTION_IMAGES[stepIndex]} height={220} fullBleed />}
      heroOverlay={
        <>
          <FancyText
            size='extraSmall'
            type='medium'
            color={Pallete.fonts.inactive}
            style={styles.progressLabel}
          >
            {`PERGUNTA ${stepIndex + 1} DE ${QUIZ_VENDAS_QUESTIONS.length}`}
          </FancyText>
          <QuizSegmentedProgress totalSteps={QUIZ_VENDAS_QUESTIONS.length} currentStep={stepIndex} />
        </>
      }
      footer={
        <>
          <FancyButton
            label={isLastStep ? 'Ver resultado' : 'Continuar'}
            onPress={avancar}
            disabled={selecionado === undefined}
            containerStyle={
              selecionado !== undefined ? { backgroundColor: Pallete.terciary } : undefined
            }
          />
          <FancyButton
            type='text'
            label='Pular'
            onPress={pular}
            labelStyle={{ color: Pallete.fonts.inactive }}
          />
        </>
      }
    >
      <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
        {question.title}
      </FancyText>

      <View style={styles.options}>
        {question.options.map((option, optionIndex) => (
          <QuizAnswerOption
            key={option.label}
            label={option.label}
            number={optionIndex + 1}
            icon={option.icon}
            selected={indiceSelecionado === optionIndex}
            onPress={() => selecionarOpcao(optionIndex, option.pontos)}
          />
        ))}
      </View>
    </QuizFlatLayout>
  );
}

const styles = StyleSheet.create({
  progressLabel: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  options: {
    gap: 10,
  },
});
