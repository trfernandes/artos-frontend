import { useCallback, useMemo, useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Condition,
  DynamicQuery,
  Operator,
  OrderDirection,
  ValueType,
} from '../../../../../domain/utils/query_utils';
import {
  HierarquiaEnum,
  HierarquiaEnumLabel,
} from '../../../../../domain/models/MinisterioVoluntario';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyLoading from '../../../../../components/FancyLoading';
import { Voluntario } from '../../../../../domain/models/Voluntario';

export default function MinisterioIntegrantesIndex() {
  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const [searchText, setSearchText] = useState('');

  const params = useMemo(() => {
    if (!ministerioId) return undefined;

    const searchCondition: Condition | undefined =
      searchText && searchText.trim() !== ''
        ? {
            path: 'voluntario.nome',
            operator: Operator.ILIKE,
            value: { type: ValueType.LITERAL, value: searchText },
          }
        : undefined;

    return {
      where: {
        conditions: [
          {
            path: 'ministerio.id',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL as const, value: ministerioId },
          },
          // {
          //   path: 'hierarquia',
          //   operator: Operator.EQUALS,
          //   value: { type: ValueType.LITERAL, value: HierarquiaEnum.Voluntario },
          // },
          ...(searchCondition ? [searchCondition] : []),
        ],
      },
      relations: ['voluntario', 'ministerio'],
      orderBy: [{ path: 'voluntario.nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [ministerioId, searchText]);

  const {
    data: integrantesData,
    add: addIntegrante,
    remove: removeIntegrante,
    isLoading,
    isLoadingMutation,
  } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams: params,
  });

  const handleConfirm = useCallback((data: Voluntario) => {
    addIntegrante({
      voluntarioId: data.id!,
      ministerioId: ministerioId!,
      hierarquia: HierarquiaEnum.Voluntario,
    });
  }, []);

  if (isLoading || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () =>
          router.push({ pathname: '/ministerios/integrantes/add', params: { ministerioId } }),
      }}
      showSearchBar
      searchBarProps={{
        value: searchText,
        onSearch: text => setSearchText(text.trim()),
      }}
      listProps={{
        data: integrantesData,
        renderItem: ({ item }) => (
          <FancyCard.Image
            type="image"
            props={{
              title: item.voluntario?.nome,
              subtitle: item.voluntario?.email,
              additionalData1: HierarquiaEnumLabel[item.hierarquia],
              source:
                item.voluntario?.foto ??
                require('../../../../../assets/images/empty_profile_image.png'),
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 17 },
                  onPress: () => {
                    router.push({
                      pathname: '/ministerios/integrantes/edit',
                      params: {
                        ministerioId: ministerioId,
                        ministerioVoluntarioId: item.id,
                        voluntarioId: item.voluntarioId || item.voluntario?.id!,
                      },
                    });
                  },
                },
                {
                  icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error },
                  onPress: () => {
                    FancyAlert.alert(
                      'Confirmação',
                      `Deseja remover "${item.voluntario?.nome}" do ministério?`,
                      [
                        { text: 'Cancelar', style: 'default' },
                        {
                          text: 'Remover',
                          style: 'destructive',
                          onPress: async () => {
                            await removeIntegrante(item.id!);
                          },
                        },
                      ]
                    );
                  },
                },
              ],
            }}
          />
        ),
      }}
    >
      {/* {formModalVisible.visible && (
        <AddIntegranteModal
          title="Novo Integrante"
          ministerioId={ministerioId}
          onClose={() => setFormModalVisible({ ...formModalVisible, visible: false })}
          onConfirm={data => data && handleConfirm(data!)}
        />
      )} */}
    </FancyListPage>
  );
}
