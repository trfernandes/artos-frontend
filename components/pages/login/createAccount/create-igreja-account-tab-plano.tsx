import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFormContext } from 'react-hook-form';
import FancyText from '../../../FancyText';
import FancyTabHeaderItem from '../../../tabs/FancyTabHeaderItem';
import DefaultIcons from '../../../FancyIcons';
import { usePallete } from '../../../../hooks/usePallete';
import { useThemedStyles } from '../../../../hooks/useThemedStyles';
import { ThemePalette } from '../../../../constants/colors';
import { ColorUtils } from '../../../../utils/color_utils';
import {
  BILLING_PLAN_OPTIONS,
  BillingCycleCode,
} from '../../../../domain/utils/billing-plan-catalog';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';

const PLAN_THEME = {
  avaliacao: {
    color: '#3B82F6',
    icon: 'flask-outline',
  },
  starter: {
    color: '#5B5CE6',
    icon: 'rocket-launch-outline',
  },
  essencial: {
    color: '#27A744',
    icon: 'star-four-points-outline',
  },
  crescimento: {
    color: '#FF7A30',
    icon: 'chart-line-variant',
  },
} as const;

const CARD_GAP = 0;
const AVALIACAO_CARD_KEY = 'avaliacao';

function resolvePlanPrice(monthlyPrice: string, yearlyPrice: string, cycle: BillingCycleCode) {
  return cycle === 'YEARLY' ? yearlyPrice : monthlyPrice;
}

function resolvePlanPriceParts(priceLabel: string, cycle: BillingCycleCode) {
  const suffix = cycle === 'YEARLY' ? 'ano' : 'mês';
  const normalizedValue = priceLabel.replace(/\/\s*(mês|ano)$/i, '').trim();
  return {
    main: `${normalizedValue}/`,
    suffix,
  };
}

function resolveBenefitLines(
  maxVolunteers: number,
  maxMinistries: number,
  cycle: BillingCycleCode,
) {
  return [
    `Até ${maxVolunteers} voluntários`,
    `Até ${maxMinistries} ministérios`,
    `Cobrança ${cycle === 'YEARLY' ? 'anual' : 'mensal'}`,
    '14 dias de teste',
  ];
}

