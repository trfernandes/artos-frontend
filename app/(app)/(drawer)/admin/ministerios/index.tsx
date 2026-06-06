import { router } from 'expo-router';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';

import { useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { useCallback, useState } from 'react';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import Toast from 'react-native-toast-message';
import {
  MinisterioStatusEnum,
  MinisterioStatusEnumMap,
  MinisterioStatusLabel,
} from '../../../../../domain/enums/Ministerio/ministerio-status.enum';
import { MinisterioTipoLabel } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyChips from '../../../../../components/FancyChips';
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { usePallete } from '../../../../../hooks/usePallete';
import { ColorUtils } from '../../../../../utils/color_utils';
import { ResponseMinisterioDto } from '../../../../../domain/dtos/Ministerio/ministerio.response';

export default function MinisteriosIndex() {
  const palette = usePallete();
  const { showLoading, hideLoading } = useLoading();
  const { user, updateUser } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [actionsMinisterio, setActionsMinisterio] = useState<ResponseMinisterioDto | null>(null);

  const {
    data,
    update: updateMinisterio,
    remove: removeMinisterio,
    setSearchParams,
    isLoading,
    error,
    refetch,
    isError,
  } = useMinisteriosCrud({
    autoFetch: true,
    initialParams: {
      orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
    },
  });

  const handleChangeStatus = useCallback(
    (ministerioId: string, ministerioNome: string, newStatus: MinisterioStatusEnum) => {
      FancyAlert.alert(
        newStatus === MinisterioStatusEnum.Inativo
          ? 'Desativação de Ministério'
          : 'Ativação de Ministério',
        `Tem certeza que deseja "${newStatus === MinisterioStatusEnum.Inativo ? 'DESATIVAR' : 'ATIVAR'}" o ministério "${ministerioNome}"?`,
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => {
              updateMinisterio?.({
                id: ministerioId,
                data: { status: newStatus },
              })?.then(() => {
                Toast.show({
                  text1: `Ministério ${newStatus === MinisterioStatusEnum.Inativo ? 'desativado' : 'ativado'} com sucesso!`,
                  type: 'success',
                });
              });
            },
          },
        ],
      );
    },
    [updateMinisterio],
  );

  const handleRemoveMinisterio = useCallback(
    (ministerioId: string) => {
      FancyAlert.alert(
        'Excluir definitivamente este ministério?',
        `A exclusão deste ministério é permanente. Todos os vínculos com esse ministério como integrantes, escalas e histórico serão removidos e não poderão ser recuperados. Se você não quiser perder o histórico, use a opção "Desativar" em vez de excluir.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, estou ciente',
            style: 'destructive',
            onPress: () => {
              showLoading('Removendo...');
              Promise.resolve(removeMinisterio?.(ministerioId))
                .then(() => {
                  //Remover ministério do usuário logado, somente após sucesso
                  const hasMinisterio = user?.igrejas?.some((igreja) =>
                    igreja.ministerios?.some((m) => m.id === ministerioId),
                  );
                  if (hasMinisterio && user) {
                    const igrejasAtualizadas = user.igrejas.map((igreja) => ({
                      ...igreja,
                      ministerios: (igreja.ministerios || []).filter((m) => m.id !== ministerioId),
                    }));
                    updateUser({ igrejas: igrejasAtualizadas });
                  }
                })
                .catch(() => {
                  // O toast de erro já é exibido pelo onError do useCrud
                })
                .finally(() => hideLoading());
            },
          },
        ],
      );
    },
    [removeMinisterio, user, updateUser, showLoading, hideLoading],
  );

  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  if (isLoading) {
    return <FancyLoading />;
  }

  return (
    <FancyListPage
      showSearchBar
      fabProps={{ onPress: () => router.push('/admin/ministerios/add') }}
      searchBarProps={{
        value: searchText,
        onSearch: (text) => {
          setSearchText(text.trim());
          if (text && text.trim() !== '') {
            setSearchParams({
              where: {
                conditions: [
                  {
                    path: 'nome',
                    operator: Operator.ILIKE,
                    value: {
                      type: ValueType.LITERAL as const,
                      value: text.trim(),
                    },
                  },
                ],
              },
              orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
            });
          } else {
            setSearchParams({
              orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
            });
          }
        },
      }}
      listProps={{
        onRefresh: refetch,
        listEmptyProps: {
          label: searchText ? 'Nenhum ministério encontrado' : 'Nenhum ministério cadastrado',
          icon: { library: 'MaterialCommunityIcons', name: 'home-group', size: 68 },
        },
        data: data,
        keyExtractor: (item) => item.id,
        renderItem: ({ item, index }) => {
          const status = MinisterioStatusEnumMap[item.status];
          const statusColor =
            status === MinisterioStatusEnum.Ativo ? palette.primary : palette.error;
          return (
            <FancyListItemCard
              title={item.nome}
              subtitle={MinisterioTipoLabel[item.tipo]}
              leading={
                item.logoThumbUrl
                  ? { type: 'image', source: { uri: item.logoThumbUrl } }
                  : {
                      type: 'icon',
                      icon: { library: 'MaterialCommunityIcons', name: 'home-group', size: 19 },
                      color: palette.primary,
                      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.12),
                    }
              }
              meta={
                <FancyChips
                  size='small'
                  label={MinisterioStatusLabel[item.status]}
                  color={statusColor}
                />
              }
              trailing={{ type: 'menu', onPress: () => setActionsMinisterio(item) }}
            />
          );
        },
      }}
    >
      <FancyActionSheet
        visible={!!actionsMinisterio}
        onClose={() => setActionsMinisterio(null)}
        actions={[
          {
            label: 'Editar',
            icon: { ...DefaultIconsNames.edit, size: 18 },
            onPress: () => {
              if (!actionsMinisterio) return;
              showLoading();
              router.push({
                pathname: '/admin/ministerios/edit',
                params: { id: actionsMinisterio.id },
              });
            },
          },
          {
            label:
              actionsMinisterio &&
              MinisterioStatusEnumMap[actionsMinisterio.status] === MinisterioStatusEnum.Ativo
                ? 'Desativar'
                : 'Ativar',
            icon:
              actionsMinisterio &&
              MinisterioStatusEnumMap[actionsMinisterio.status] === MinisterioStatusEnum.Ativo
                ? { library: 'FontAwesome6', name: 'thumbs-down', size: 16 }
                : { library: 'FontAwesome6', name: 'thumbs-up', size: 16 },
            onPress: () => {
              if (!actionsMinisterio) return;
              handleChangeStatus(
                actionsMinisterio.id!,
                actionsMinisterio.nome,
                MinisterioStatusEnumMap[actionsMinisterio.status] === MinisterioStatusEnum.Ativo
                  ? MinisterioStatusEnum.Inativo
                  : MinisterioStatusEnum.Ativo,
              );
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            icon: { library: 'FontAwesome6', name: 'trash-can', size: 16 },
            onPress: () => {
              if (actionsMinisterio) handleRemoveMinisterio(actionsMinisterio.id!);
            },
          },
        ]}
      />
    </FancyListPage>
  );
}
