import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import DefaultIcons from '../../components/FancyIcons';
import QuizFlatLayout from '../../components/quiz/QuizFlatLayout';
import QuizSegmentedProgress from '../../components/quiz/QuizSegmentedProgress';
import { QUIZ_VENDAS_BUCKET_COPY, QuizVendasBucket } from '../../constants/quizVendas';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';

const FEATURE_IMAGE_ASPECT = 768 / 1024;

const VALID_BUCKETS: QuizVendasBucket[] = ['SO_FALTA_ORGANIZAR', 'NO_LIMITE', 'SOBRECARREGADO'];

const FEATURES = [
  {
    category: 'ESCALA AUTOMÁTICA',
    title: 'A escala se monta sozinha',
    subtitle:
      'Diakonia cruza disponibilidade e função de cada voluntário e monta a escala pra você.',
    image: require('../../assets/images/quiz-v2-lavado/funcionalidade-escala-automatica.png'),
  },
  {
    category: 'SEM FURO NA ESCALA',
    title: 'Substituição sem correria',
    subtitle: 'Voluntário indisponível? O app avisa o líder e já sugere quem pode entrar no lugar.',
    image: require('../../assets/images/quiz-v2-lavado/funcionalidade-substituicao-facil.png'),
  },
  {
    category: 'LEMBRETE AUTOMÁTICO',
    title: 'Ninguém esquece a escala',
    subtitle:
      'Notificação automática avisa cada voluntário — acabou o lembrete manual por WhatsApp.',
    image: require('../../assets/images/quiz-v2-lavado/funcionalidade-lembrete-automatico.png'),
  },
  {
    category: 'DISPONIBILIDADE',
    title: 'Avisar que não pode é rápido',
    subtitle:
      'Voluntário marca os dias indisponíveis direto no app, sem precisar avisar ninguém um por um.',
    image: require('../../assets/images/quiz-v2-lavado/funcionalidade-disponibilidade.png'),
  },
  {
    category: 'REPERTÓRIO',
    title: 'Repertório sempre à mão',
    subtitle: 'Músicas, tom e ordem organizados por ministério, prontos pra ensaio.',
    image: require('../../assets/images/quiz-v2-lavado/funcionalidade-repertorio.png'),
  },
] as const;

const CAPA_HEADLINES: Record<QuizVendasBucket, string> = {
  SO_FALTA_ORGANIZAR: 'Você já tem boa vontade.\nFalta a ferramenta certa.',
  NO_LIMITE: 'Você não deveria trabalhar\nmais que o necessário.',
  SOBRECARREGADO: 'Você merece um sistema\nque trabalha por você.',
};

const CAPA_IMAGES: Record<QuizVendasBucket, number> = {
  SO_FALTA_ORGANIZAR: require('../../assets/images/quiz-v2-lavado/capa-so-falta-organizar.png'),
  NO_LIMITE: require('../../assets/images/quiz-v2-lavado/capa-no-limite.png'),
  SOBRECARREGADO: require('../../assets/images/quiz-v2-lavado/capa-sobrecarregado.png'),
};

const CONCLUSAO_IMAGE = require('../../assets/images/quiz-v2-lavado/funcionalidade-conclusao.png');

// Step 0 = capa, Steps 1–5 = features, Step 6 = conclusão
const TOTAL_STEPS = FEATURES.length + 2;