export default function CreateIgrejaAccountTabPlano() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { width: windowWidth } = useWindowDimensions();
  const { watch, setValue } = useFormContext<LoginCreateIgrejaFormData>();
  const planoSelecionado = watch('plano');
  const cicloSelecionado = watch('ciclo');
  const modoCadastroPlano = watch('modoCadastroPlano');
  const cards = useMemo(
    () => [
      {
        key: AVALIACAO_CARD_KEY,
        type: 'avaliacao' as const,
      },
      ...BILLING_PLAN_OPTIONS.map((option) => ({
        key: option.codigo,
        type: 'plano' as const,
        option,
      })),
    ],
    [],
  );
  const selectedIndex = useMemo(
    () =>
      modoCadastroPlano === 'avaliacao'
        ? 0
        : Math.max(
            1,
            BILLING_PLAN_OPTIONS.findIndex((option) => option.codigo === planoSelecionado) + 1,
          ),
    [modoCadastroPlano, planoSelecionado],
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [viewportWidth, setViewportWidth] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const resolvedViewportWidth = viewportWidth || windowWidth;
  const cardWidth = Math.max(0, resolvedViewportWidth);

  useEffect(() => {
    setActiveIndex(selectedIndex);
    scrollRef.current?.scrollTo({
      x: selectedIndex * (cardWidth + CARD_GAP),
      animated: false,
    });
  }, [selectedIndex, cardWidth]);

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({
      x: index * (cardWidth + CARD_GAP),
      animated: true,
    });
    setActiveIndex(index);
  };

  const handlePlanSelect = (planCode: LoginCreateIgrejaFormData['plano'], index: number) => {
    setValue('modoCadastroPlano', 'plano', { shouldDirty: true, shouldValidate: true });
    setValue('plano', planCode, { shouldDirty: true, shouldValidate: true });
    scrollToIndex(index);
  };

  const handleSelectAvaliacao = (index: number) => {
    setValue('modoCadastroPlano', 'avaliacao', { shouldDirty: true, shouldValidate: true });
    scrollToIndex(index);
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (cardWidth + CARD_GAP));
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FancyText type='bold' size='medium'>
          Escolha o plano da sua igreja
        </FancyText>
        <FancyText size='extraSmall' color={palette.fonts.inactive}>
          Defina como a sua igreja vai começar no app.
        </FancyText>
      </View>

      <View style={styles.cycleTabs}>
        <FancyTabHeaderItem
          title='Mensal'
          status={cicloSelecionado === 'MONTHLY' ? 'active' : 'inactive'}
          onPress={() => setValue('ciclo', 'MONTHLY', { shouldDirty: true, shouldValidate: true })}
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-month-outline', size: 16 }}
        />
        <FancyTabHeaderItem
          title='Anual'
          status={cicloSelecionado === 'YEARLY' ? 'active' : 'inactive'}
          onPress={() => setValue('ciclo', 'YEARLY', { shouldDirty: true, shouldValidate: true })}
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-star', size: 16 }}
        />
      </View>

      <View
        style={styles.carouselViewport}
        onLayout={(event) => {
          const nextWidth = Math.floor(event.nativeEvent.layout.width);
          setViewportWidth((prev) => (prev === nextWidth ? prev : nextWidth));
        }}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.carouselScroll}
          horizontal
          pagingEnabled
          disableIntervalMomentum
          decelerationRate='fast'
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
          contentContainerStyle={styles.carouselContent}
        >
          {cards.map((card, index) => {
            if (card.type === 'avaliacao') {
              const planTheme = PLAN_THEME.avaliacao;
              const selected = modoCadastroPlano === 'avaliacao';

              return (
                <TouchableOpacity
                  key={card.key}
                  activeOpacity={0.92}
                  onPress={() => handleSelectAvaliacao(index)}
                  style={[
                    styles.planCard,
                    {
                      width: cardWidth,
                      borderColor: selected ? planTheme.color : palette.borderCard,
                      backgroundColor: selected
                        ? ColorUtils.withAlpha(planTheme.color, 0.07)
                        : palette.backgroundColor4,
                    },
                  ]}
                >
                  <View style={styles.headerBlock}>
                    <View style={styles.cardTopRow}>
                      <View
                        style={[
                          styles.planIcon,
                          { backgroundColor: ColorUtils.withAlpha(planTheme.color, 0.12) },
                        ]}
                      >
                        <DefaultIcons.Custom
                          library='MaterialCommunityIcons'
                          name={planTheme.icon}
                          size={14}
                          color={planTheme.color}
                        />
                      </View>

                      <View style={styles.headerContent}>
                        <View style={styles.headerTitleRow}>
                          <FancyText
                            type='bold'
                            size='medium'
                            numberOfLines={2}
                            style={[styles.planName, { color: planTheme.color }]}
                          >
                            Avaliação{'\n'}gratuita
                          </FancyText>

                          <View style={styles.priceColumn}>
                            <FancyText
                              type='bold'
                              size='small'
                              numberOfLines={1}
                              style={[styles.priceValue, { color: planTheme.color }]}
                            >
                              Grátis
                            </FancyText>

                            <FancyText
                              size='extraSmall'
                              type='semiBold'
                              numberOfLines={1}
                              style={[styles.priceCycle, { color: planTheme.color }]}
                            >
                              por 14 dias
                            </FancyText>
                          </View>
                        </View>

                        <View style={styles.headerMetaRow} />
                      </View>
                    </View>
                  </View>

                  <View style={styles.contentBlock}>
                    <FancyText
                      size='extraSmall'
                      color={palette.fonts.inactive}
                      style={styles.description}
                    >
                      Comece a usar o app agora e escolha um plano depois, quando fizer sentido para a igreja.
                    </FancyText>

                    <View style={[styles.divider, { backgroundColor: palette.borderCard }]} />

                    <View style={styles.featureList}>
                      {[
                        'Nenhum pagamento agora',
                        '14 dias para explorar o app',
                        'Você escolhe o plano depois',
                        'Fluxo ideal para conhecer a operação',
                      ].map((item) => (
                        <View key={`${card.key}-${item}`} style={styles.featureItem}>
                          <View
                            style={[
                              styles.featureDot,
                              { backgroundColor: ColorUtils.withAlpha(planTheme.color, 0.16) },
                            ]}
                          >
                            <View
                              style={[
                                styles.featureDotInner,
                                { backgroundColor: planTheme.color },
                              ]}
                            />
                          </View>
                          <FancyText size='extraSmall' style={styles.featureText} numberOfLines={1}>
                            {item}
                          </FancyText>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View
                    style={[
                      styles.planAction,
                      {
                        backgroundColor: selected
                          ? planTheme.color
                          : ColorUtils.withAlpha(planTheme.color, 0.12),
                      },
                    ]}
                  >
                    <FancyText
                      size='small'
                      type='semiBold'
                      style={{ color: selected ? palette.fonts.light : planTheme.color }}
                    >
                      {selected ? 'Selecionado' : 'Começar em avaliação'}
                    </FancyText>
                  </View>
                </TouchableOpacity>
              );
            }

            const option = card.option;
            const planTheme = PLAN_THEME[option.codigo];
            const selected = modoCadastroPlano === 'plano' && planoSelecionado === option.codigo;
            const priceLabel = resolvePlanPrice(option.monthlyPrice, option.yearlyPrice, cicloSelecionado);
            const priceParts = resolvePlanPriceParts(priceLabel, cicloSelecionado);
            const benefitLines = resolveBenefitLines(
              option.maxVolunteers,
              option.maxMinistries,
              cicloSelecionado,
            );

            return (
              <TouchableOpacity
                key={option.codigo}
                activeOpacity={0.92}
                onPress={() => handlePlanSelect(option.codigo, index)}
                style={[
                  styles.planCard,
                  {
                    width: cardWidth,
                    borderColor: selected ? planTheme.color : palette.borderCard,
                    backgroundColor: selected
                      ? ColorUtils.withAlpha(planTheme.color, 0.07)
                      : palette.backgroundColor4,
                  },
                ]}
              >
                <View style={styles.headerBlock}>
                  {option.highlight ? (
                    <View
                      style={[
                        styles.highlightPill,
                        { backgroundColor: ColorUtils.withAlpha(planTheme.color, 0.1) },
                      ]}
                    >
                      <FancyText
                        size='extraSmall'
                        type='semiBold'
                        numberOfLines={1}
                        style={{ color: planTheme.color }}
                      >
                        {option.highlight}
                      </FancyText>
                    </View>
                  ) : null}

                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.planIcon,
                        { backgroundColor: ColorUtils.withAlpha(planTheme.color, 0.12) },
                      ]}
                    >
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name={planTheme.icon}
                        size={14}
                        color={planTheme.color}
                      />
                    </View>

                    <View style={styles.headerContent}>
                      <View style={styles.headerTitleRow}>
                        <FancyText
                          type='bold'
                          size='medium'
                          numberOfLines={1}
                          style={[styles.planName, { color: planTheme.color }]}
                        >
                          {option.nome}
                        </FancyText>

                        <View style={styles.priceColumn}>
                          <FancyText
                            type='bold'
                            size='small'
                            numberOfLines={1}
                            style={[styles.priceValue, { color: planTheme.color }]}
                          >
                            {priceParts.main}
                          </FancyText>

                          <FancyText
                            size='extraSmall'
                            type='semiBold'
                            numberOfLines={1}
                            style={[styles.priceCycle, { color: planTheme.color }]}
                          >
                            {priceParts.suffix}
                          </FancyText>
                        </View>
                      </View>

                      <View style={styles.headerMetaRow} />
                    </View>
                  </View>
                </View>

                <View style={styles.contentBlock}>
                  <FancyText
                    size='extraSmall'
                    color={palette.fonts.inactive}
                    style={styles.description}
                  >
                    {option.descricao}
                  </FancyText>

                  <View style={[styles.divider, { backgroundColor: palette.borderCard }]} />

                  <View style={styles.featureList}>
                    {benefitLines.map((item) => (
                      <View key={`${option.codigo}-${item}`} style={styles.featureItem}>
                        <View
                          style={[
                            styles.featureDot,
                            { backgroundColor: ColorUtils.withAlpha(planTheme.color, 0.16) },
                          ]}
                        >
                          <View style={[styles.featureDotInner, { backgroundColor: planTheme.color }]} />
                        </View>
                        <FancyText size='extraSmall' style={styles.featureText} numberOfLines={1}>
                          {item}
                        </FancyText>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.planAction,
                    {
                      backgroundColor: selected
                        ? planTheme.color
                        : ColorUtils.withAlpha(planTheme.color, 0.12),
                    },
                  ]}
                >
                  <FancyText
                    size='small'
                    type='semiBold'
                    style={{ color: selected ? palette.fonts.light : planTheme.color }}
                  >
                    {selected ? 'Selecionado' : 'Escolher plano'}
                  </FancyText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.pagination}>
        {cards.map((card, index) => {
          const color =
            card.type === 'avaliacao'
              ? PLAN_THEME.avaliacao.color
              : PLAN_THEME[card.option.codigo].color;
          const active = index === activeIndex;
          return (
            <TouchableOpacity
              key={card.key}
              onPress={() => scrollToIndex(index)}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: active ? color : ColorUtils.withAlpha(color, 0.2),
                  width: active ? 18 : 8,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      gap: 10,
      width: '100%',
      flex: 1,
    },
    header: {
      gap: 4,
    },
    cycleTabs: {
      flexDirection: 'row',
      gap: 8,
    },
    carouselContent: {
      alignItems: 'flex-start',
    },
    carouselScroll: {
      flex: 1,
    },
    carouselViewport: {
      width: '100%',
      flex: 1,
      minHeight: 0,
      marginTop: 10,
    },
    planCard: {
      borderWidth: 1.2,
      borderRadius: 22,
      padding: 12,
      gap: 8,
      height: '100%',
      justifyContent: 'space-between',
    },
    headerBlock: {},
    highlightPill: {
      paddingHorizontal: 12,
      paddingVertical: 2,
      borderRadius: 999,
      alignSelf: 'flex-start',
      marginBottom: 6,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    planIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerMetaRow: {
      display: 'none',
    },
    contentBlock: {
      gap: 10,
      flex: 1,
      justifyContent: 'flex-start',
    },
    priceColumn: {
      minWidth: 93,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      gap: 0,
      flexShrink: 0,
    },
    planName: {
      flex: 1,
      lineHeight: 18,
      paddingRight: 2,
    },
    description: {
      lineHeight: 17,
    },
    priceValue: {
      lineHeight: 20,
      textAlign: 'right',
      flexShrink: 0,
    },
    priceCycle: {
      lineHeight: 12,
      flexShrink: 0,
      textAlign: 'right',
      marginTop: -2,
    },
    divider: {
      height: 1,
      opacity: 0.7,
    },
    featureList: {
      gap: 4,
      flexShrink: 0,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    featureDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    featureDotInner: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    featureText: {
      flex: 1,
      lineHeight: 16,
    },
    planAction: {
      borderRadius: 18,
      minHeight: 34,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      marginTop: 6,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    paginationDot: {
      height: 8,
      borderRadius: 999,
    },
  });
}
