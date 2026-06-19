import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { DateUtilsApi } from '../../../../../utils/date_utils';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';

import { ThemePalette } from '../../../../../constants/colors';
import FancyChips from '../../../../../components/FancyChips';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Modal, StyleSheet } from 'react-native';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import {
  EscalaStatusEnum,
  EscalaStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-status.enum';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { View } from 'react-native';
import FancyText from '../../../../../components/FancyText';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { ResponseEscalaDto } from '../../../../../domain/dtos/Escala/escala.response';
import { useBillingWriteAccess } from '../../../../../hooks/useBillingWriteAccess';
import BillingNoticeBanner from '../../../../../components/billing/BillingNoticeBanner';

export function getEscalaStatusConfig(palette: ThemePalette) {
  return {
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

  const { isBlocked, assinatura } = useBillingWriteAccess();
  const handleBillingCta = () =>
    router.push({ pathname: '/(app)/(drawer)/configuracoes', params: { tab: 'plano', openPlans: '1' } });

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
    isRefetching: isRefetchingEscalas,
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

  useFocusEffect(
    useCallback(() => {
      refetchEscalas();
    }, [refetchEscalas]),
  );

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
      searchBarProps={{
        value: searchText,
        onSearch: (text) => setSearchText(text.trim()),
      }}
      fabProps={{
        disabled: isBlocked,
        onPress: () => {
          if (isBlocked) {
            FancyAlert.alert(
              'Assinatura inativa',
              'Sua assinatura não está ativa. Escolha um plano para continuar.',
              [
                { text: 'Fechar', style: 'cancel' },
                { text: 'Ver planos', onPress: handleBillingCta },
              ],
            );
            return;
          }
          router.push({ pathname: '/ministerios/escalas/assistant', params: { ministerioId } });
        },
      }}
      topContent={
        isBlocked ? (
          <View style={{ paddingHorizontal: 15 }}>
            <BillingNoticeBanner assinatura={assinatura} onPress={handleBillingCta} />
          </View>
        ) : undefined
      }
      listProps={{
        onRefresh: refetchEscalas,
        refreshing: isRefetchingEscalas,
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
              subtitle={formatPeriodo(item.dataInicio, item.dataTermino)}
              meta={
                metaParts.length > 0 ? (
                  <FancyText size='extraSmall' type='medium' color={palette.fonts.inactive}>
                    {metaParts.join('  ·  ')}
                  </FancyText>
                ) : undefined
              }
              status={
                <FancyChips
                  label={EscalaStatusEnumLabel[item.status]}
                  color={statusCfg.color}
                  backgroundColor={statusCfg.background}
                  size='small'
                  dot
                />
              }
              trailing={{ type: 'menu', onPress: () => setActionsEscala(item) }}
            />
          );
        },
      }}
    >
      <Modal visible={isNavigating} transparent animationType='fade'>
        <View style={styles.loadingOverlay}>
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
    </FancyListPage>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
