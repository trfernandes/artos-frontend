import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';

import { ThemePalette } from '../../../../../constants/colors';
import FancyChips from '../../../../../components/FancyChips';
import { useCallback, useMemo, useState } from 'react';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import {
  EscalaStatusEnum,
  EscalaStatusEnumLabel,
} from '../../../../../domain/enums/Escala/escala-status.enum';
import { EscalaItemStatusEnum } from '../../../../../domain/enums/Escala/escala-item-status.enum';
import { View } from 'react-native';
import FancyText from '../../../../../components/FancyText';
import DefaultIcons from '../../../../../components/FancyIcons';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';

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
  const escalaStatusConfig = useMemo(() => getEscalaStatusConfig(palette), [palette]);

  const {
    data: escalas,
    remove: removeEscala,
    isLoading: isLoadingEscalas,
    isLoadingMutation: isLoadingEscalasMutation,
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
  if (isLoadingEscalasMutation) return <FancyLoading label='Processando...' />;

  const formatPeriodo = (dataInicio: string, dataTermino: string) => {
    const inicio = new Date(dataInicio).toLocaleDateString('pt-BR');
    const termino = new Date(dataTermino).toLocaleDateString('pt-BR');
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
        onPress: () =>
          router.push({
            pathname: '/ministerios/escalas/assistant',
            params: { ministerioId },
          }),
      }}
      listProps={{
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
          const hasConfirmation = totalCount > 0;
          const hasOccurrences = occurrencesCount > 0;

          return (
            <FancyCard.Image
              type='icon'
              props={{
                centerContainerStyle: { gap: 4 },
                cardIcon: {
                  ...DefaultIconsNames['calendar-day'],
                  size: 18,
                },
                title: item.nome,
                subtitle: (
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}
                  >
                    <View style={{ width: 14, alignItems: 'center', justifyContent: 'center' }}>
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name='calendar-range'
                        size={13}
                        color={palette.primary}
                      />
                    </View>
                    <FancyText size='extraSmall' type='semiBold' color={palette.fonts.inactive}>
                      {formatPeriodo(item.dataInicio, item.dataTermino)}
                    </FancyText>
                  </View>
                ),
                additionalData1:
                  hasConfirmation || hasOccurrences ? (
                    <View style={{ gap: 3 }}>
                      {hasConfirmation && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View
                            style={{ width: 14, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <DefaultIcons.Custom
                              library='MaterialCommunityIcons'
                              name='account-check-outline'
                              size={15}
                              color={palette.primary}
                            />
                          </View>
                          <FancyText
                            size='extraSmall'
                            type='semiBold'
                            color={palette.fonts.inactive}
                          >
                            {`${confirmedPercent}% confirmações`}
                          </FancyText>
                        </View>
                      )}
                      {hasOccurrences && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View
                            style={{ width: 14, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <DefaultIcons.Custom
                              library='MaterialCommunityIcons'
                              name='calendar-multiple'
                              size={12}
                              color={palette.primary}
                            />
                          </View>
                          <FancyText
                            size='extraSmall'
                            type='semiBold'
                            color={palette.fonts.inactive}
                          >
                            {`${occurrencesCount} eventos`}
                          </FancyText>
                        </View>
                      )}
                    </View>
                  ) : undefined,
                additionalData2: (
                  <View style={{ marginTop: 6 }}>
                    <FancyChips
                      {...escalaStatusConfig[item.status]}
                      label={EscalaStatusEnumLabel[item.status]}
                      size='small'
                    />
                  </View>
                ),
                actionButtons: [
                  {
                    icon: {
                      ...DefaultIconsNames.edit,
                      size: 16,
                      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.88),
                    },
                    size: 'medium',
                    onPress: () => {
                      router.push({
                        pathname: '/ministerios/escalas/details',
                        params: {
                          ministerioId,
                          escalaId: item.id,
                          viewMode: 'edit',
                        },
                      });
                    },
                  },
                  {
                    icon: {
                      ...DefaultIconsNames.delete,
                      size: 16,
                      backgroundColor: ColorUtils.withAlpha(palette.error, 0.92),
                    },
                    size: 'medium',
                    onPress: () => handleDeletePress(item.id!),
                  },
                ],
              }}
            />
          );
        },
      }}
    />
  );
}
