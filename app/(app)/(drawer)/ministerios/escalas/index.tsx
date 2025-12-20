import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEscalasCrud } from '../../../../../hooks/useEscalaCrud';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { EscalaStatusEnum, EscalaStatusEnumLabel } from '../../../../../domain/models/Escala';
import { Pallete } from '../../../../../constants/colors';
import FancyChips from '../../../../../components/FancyChips';
import { useCallback } from 'react';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';

export const EscalaStatusConfig = {
  [EscalaStatusEnum.Gerada]: {
    label: 'Gerada',
    color: '#3C8DFF', // Azul frio — indica processo técnico
    background: '#E6F0FF',
  },
  [EscalaStatusEnum.Publicada]: {
    label: 'Publicada',
    color: '#E8B83A', // Verde-água — sensação de ativo e confirmado
    background: '#FFF7E0',
  },
  [EscalaStatusEnum.Concluida]: {
    label: 'Concluída',
    color: '#8E63E8', // Verde oliva frio — indica finalização com sucesso
    background: '#F3EBFF',
  },
} as const;

export default function MinisterioEscalasIndexPage() {
  const { ministerioId } = useLocalSearchParams();

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
            value: { type: ValueType.LITERAL, value: ministerioId as string },
          },
        ],
      },
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
    [removeEscala]
  );

  if (isLoadingEscalas) return <FancyLoading label="Carregando..." />;
  if (isLoadingEscalasMutation) return <FancyLoading label="Processando..." />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () =>
          router.push({
            pathname: '/ministerios/escalas/assistant',
            params: { ministerioId },
          }),
      }}
      listProps={{
        data: escalas,
        renderItem: ({ item }) => (
          <FancyCard.Image
            type="icon"
            props={{
              centerContainerStyle: { gap: 6 },
              cardIcon: { ...DefaultIconsNames['calendar-day'], size: 18 },
              title: item.nome,
              subtitle: `De ${new Date(item.dataInicio).toLocaleDateString()} até ${new Date(
                item.dataTermino
              ).toLocaleDateString()}`,
              additionalData1: (
                <FancyChips {...EscalaStatusConfig[item.status]} label={EscalaStatusEnumLabel[item.status]} />
              ),
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 16 },
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
                  icon: { ...DefaultIconsNames.delete, size: 16, backgroundColor: Pallete.error },
                  onPress: () => handleDeletePress(item.id!),
                },
              ],
            }}
          />
        ),
      }}
    />
  );
}
