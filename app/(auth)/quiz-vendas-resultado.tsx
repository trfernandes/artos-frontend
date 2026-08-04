import { useEffect } from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import DefaultIcons from '../../components/FancyIcons';
import QuizFlatLayout from '../../components/quiz/QuizFlatLayout';
import { useLoading } from '../../contexts/LoadingContext';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
import { AppImages } from '../../assets/app_images';
import { QUIZ_VENDAS_BUCKET_COPY, QuizVendasBucket } from '../../constants/quizVendas';
import { DefaultIconsNames } from '../../constants/icons';

const BUCKET_IMAGE: Record<QuizVendasBucket, ImageSourcePropType> = {
  SO_FALTA_ORGANIZAR: AppImages.quizResultadoSoFaltaOrganizar,
  NO_LIMITE: AppImages.quizResultadoNoLimite,
  SOBRECARREGADO: AppImages.quizResultadoSobrecarregado,
};

const TEMPO_PERDIDO_METRICAS = [
  { label: 'Montar escala', horas: 8 },
  { label: 'Trocas de última hora', horas: 5 },
  { label: 'Cobrar confirmação', horas: 4 },
  { label: 'Mensagens no grupo', horas: 3 },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 260;
const DIAGONAL_CUT_HEIGHT = 40;

const DONUT_SIZE = 128;
const DONUT_STROKE = 18;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function formatDecimal(valor: number) {
  return valor % 1 === 0 ? String(valor) : valor.toFixed(1).replace('.', ',');
}

export default function QuizVendasResultadoPage() {
  const Pallete = usePallete();
  const insets = useSafeAreaInsets();
  const { hideLoading } = useLoading();
  const params = useLocalSearchParams<{ bucket: QuizVendasBucket; pontuacaoTotal: string }>();

  const bucketInfo = params.bucket ? QUIZ_VENDAS_BUCKET_COPY[params.bucket] : undefined;

  useEffect(() => {
    if (!bucketInfo) {
      router.replace('/(auth)/quiz-vendas');
      return;
    }
    hideLoading();
  }, [bucketInfo]);

  if (!bucketInfo || !params.bucket) return null;

  const donutColors = [Pallete.error, Pallete.terciary, Pallete.warning, Pallete.secondary];
  const totalHoras = TEMPO_PERDIDO_METRICAS.reduce((soma, m) => soma + m.horas, 0);
  const diasPerdidosSemana = totalHoras / 8;
  const diasPerdidosAno = (totalHoras * 52) / 8;

  let anguloAcumulado = 0;
  const donutSegments = TEMPO_PERDIDO_METRICAS.map((metrica, index) => {
    const fatia = (metrica.horas / totalHoras) * DONUT_CIRCUMFERENCE;
    const segmento = {
      ...metrica,
      color: donutColors[index % donutColors.length],
      strokeDasharray: `${fatia} ${DONUT_CIRCUMFERENCE - fatia}`,
      strokeDashoffset: -anguloAcumulado,
    };
    anguloAcumulado += fatia;
    return segmento;
  });

  return (
    <QuizFlatLayout
      showBackButton={false}
      hero={
        <View style={styles.heroWrap}>
          <Image source={BUCKET_IMAGE[params.bucket]} style={styles.heroImage} resizeMode='cover' />
          <Svg width={SCREEN_WIDTH} height={DIAGONAL_CUT_HEIGHT} style={styles.diagonalCut}>
            <Path
              d={`M0,${DIAGONAL_CUT_HEIGHT} L${SCREEN_WIDTH},0 L${SCREEN_WIDTH},${DIAGONAL_CUT_HEIGHT} Z`}
              fill={Pallete.backgroundColor}
            />
          </Svg>
          <FancyButton
            mode='icon'
            icon={{ ...DefaultIconsNames['arrow-left'], color: Pallete.icons.dark, size: 18 }}
            size={40}
            onPress={() => router.back()}
            containerStyle={[
              styles.backButtonOverlay,
              { top: insets.top + 8, backgroundColor: ColorUtils.withAlpha(Pallete.backgroundColor, 0.85) },
            ]}
          />
        </View>
      }
      footer={
        <FancyButton
          label='Quero resolver isso'
          onPress={() => router.push({ pathname: '/(auth)/quiz-vendas-funcionalidades', params: { bucket: params.bucket } })}
          labelStyle={{ color: Pallete.fonts.light }}
          containerStyle={{ backgroundColor: Pallete.terciary }}
        />
      }
    >
      <View style={styles.body}>
        <View style={styles.diagnosticoContainer}>
          <FancyText
            size={22}
            type='bold'
            color={Pallete.terciary}
            style={styles.diagnosticoStatus}
          >
            {bucketInfo.tag.toUpperCase()}
          </FancyText>
          <FancyText size='small' type='medium' color={Pallete.fonts.inactive}>
            seu diagnóstico
          </FancyText>

          <View
            style={[
              styles.horasWrap,
              { backgroundColor: ColorUtils.withAlpha(Pallete.error, 0.1) },
            ]}
          >
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='clock-alert-outline'
              size={20}
              color={Pallete.error}
            />
            <FancyText size='medium' type='bold' color={Pallete.error}>
              {totalHoras}h perdidas por semana
            </FancyText>
          </View>
        </View>

        <FancyText size='small' color={Pallete.fonts.dark} style={styles.copy}>
          {bucketInfo.copy}
        </FancyText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: ColorUtils.withAlpha(Pallete.error, 0.06),
              borderColor: ColorUtils.withAlpha(Pallete.error, 0.2),
            },
          ]}
        >
          <FancyText size='extraSmall' type='bold' color={Pallete.error} style={styles.cardLabel}>
            ONDE SEU TEMPO SOME TODA SEMANA
          </FancyText>

          <View style={styles.donutRow}>
            <View style={styles.donutWrap}>
              <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
                {donutSegments.map((segmento) => (
                  <Circle
                    key={segmento.label}
                    cx={DONUT_SIZE / 2}
                    cy={DONUT_SIZE / 2}
                    r={DONUT_RADIUS}
                    stroke={segmento.color}
                    strokeWidth={DONUT_STROKE}
                    strokeDasharray={segmento.strokeDasharray}
                    strokeDashoffset={segmento.strokeDashoffset}
                    fill='none'
                    rotation={-90}
                    origin={`${DONUT_SIZE / 2}, ${DONUT_SIZE / 2}`}
                  />
                ))}
              </Svg>
              <View style={styles.donutCenter}>
                <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                  {totalHoras}h
                </FancyText>
                <FancyText size='extraSmall' color={Pallete.fonts.inactive}>
                  por semana
                </FancyText>
              </View>
            </View>

            <View style={styles.metricasList}>
              {donutSegments.map((metrica) => (
                <View key={metrica.label} style={styles.metricaRow}>
                  <View style={[styles.metricaDot, { backgroundColor: metrica.color }]} />
                  <FancyText size='extraSmall' color={Pallete.fonts.dark} style={styles.metricaLabel}>
                    {metrica.label}
                  </FancyText>
                  <FancyText size='extraSmall' type='bold' color={Pallete.fonts.dark}>
                    {metrica.horas}h
                  </FancyText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.dramaBox}>
            <FancyText size='small' color={Pallete.fonts.dark}>
              Isso equivale a{' '}
              <FancyText size='small' type='bold' color={Pallete.error}>
                {formatDecimal(diasPerdidosSemana)} dias de trabalho
              </FancyText>{' '}
              perdidos toda semana.
            </FancyText>
            <FancyText size='small' color={Pallete.fonts.dark}>
              Em 1 ano, isso soma{' '}
              <FancyText size='small' type='bold' color={Pallete.error}>
                {formatDecimal(diasPerdidosAno)} dias
              </FancyText>{' '}
              perdidos com tarefas que poderiam ser automáticas.
            </FancyText>
          </View>
        </View>

        <View
          style={[styles.tipBox, { backgroundColor: ColorUtils.withAlpha(Pallete.primary, 0.08) }]}
        >
          <DefaultIcons.Custom
            library='MaterialCommunityIcons'
            name='lightbulb-on-outline'
            size={22}
            color={Pallete.primary}
          />
          <FancyText size='small' color={Pallete.fonts.dark} style={styles.tipText}>
            Com o Diakonia, sua equipe fica alinhada e você recupera o tempo que importa.
          </FancyText>
        </View>
      </View>
    </QuizFlatLayout>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    width: '100%',
  },
  backButtonOverlay: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  diagonalCut: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  body: {
    gap: 16,
    paddingTop: 4,
  },
  diagnosticoContainer: {
    alignItems: 'center',
    gap: 4,
  },
  diagnosticoStatus: {
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  horasWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  copy: {
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardLabel: {
    letterSpacing: 0.5,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  donutWrap: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  metricasList: {
    flex: 1,
    gap: 10,
  },
  metricaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  metricaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  metricaLabel: {
    flex: 1,
  },
  dramaBox: {
    gap: 6,
    paddingTop: 4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    padding: 14,
  },
  tipText: {
    flex: 1,
  },
});
