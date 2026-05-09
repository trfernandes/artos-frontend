import { useCallback, useMemo, useState } from 'react';
import FuncaoFormModal from '../../../../../components/pages/ministerios/funcoes/FuncaoFormModal';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { useMinisterioFuncoesCrud } from '../../../../../hooks/useMinisterioFuncoesCrud';
import { useLocalSearchParams } from 'expo-router';
import {
    Condition,
    DynamicQuery,
    Operator,
    OrderDirection,
    ValueType,
} from '../../../../../domain/utils/query_utils';

import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyChips from '../../../../../components/FancyChips';
import { ResponseMinisterioFuncaoDto } from '../../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.response';
import {
    MinisterioFuncaoStatusEnum,
    MinisterioFuncaoStatusEnumLabel,
    MinisterioFuncaoStatusEnumMap,
} from '../../../../../domain/enums/MinisterioFuncao/ministerio-funcao-status.enum';
import { CreateMinisterioFuncaoDto } from '../../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.create';
import { UpdateMinisterioFuncaoDto } from '../../../../../domain/dtos/MinisterioFuncao/ministerio-funcao.update';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';

export default function MinisterioFuncoesIndex() {
  const palette = usePallete();
  const [funcaoFormModalParams, setFuncaoFormModalParams] = useState<
    | {
        mode?: 'add' | 'edit';
        editValues?: ResponseMinisterioFuncaoDto;
        visible?: boolean;
      }
    | undefined
  >();
  const [actionsFuncao, setActionsFuncao] = useState<ResponseMinisterioFuncaoDto | null>(null);

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

  const handleConfirm = useCallback(
    ({
      mode,
      data,
    }:
      | { mode: 'add'; data: CreateMinisterioFuncaoDto }
      | { mode: 'edit'; data: UpdateMinisterioFuncaoDto }) => {
      if (mode === 'add') {
        addFuncao?.({
          ministerioId: ministerioId!,
          nome: data.nome!,
          descricao: data.descricao,
          status: data.status!,
        });
      } else if (mode === 'edit') {
        updateFuncao?.({
          id: data.id!,
          data: {
            nome: data.nome,
            descricao: data.descricao,
            status: data.status,
            ministerioId: ministerioId!,
          },
        });
      }
      setFuncaoFormModalParams({ visible: false });
    },
    [ministerioId, addFuncao, updateFuncao],
  );

  const handleDeleteFuncao = useCallback(
    (item: ResponseMinisterioFuncaoDto) => {
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
    [removeFuncao],
  );

  if (isLoading) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () =>
          setFuncaoFormModalParams({ mode: 'add', visible: true, editValues: undefined }),
      }}
      showSearchBar
      searchBarProps={{
        value: searchText,
        onSearch: setSearchText,
      }}
      listProps={{
        listEmptyProps: {
          label: searchText ? 'Nenhuma função encontrada' : 'Nenhuma função cadastrada',
          icon: { library: 'MaterialCommunityIcons', name: 'account-cog-outline', size: 68 },
        },
        data: funcoesList,
        renderItem: ({ item }) => {
          const status = MinisterioFuncaoStatusEnumMap[item.status];
          const statusColor = status === MinisterioFuncaoStatusEnum.Ativo ? palette.primary : palette.error;
          return (
            <FancyListItemCard
              title={item.nome}
              subtitle={item.descricao?.trim() || 'Sem descrição cadastrada'}
              leading={{
                type: 'icon',
                icon: {
                  library: 'MaterialCommunityIcons',
                  name: 'badge-account-outline',
                  size: 19,
                },
                color: statusColor,
                backgroundColor: ColorUtils.withAlpha(statusColor, 0.12),
              }}
              meta={
                <FancyChips
                  size='small'
                  label={MinisterioFuncaoStatusEnumLabel[status]}
                  color={statusColor}
                  style={{ paddingVertical: 1, paddingHorizontal: 6 }}
                />
              }
              trailing={{ type: 'menu', onPress: () => setActionsFuncao(item) }}
            />
          );
        },
      }}
    >
      <FancyActionSheet
        visible={!!actionsFuncao}
        onClose={() => setActionsFuncao(null)}
        actions={[
          {
            label: 'Editar',
            icon: { library: 'MaterialCommunityIcons', name: 'pencil-outline', size: 18 },
            onPress: () => {
              if (!actionsFuncao) return;
              setFuncaoFormModalParams({
                visible: true,
                mode: 'edit',
                editValues: actionsFuncao,
              });
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            icon: { library: 'MaterialCommunityIcons', name: 'trash-can-outline', size: 18 },
            onPress: () => {
              if (actionsFuncao) handleDeleteFuncao(actionsFuncao);
            },
          },
        ]}
      />
      {funcaoFormModalParams && funcaoFormModalParams.visible && (
        <FuncaoFormModal
          title={funcaoFormModalParams.mode === 'edit' ? 'Editar Função' : 'Nova Função'}
          mode={funcaoFormModalParams.mode || 'add'}
          editValues={funcaoFormModalParams.editValues}
          ministerioId={ministerioId!}
          modalProps={{ visible: true }}
          onButton1Press={() => setFuncaoFormModalParams({ visible: false })}
          onButton2Press={(result) => {
            if (result) {
              if (result.mode === 'add') {
                handleConfirm({ mode: 'add', data: result.data as CreateMinisterioFuncaoDto });
              } else {
                handleConfirm({ mode: 'edit', data: result.data as UpdateMinisterioFuncaoDto });
              }
            }
          }}
        />
      )}
    </FancyListPage>
  );
}
