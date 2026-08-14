import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { useFocusRefetch } from '../../../../../hooks/useFocusRefetch';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';

import { ThemePalette } from '../../../../../constants/colors';
import FancyChips from '../../../../../components/FancyChips';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyBottomSheetModal from '../../../../../components/modal/FancyBottomSheetModal';
import DefaultIcons from '../../../../../components/FancyIcons';
import {
  EscalaStatusEnum,
  EscalaStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-status.enum';
import { EscalaOrigemEnum } from '../../../../../domain/enums/Escala/escala-origem.enum';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { View } from 'react-native';
import FancyText from '../../../../../components/FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { ResponseEscalaDto } from '../../../../../domain/dtos/Escala/escala.response';
import { useBillingWriteAccess } from '../../../../../hooks/useBillingWriteAccess';
import BillingNoticeBanner from '../../../../../components/billing/BillingNoticeBanner';
import { TutorialBanner } from '../../../../../components/tutorial/TutorialBanner';
import { TutorialOverlay } from '../../../../../components/tutorial/TutorialOverlay';
import { useScreenTutorial } from '../../../../../hooks/useScreenTutorial';
import {
  ESCALAS_LIDER_TOUR_ID,
  ESCALAS_LIDER_TOUR_STEPS,
  ESCALAS_LIDER_TOUR_TITLE,
} from '../../../../../components/tutorial/tours/escalasLiderTour';
import { useJourney } from '../../../../../contexts/JourneyContext';

export function getEscalaStatusConfig(palette: ThemePalette) {
  return {
    [EscalaStatusEnum.Gerando]: {
      label: 'Gerando...',
      color: palette.secondary,
      background: ColorUtils.withAlpha(palette.secondary, 0.14),
    },
    [EscalaStatusEnum.Gerada]: {
      label: 'Gerada',
      color: palette.primary,
      background: ColorUtils.withAlpha(palette.primary, 0.16),
    },
    [EscalaStatusEnum.Publicada]: {
      label: 'Publicada',
      color: palette.warning,
      background: ColorUtils.withAlpha(palette.warning, 0.18),
    },
    [EscalaStatusEnum.Cancelada]: {
      label: 'Cancelada',
      color: palette.fonts.inactive,
      background: ColorUtils.withAlpha(palette.fonts.inactive, 0.12),
    },
    [EscalaStatusEnum.Erro]: {
      label: 'Erro',
      color: palette.error,
      background: ColorUtils.withAlpha(palette.error, 0.14),
    },
  } as const;
}

export default function MinisterioEscalasIndexPage() {
  const palette = usePallete();
  const { ministerioId } = useLocalSearchParams();
  const [searchText, setSearchText] = useState('');
  const [actionsEscala, setActionsEscala] = useState<ResponseEscalaDto | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // reset ao focar (retorno) e também no cleanup (blur ao navegar para frente),
      // garantindo que o overlay "Abrindo escala..." nunca fique preso na tela de detalhes
      setIsNavigating(false);
      return () => setIsNavigating(false);
    }, []),
  );

  const escalaStatusConfig = useMemo(() => getEscalaStatusConfig(palette), [palette]);

  const {
    isBlocked,
    assinatura,
    showBillingBanner,
    billingBlockedMessage,
    abrirPortalDeAssinatura,
  } = useBillingWriteAccess();

  const journey = useJourney();
  const isJourneyStep = journey.currentStep?.tourId === ESCALAS_LIDER_TOUR_ID;
  const tour = useScreenTutorial(
    ESCALAS_LIDER_TOUR_ID,
    ESCALAS_LIDER_TOUR_TITLE,
    ESCALAS_LIDER_TOUR_STEPS,
    { onComplete: isJourneyStep ? journey.advance : undefined },
  );

  useEffect(() => {
    if (isJourneyStep && !tour.isActive && tour.ready) {
      tour.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJourneyStep, tour.ready]);

  const openEscalaDetails = useCallback(
    (escalaId: string) => {
      setIsNavigating(true);
      router.push({
        pathname: '/ministerios/escalas/details',
        params: { ministerioId, escalaId, viewMode: 'edit' },
      });
    },
    [ministerioId],
  );

  const {
    data: escalas,
    remove: removeEscala,
    isLoading: isLoadingEscalas,
    isLoadingMutation: isLoadingEscalasMutation,
    refetch: refetchEscalas,
  } = useEscalasCrud({
    initialParams: {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: {
              type: ValueType.LITERAL,
              value: ministerioId as string,
            },
          },
        ],
      },
      relations: ['itens'],
      orderBy: [{ path: 'dataInicio', direction: OrderDirection.DESC }],
    },
  });

  const { isFocusLoading } = useFocusRefetch(refetchEscalas);

  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [novaEscalaSheetVisible, setNovaEscalaSheetVisible] = useState(false);
  const handlePullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await refetchEscalas();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [refetchEscalas]);

  const handleDeletePress = useCallback(
    (escalaId: string) => {
      FancyAlert.alert('Exclusão', 'Deseja realmente excluir esta escala?', [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removeEscala(escalaId);
          },
        },
      ]);
    },
    [removeEscala],
  );

  const filteredEscalas = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    if (!normalized) return escalas;
    return escalas?.filter((item) => item.nome?.toLowerCase().includes(normalized));
  }, [escalas, searchText]);

  if (isLoadingEscalas) return <FancyLoading label='Carregando...' />;

  const formatPeriodo = (dataInicio: string, dataTermino: string) => {
    const inicio = DateUtilsApi.dateOnlyFromApi(dataInicio).toLocaleDateString('pt-BR');
    const termino = DateUtilsApi.dateOnlyFromApi(dataTermino).toLocaleDateString('pt-BR');
    return `${inicio} - ${termino}`;
  };

  return (
    <FancyListPage
      showFab
      showSearchBar
      contentLoading={isFocusLoading}
      searchBarProps={{
        value: searchText,
        onSearch: (text) => setSearchText(text.trim()),
      }}
      fabProps={{
        disabled: isBlocked,
        onPress: () => {
          if (isBlocked) {
            if (billingBlockedMessage) {
              FancyAlert.alert('Acesso limitado', billingBlockedMessage, [
                { text: 'Ok', style: 'default' },
              ]);
              return;
            }
            FancyAlert.alert(
              'Assinatura inativa',
              'Sua assinatura não está ativa. Escolha um plano para continuar.',
              [
                { text: 'Fechar', style: 'cancel' },
                { text: 'Ver planos', onPress: abrirPortalDeAssinatura },
              ],
            );
            return;
          }
          setNovaEscalaSheetVisible(true);
        },
      }}
      fabTutorialTarget={{
        id: 'escalas-lider-fab',
        registerTarget: tour.registerTarget,
        unregisterTarget: tour.unregisterTarget,
      }}
      topContent={
        (isBlocked && showBillingBanner) || tour.showBanner ? (
          <View style={{ paddingHorizontal: 15, gap: 10 }}>
            {tour.showBanner && <TutorialBanner onStart={tour.start} onDismiss={tour.skip} />}
            {isBlocked && showBillingBanner && (
              <BillingNoticeBanner assinatura={assinatura} onPress={abrirPortalDeAssinatura} />
            )}
          </View>
        ) : undefined
      }
      listProps={{
        onRefresh: handlePullRefresh,
        refreshing: isPullRefreshing,
        listEmptyProps: {
          label: searchText ? 'Nenhuma escala encontrada' : 'Nenhuma escala cadastrada',
          icon: { library: 'MaterialCommunityIcons', name: 'calendar-text-outline', size: 68 },
        },
        data: filteredEscalas,
        renderItem: ({ item }) => {
          const assignedItems = (item.itens ?? []).filter((i) => Boolean(i.voluntarioId));
          const totalCount = assignedItems.length;
          const confirmedCount = assignedItems.filter(
            (i) => i.status === EscalaItemStatusEnum.Confirmado,
          ).length;
          const confirmedPercent =
            totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;
          const itemsWithEvento = (item.itens ?? []).filter((i) => Boolean(i.eventoId));
          const occurrencesCount = new Set(
            itemsWithEvento.map((i) => `${i.eventoId}::${i.dataOcorrencia}`),
          ).size;
          const metaParts: string[] = [];
          if (totalCount > 0) metaParts.push(`${confirmedPercent}% confirmações`);
          if (occurrencesCount > 0) metaParts.push(`${occurrencesCount} eventos`);

          const statusCfg = escalaStatusConfig[item.status];

          return (
            <FancyListItemCard
              onPress={() => openEscalaDetails(item.id)}
              leading={{
                type: 'icon',
                icon: { library: 'MaterialCommunityIcons', name: 'calendar-range', size: 20 },
                color: palette.primary,
                backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
              }}
              title={item.nome}
              meta={
                <View style={{ gap: 3 }}>
                  <FancyText
                    size='extraSmall'
                    type='medium'
                    color={palette.fonts.inactive}
                    numberOfLines={2}
                    style={{ lineHeight: 15, includeFontPadding: false }}
                  >
                    {formatPeriodo(item.dataInicio, item.dataTermino)}
                  </FancyText>
                  {metaParts.length > 0 && (
                    <FancyText
                      size='extraSmall'
                      type='medium'
                      color={palette.fonts.inactive}
                      style={{ lineHeight: 15, includeFontPadding: false }}
                    >
                      {metaParts.join('  ·  ')}
                    </FancyText>
                  )}
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginTop: 4,
                    }}
                  >
                    <FancyChips
                      label={item.origem === EscalaOrigemEnum.Automatica ? 'Auto' : 'Manual'}
                      icon={
                        item.origem === EscalaOrigemEnum.Automatica
                          ? { library: 'MaterialCommunityIcons', name: 'lightning-bolt', size: 10 }
                          : { library: 'MaterialCommunityIcons', name: 'pencil', size: 10 }
                      }
                      color={
                        item.origem === EscalaOrigemEnum.Automatica
                          ? palette.secondary
                          : palette.terciary
                      }
                      backgroundColor={ColorUtils.withAlpha(
                        item.origem === EscalaOrigemEnum.Automatica
                          ? palette.secondary
                          : palette.terciary,
                        0.14,
                      )}
                      size='small'
                    />
                    <FancyChips
                      label={EscalaStatusEnumLabel[item.status]}
                      color={statusCfg.color}
                      backgroundColor={statusCfg.background}
                      size='small'
                      dot
                    />
                  </View>
                </View>
              }
              trailing={{ type: 'menu', onPress: () => setActionsEscala(item) }}
            />
          );
        },
      }}
    >
      <Modal visible={isNavigating} transparent animationType='fade'>
        <View style={[styles.loadingOverlay, { backgroundColor: palette.overlays.backdrop }]}>
          <FancyLoading label='Abrindo escala...' containerStyle={{ flex: 0 }} />
        </View>
      </Modal>

      <FancyActionSheet
        visible={!!actionsEscala}
        onClose={() => setActionsEscala(null)}
        actions={[
          {
            label: 'Editar',
            icon: { ...DefaultIconsNames.edit, size: 16 },
            onPress: () => {
              if (!actionsEscala) return;
              const escalaId = actionsEscala.id;
              setActionsEscala(null);
              openEscalaDetails(escalaId);
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            disabled: isLoadingEscalasMutation,
            icon: { ...DefaultIconsNames.delete, size: 16 },
            onPress: () => actionsEscala?.id && handleDeletePress(actionsEscala.id),
          },
        ]}
      />

      <TutorialOverlay tour={tour} />

      <FancyBottomSheetModal
        visible={novaEscalaSheetVisible}
        onClose={() => setNovaEscalaSheetVisible(false)}
        title='Nova escala'
      >
        <View style={styles.novaEscalaCards}>
          {[
            {
              key: 'auto',
              icon: 'zap' as const,
              color: palette.secondary,
              title: 'Gerar automaticamente',
              description: 'Sistema sugere os voluntários pra você',
              onPress: () =>
                router.push({
                  pathname: '/ministerios/escalas/assistant',
                  params: { ministerioId },
                }),
            },
            {
              key: 'manual',
              icon: 'edit-3' as const,
              color: palette.warning,
              title: 'Criar manualmente',
              description: 'Você escolhe cada voluntário da equipe',
              onPress: () =>
                router.push({ pathname: '/ministerios/escalas/manual', params: { ministerioId } }),
            },
          ].map((option) => (
            <Pressable
              key={option.key}
              style={({ pressed }) => [
                styles.novaEscalaCard,
                { borderColor: palette.border, backgroundColor: palette.backgroundColor2 },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                setNovaEscalaSheetVisible(false);
                requestAnimationFrame(option.onPress);
              }}
              accessibilityRole='button'
              accessibilityLabel={option.title}
            >
              <View
                style={[
                  styles.novaEscalaIcon,
                  { backgroundColor: ColorUtils.withAlpha(option.color, 0.14) },
                ]}
              >
                <DefaultIcons.Custom
                  library='Feather'
                  name={option.icon}
                  size={20}
                  color={option.color}
                />
              </View>
              <View style={styles.novaEscalaTexts}>
                <FancyText type='bold' size='medium' color={palette.fonts.dark}>
                  {option.title}
                </FancyText>
                <FancyText type='medium' size='small' color={palette.fonts.inactive}>
                  {option.description}
                </FancyText>
              </View>
            </Pressable>
          ))}
        </View>
      </FancyBottomSheetModal>
    </FancyListPage>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  novaEscalaCards: {
    gap: 12,
    marginBottom: 8,
  },
  novaEscalaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  novaEscalaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  novaEscalaTexts: {
    flex: 1,
    gap: 2,
  },
});
