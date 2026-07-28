import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import DefaultIcons from '../../components/FancyIcons';
import QuizFlatLayout from '../../components/quiz/QuizFlatLayout';
import QuizIllustrationPlaceholder from '../../components/quiz/QuizIllustrationPlaceholder';
import QuizSegmentedProgress from '../../components/quiz/QuizSegmentedProgress';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

const FEATURES = [
  {
    category: 'ESCALA AUTOMÁTICA',
    title: 'Escala automática',
    subtitle: 'O app monta a escala considerando disponibilidade e função de cada voluntário.',
    icon: { library: 'MaterialCommunityIcons', name: 'calendar-check-outline' } as const,
    colorToken: 'primary' as const,
  },
  {
    category: 'LEMBRETE AUTOMÁTICO',
    title: 'Lembrete automático',
    subtitle: 'Notificações cuidam do lembrete que hoje é feito manualmente por WhatsApp.',
    icon: { library: 'MaterialCommunityIcons', name: 'bell-ring-outline' } as const,
    colorToken: 'secondary' as const,
  },
  {
    category: 'TUDO NUM SÓ LUGAR',
    title: 'Tudo num só lugar',
    subtitle: 'Ministérios, voluntários, escala e repertório no mesmo app.',
    icon: { library: 'MaterialCommunityIcons', name: 'view-grid-outline' } as const,
    colorToken: 'primary' as const,
  },
] as const;

// Último passo do carrossel não é uma feature — é a tela de conclusão
// (checkmark + CTAs), substituindo o card de feature nesse slot.
const TOTAL_STEPS = FEATURES.length + 1;

export default function QuizVendasFuncionalidadesPage() {
  const Pallete = usePallete();
  const [stepIndex, setStepIndex] = useState(0);

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const feature = !isLastStep ? FEATURES[stepIndex] : undefined;
  const accentColor = feature ? Pallete[feature.colorToken] : Pallete.primary;

  const proxima = () => {
    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const voltar = () => {
    if (isFirstStep) {
      router.back();
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  return (
    <QuizFlatLayout
      onPressBack={voltar}
      footer={
        isLastStep ? (
          <>
            <FancyButton
              label='Criar minha conta'
              onPress={() => router.push('/(auth)/create-account')}
              labelStyle={{ color: Pallete.fonts.light }}
              containerStyle={{ backgroundColor: Pallete.terciary }}
            />
            <FancyButton
              type='outlined'
              label='Já tenho conta'
              onPress={() => router.push('/(auth)/login')}
            />
          </>
        ) : (
          <View style={styles.paginationRow}>
            <FancyButton
              type='outlined'
              label='Voltar'
              onPress={voltar}
              containerStyle={styles.paginationButton}
            />
            <FancyButton
              label='Próxima'
              onPress={proxima}
              containerStyle={styles.paginationButton}
            />
          </View>
        )
      }
    >
      {!isLastStep && (
        <FancyText
          size='extraSmall'
          type='bold'
          color={Pallete.fonts.inactive}
          style={styles.header}
        >
          COMO O DIAKONIA RESOLVE
        </FancyText>
      )}

      <QuizSegmentedProgress totalSteps={TOTAL_STEPS} currentStep={stepIndex} />

      {isLastStep ? (
        <View style={styles.conclusionBlock}>
          <View
            style={[
              styles.checkCircle,
              { backgroundColor: ColorUtils.withAlpha(Pallete.confirm, 0.12) },
            ]}
          >
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='check-circle-outline'
              size={48}
              color={Pallete.confirm}
            />
          </View>
          <FancyText
            size='medium'
            type='bold'
            color={Pallete.fonts.dark}
            style={styles.conclusionText}
          >
            Pronto pra recuperar esse tempo?
          </FancyText>
          <FancyText size='small' color={Pallete.fonts.inactive} style={styles.conclusionText}>
            Crie sua conta e comece a organizar sua escala em minutos.
          </FancyText>
        </View>
      ) : (
        <>
          <QuizIllustrationPlaceholder icon={feature!.icon} accentColor={accentColor} />

          <View style={styles.textBlock}>
            <FancyText size='extraSmall' type='bold' color={accentColor} style={styles.category}>
              {feature!.category}
            </FancyText>
            <FancyText size='medium' type='bold' color={Pallete.fonts.dark}>
              {feature!.title}
            </FancyText>
            <FancyText size='small' color={Pallete.fonts.inactive}>
              {feature!.subtitle}
            </FancyText>
          </View>
        </>
      )}
    </QuizFlatLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    letterSpacing: 0.5,
  },
  textBlock: {
    gap: 4,
  },
  category: {
    letterSpacing: 0.5,
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paginationButton: {
    flex: 1,
  },
  conclusionBlock: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 24,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  conclusionText: {
    textAlign: 'center',
  },
});
