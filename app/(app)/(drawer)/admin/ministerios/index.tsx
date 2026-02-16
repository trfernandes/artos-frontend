import { router } from 'expo-router';
import { FancyCard, FancyCardImageBaseProps, IconType, ImageType } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';

import { useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { useCallback, useState } from 'react';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { FancyTextDisplayCard } from '../../../../../components/cards/FancyTextDisplayCard';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import Toast from 'react-native-toast-message';
import { MinisterioStatusEnum, MinisterioStatusEnumMap, MinisterioStatusLabel } from '../../../../../domain/enums/Ministerio/ministerio-status.enum';
import { MinisterioTipoLabel } from '../../../../../domain/enums/Ministerio/ministerio-tipo.enum';
import { useLoading } from '../../../../../contexts/LoadingContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Pallete } from '../../../../../constants/colors';
import FancyChips from '../../../../../components/FancyChips';

export default function MinisteriosIndex() {
  const { showLoading } = useLoading();
  const { user, updateUser } = useAuth();

  const [searchText, setSearchText] = useState('');

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
        newStatus === MinisterioStatusEnum.Inativo ? 'Desativação de Ministério' : 'Ativação de Ministério',
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
              updateMinisterio({
                id: ministerioId,
                data: { status: newStatus },
              }).then(() => {
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
              removeMinisterio(ministerioId);

              //Remover ministério do usuário logado, se houver
              const hasMinisterio = user?.igrejas?.some((igreja) => igreja.ministerios?.some((m) => m.id === ministerioId));
              if (hasMinisterio && user) {
                const igrejasAtualizadas = user.igrejas.map((igreja) => ({
                  ...igreja,
                  ministerios: (igreja.ministerios || []).filter((m) => m.id !== ministerioId),
                }));
                updateUser({ igrejas: igrejasAtualizadas });
              }
            },
          },
        ],
      );
    },
    [removeMinisterio, user, updateUser],
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
        data: data,
        keyExtractor: (item) => item.id,
        renderItem: ({ item, index }) => {
          const commonProps: FancyCardImageBaseProps = {
            title: item.nome,
            subtitle: (
              <FancyTextDisplayCard
                value={MinisterioTipoLabel[item.tipo]}
                icon={{ library: 'MaterialCommunityIcons', name: 'tag-outline', size: 12, color: Pallete.primary }}
                containerStyle={{ marginVertical: 2 }}
              />
            ),
            additionalData1: (
              <FancyChips
                style={{ marginTop: 2 }}
                size='small'
                label={MinisterioStatusLabel[item.status]}
                color={MinisterioStatusEnumMap[item.status] === MinisterioStatusEnum.Ativo ? Pallete.primary : Pallete.error}
              />
            ),
            actionButtons: [
              {
                icon: { ...DefaultIconsNames.edit, size: 17 },
                onPress: () => {
                  showLoading();
                  router.push({
                    pathname: '/admin/ministerios/edit',
                    params: {
                      id: item.id,
                    },
                  });
                },
              },
              {
                type: 'menu',
                icon: { library: 'Entypo', name: 'dots-three-vertical', size: 15, backgroundColor: Pallete.secondary },
                options: [
                  {
                    label: MinisterioStatusEnumMap[item.status] == MinisterioStatusEnum.Ativo ? 'Desativar' : 'Ativar',
                    icon:
                      MinisterioStatusEnumMap[item.status] == MinisterioStatusEnum.Ativo
                        ? { library: 'FontAwesome6', name: 'thumbs-down', size: 16 }
                        : { library: 'FontAwesome6', name: 'thumbs-up', size: 16 },
                    onPress: () => {
                      handleChangeStatus(
                        item.id!,
                        item.nome,
                        MinisterioStatusEnumMap[item.status] === MinisterioStatusEnum.Ativo
                          ? MinisterioStatusEnum.Inativo
                          : MinisterioStatusEnum.Ativo,
                      );
                    },
                  },
                  {
                    label: 'Excluir',
                    icon: { library: 'FontAwesome6', name: 'trash-can', size: 16, style: { borderWidth: 0 } },
                    onPress: () => {
                      handleRemoveMinisterio(item.id!);
                    },
                  },
                ],
              },
            ],
          };

          const cardImageProps: ImageType | IconType = item.logoThumbUrl
            ? {
                type: 'image',
                props: { source: { uri: item.logoThumbUrl }, ...commonProps },
              }
            : {
                type: 'icon',
                props: {
                  cardIcon: {
                    library: 'MaterialCommunityIcons' as const,
                    name: 'home-group',
                    size: 18,
                  },
                  ...commonProps,
                },
              };
          return <FancyCard.Image key={index} {...cardImageProps} />;
        },
      }}
    ></FancyListPage>
  );
}