export default function QuizVendasFuncionalidadesPage() {
  const Pallete = usePallete();
  const [stepIndex, setStepIndex] = useState(0);

  const params = useLocalSearchParams<{ bucket?: string }>();
  const bucket: QuizVendasBucket = VALID_BUCKETS.includes(params.bucket as QuizVendasBucket)
    ? (params.bucket as QuizVendasBucket)
    : 'SO_FALTA_ORGANIZAR';

  const isCapaStep = stepIndex === 0;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  const isFeatureStep = !isCapaStep && !isLastStep;
  const feature = isFeatureStep ? FEATURES[stepIndex - 1] : undefined;
  const bucketCopy = QUIZ_VENDAS_BUCKET_COPY[bucket];

  const bucketAccent =
    bucket === 'SOBRECARREGADO'
      ? Pallete.error
      : bucket === 'NO_LIMITE'
        ? Pallete.warning
        : Pallete.confirm;

  const stepColors = [
    bucketAccent, // step 0 — caos máximo
    Pallete.terciary, // step 1 — laranja, esfriando
    Pallete.warning, // step 2 — âmbar, ainda tenso
    Pallete.secondary, // step 3 — roxo, cruzamento quente↔frio
    Pallete.primary, // step 4 — azul, estruturado
    Pallete.confirm, // step 5 — verde, resolvido
    Pallete.confirm, // step 6 — paz
  ];
  const accentColor = stepColors[stepIndex];
  const prevAccentColor = stepColors[Math.max(0, stepIndex - 1)];

  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [stepIndex, slideAnim]);
  const slideStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
      },
    ],
  };

  const proxima = () => {
    if (!isLastStep) setStepIndex((p) => p + 1);
  };

  const voltar = () => {
    if (isCapaStep) {
      router.back();
      return;
    }
    setStepIndex((p) => p - 1);
  };

  const heroImage = (
    <Animated.View style={[slideStyle, (isFeatureStep || isLastStep) && styles.heroFill]}>
      {isCapaStep && (
        <View style={styles.heroImageBox}>
          <Image
            source={CAPA_IMAGES[bucket]}
            style={[StyleSheet.absoluteFillObject, styles.heroImage]}
            resizeMode='contain'
          />
          <LinearGradient
            colors={['transparent', Pallete.backgroundColor]}
            locations={[0.82, 0.99]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}
      {(isFeatureStep || isLastStep) && (
        <View style={styles.heroImageBox}>
          <Image
            source={isLastStep ? CONCLUSAO_IMAGE : feature!.image}
            style={[StyleSheet.absoluteFillObject, styles.heroImage]}
            resizeMode='contain'
          />
          <LinearGradient
            colors={['transparent', Pallete.backgroundColor]}
            locations={[0.82, 0.99]}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}
    </Animated.View>
  );

  return (
    <QuizFlatLayout
      onPressBack={voltar}
      heroFlex={false}
      hero={heroImage}
      heroOverlay={
        <QuizSegmentedProgress
          totalSteps={TOTAL_STEPS}
          currentStep={stepIndex}
          activeGradient={[prevAccentColor, accentColor]}
        />
      }
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
              type='text'
              label='Já tenho conta'
              onPress={() => router.push('/(auth)/login')}
            />
          </>
        ) : (
          <FancyButton
            label={isCapaStep ? 'Ver a solução' : 'Próxima'}
            onPress={proxima}
            containerStyle={{ backgroundColor: accentColor }}
          />
        )
      }
    >
      {isCapaStep && (
        <Animated.View style={[styles.capaCard, slideStyle]}>
          <View style={[styles.pill, { backgroundColor: ColorUtils.withAlpha(bucketAccent, 0.2) }]}>
            <FancyText size='extraSmall' type='bold' color={bucketAccent} style={styles.pillText}>
              {bucketCopy.tag.toUpperCase()}
            </FancyText>
          </View>
          <FancyText
            size='large'
            type='bold'
            color={Pallete.fonts.dark}
            style={styles.capaHeadline}
          >
            {CAPA_HEADLINES[bucket]}
          </FancyText>
          <FancyText size='small' color={Pallete.fonts.inactive} style={styles.capaSubtitle}>
            {bucketCopy.copy}
          </FancyText>
        </Animated.View>
      )}

      {isFeatureStep && feature && (
        <Animated.View style={[styles.featureContent, slideStyle]}>
          <FancyText
            size='extraSmall'
            type='bold'
            color={accentColor}
            style={styles.eyebrowCategory}
          >
            {feature.category}
          </FancyText>
          <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
            {feature.title}
          </FancyText>
          <FancyText size='small' color={Pallete.fonts.inactive} style={styles.featureSubtitle}>
            {feature.subtitle}
          </FancyText>
        </Animated.View>
      )}

      {isLastStep && (
        <Animated.View style={[styles.conclusionContent, slideStyle]}>
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='check-circle-outline'
            size={32}
            color={Pallete.confirm}
          />
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
        </Animated.View>
      )}
    </QuizFlatLayout>
  );
}

const styles = StyleSheet.create({
  heroFill: {
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageBox: {
    width: '100%',
    aspectRatio: FEATURE_IMAGE_ASPECT,
    overflow: 'hidden',
  },
  capaHeadline: {
    lineHeight: 28,
  },
  capaSubtitle: {
    lineHeight: 22,
  },
  capaCard: {
    gap: 6,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    letterSpacing: 0.5,
  },
  eyebrowCategory: {
    letterSpacing: 1,
  },
  featureContent: {
    gap: 6,
    paddingBottom: 8,
  },
  featureSubtitle: {
    lineHeight: 22,
    marginTop: 2,
  },
  conclusionContent: {
    flexGrow: 1,
    gap: 8,
    alignItems: 'center',
  },
  conclusionText: {
    textAlign: 'center',
  },
});
