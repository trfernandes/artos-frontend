import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';
import { useCallback, useMemo, useState } from 'react';
import FuncaoFormModal from '../../../../../components/pages/ministerios/funcoes/FuncaoFormModal';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { useLocalSearchParams } from 'expo-router';
import { Condition, DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import {
  MinisterioFuncao,
  MinisterioFuncaoStatusEnum,
  MinisterioFuncaoStatusEnumLabel,
  MinisterioFuncaoStatusEnumMap,
} from '../../../../../domain/models/MinisterioFuncao';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyStatusIndicator from '../../../../../components/FancyStatusIndicator';

export default function MinisterioFuncoesIndex() {
  const [funcaoFormModalParams, setFuncaoFormModalParams] = useState<
    | {
        mode?: 'add' | 'edit';
        editValues?: MinisterioFuncao;
        visible?: boolean;
      }
    | undefined
  >();

  const { ministerioId } = useLocalSearchParams<{ ministerioId?: string }>();

  const [searchText, setSearchText] = useState('');

  const searchParams = useMemo(() => {
    if (!ministerioId) return;

    const searchCondition: Condition | undefined =
      searchText && searchText.trim() !== ''
        ? {
            path: 'nome',
            operator: Operator.ILIKE,
            value: { type: ValueType.LITERAL, value: searchText },
          }
        : undefined;

    return {
      where: {
        conditions: [
          {
            path: 'ministerioId',
            operator: Operator.EQUALS,
            value: { type: ValueType.LITERAL, value: ministerioId },
          },
          ...(searchCondition ? [searchCondition] : []),
        ],
      },
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [ministerioId, searchText]);

  const {
    data: funcoesList,
    remove: removeFuncao,
    add: addFuncao,
    update: updateFuncao,
    isLoading,
    isLoadingMutation,
  } = useMinisterioFuncoesCrud({
    initialParams: searchParams,
    autoFetch: true,
  });

  const handleConfirm = useCallback(({ mode, data }: { mode: 'add' | 'edit'; data: MinisterioFuncao }) => {
    if (mode === 'add') {
      addFuncao({
        ministerioId: ministerioId!,
        nome: data.nome,
        descricao: data.descricao,
        status: data.status,
      });
    } else if (mode === 'edit') {
      updateFuncao({
        id: data.id!,
        data: {
          nome: data.nome,
          descricao: data.descricao,
          status: data.status,
        },
      });
    }
    setFuncaoFormModalParams({ visible: false });
  }, []);

  if (isLoading || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{ onPress: () => setFuncaoFormModalParams({ mode: 'add', visible: true }) }}
      showSearchBar
      searchBarProps={{
        value: searchText,
        onSearch: setSearchText,
      }}
      listProps={{
        data: funcoesList,
        renderItem: ({ item }) => (
          <FancyCard.Image
            type="icon"
            props={{
              title: item.nome,
              subtitle: item.descricao,
              cardIcon: { library: 'FontAwesome6', name: 'person-rays', size: 16 },
              additionalData1: (
                <FancyStatusIndicator
                  value={item.status === MinisterioFuncaoStatusEnum.Ativo}
                  label={MinisterioFuncaoStatusEnumLabel[MinisterioFuncaoStatusEnumMap[item.status]]}
                />
              ),
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 18 },
                  onPress: () => {
                    setFuncaoFormModalParams({ visible: true, mode: 'edit', editValues: item });
                  },
                },
                {
                  icon: { ...DefaultIconsNames.delete, size: 18, backgroundColor: Pallete.error },
                  onPress: () => {
                    FancyAlert.alert('Confirmação', 'Deseja realmente excluir essa função?', [
                      {
                        text: 'Não',
                        style: 'cancel',
                      },
                      {
                        text: 'Sim',
                        style: 'destructive',
                        onPress: async () => {
                          await removeFuncao(item.id!);
                        },
                      },
                    ]);
                  },
                },
              ],
            }}
          />
        ),
      }}
    >
      {funcaoFormModalParams && (
        <FuncaoFormModal
          title="Nova Função"
          mode={funcaoFormModalParams.mode || 'add'}
          editValues={funcaoFormModalParams.editValues!}
          ministerioId={ministerioId!}
          modalProps={{ visible: funcaoFormModalParams.visible ?? true }}
          onButton1Press={() => setFuncaoFormModalParams({ visible: false })}
          OnButton2Press={data => {
            handleConfirm(data!);
          }}
        />
      )}
    </FancyListPage>
  );
}
