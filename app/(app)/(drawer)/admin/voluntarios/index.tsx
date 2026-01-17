import { router } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet, View } from 'react-native';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import { useCallback, useMemo, useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { Conjunction, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import FancyLoading from '../../../../../components/FancyLoading';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import {
    VoluntarioStatusEnum,
    VoluntarioStatusEnumLabel,
    VoluntarioStatusEnumMap,
} from '../../../../../domain/enums/Voluntario/voluntario-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import { useLoading } from '../../../../../contexts/LoadingContext';
import FancyChips from '../../../../../components/FancyChips';

export default function VoluntariosIndexPage() {
  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();
  const {
    data,
    setSearchParams,
    isLoading,
    error,
    refetch,
    isRefetching,
    isError,
    isLoadingMutation,
    update: updateVoluntario,
    remove: removeVoluntario,
  } = useVoluntariosCrud({
    autoFetch: true,
  });

  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  const handleChangeStatus = useCallback(
    (id: string, nome: string, newStatus: VoluntarioStatusEnum) => {
      FancyAlert.alert(
        newStatus === VoluntarioStatusEnum.Inativo ? 'Desativação de Voluntário' : 'Ativação de Voluntário',
        `Tem certeza que deseja "${newStatus === VoluntarioStatusEnum.Inativo ? 'DESATIVAR' : 'ATIVAR'}" o voluntário "${nome}"?`,
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => {
              updateVoluntario({
                id,
                data: { status: newStatus },
              }).then(() => {
                Toast.show({
                  text1: `Voluntário ${newStatus === VoluntarioStatusEnum.Inativo ? 'desativado' : 'ativado'} com sucesso!`,
                  type: 'success',
                });
              });
            },
          },
        ],
      );
    },
    [updateVoluntario],
  );

  const handleDeleteVoluntario = useCallback(
    (voluntarioId: string) => {
      FancyAlert.alert(
        'Excluir definitivamente este voluntário?',
        `A exclusão deste voluntário é permanente. Todos os vínculos com ministérios, funções, escalas e relatórios históricos serão removidos e não poderão ser recuperados. Se você não quiser perder o histórico, use a opção "Desativar" em vez de excluir.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, estou ciente',
            style: 'destructive',
            onPress: () => {
              removeVoluntario(voluntarioId);
            },
          },
        ],
      );
    },
    [removeVoluntario],
  );

  const sorteredData = useMemo(() => {
    return data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  }, [data]);

  const { showLoading, hideLoading } = useLoading();

  if (isLoading || isRefetching || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab={false}
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
                      type: ValueType.LITERAL,
                      value: text.trim(),
                    },
                  },
                  {
                    path: 'id',
                    operator: Operator.NOT_EQUALS,
                    value: {
                      type: ValueType.LITERAL,
                      value: user?.id!,
                    },
                  },
                ],
                conjunction: Conjunction.AND,
              },
              orderBy: [{ path: 'nome', direction: OrderDirection.ASC }],
            });
          } else {
            setSearchParams({
              where: {
                conditions: [
                  {
                    path: 'id',
                    operator: Operator.NOT_EQUALS,
                    value: {
                      type: ValueType.LITERAL,
                      value: user?.id!,
                    },
                  },
                ],
              },
            });
          }
        },
      }}
      listProps={{
        onRefresh: refetch,
        data: sorteredData,
        renderItem: ({ item, index }) => {
          return (
            <View>
              <FancyCard.Image
                key={index}
                type='image'
                props={{
                  title: item.nome,
                  subtitle: item.email,
                  additionalData1: (
                    <FancyChips
                      style={{ marginTop: 2 }}
                      label={VoluntarioStatusEnumLabel[item.status]}
                      color={VoluntarioStatusEnumMap[item.status] === VoluntarioStatusEnum.Ativo ? Pallete.primary : Pallete.error}
                    />
                  ),
                  source: item.fotoThumbUrl || item.fotoUrl ? { uri: item.fotoThumbUrl || item.fotoUrl || '' } : AppImages.emptyProfile,
                  actionButtons: [
                    {
                      icon: { ...DefaultIconsNames.edit, size: 17 },
                      onPress: () => {
                        showLoading();
                        router.push({
                          pathname: '/admin/voluntarios/details',
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
                          label: VoluntarioStatusEnumMap[item.status] == VoluntarioStatusEnum.Ativo ? 'Desativar' : 'Ativar',
                          icon:
                            VoluntarioStatusEnumMap[item.status] == VoluntarioStatusEnum.Ativo
                              ? { library: 'FontAwesome6', name: 'thumbs-down', size: 16 }
                              : { library: 'FontAwesome6', name: 'thumbs-up', size: 16 },
                          onPress: () => {
                            handleChangeStatus(
                              item.id!,
                              item.nome,
                              VoluntarioStatusEnumMap[item.status] === VoluntarioStatusEnum.Ativo
                                ? VoluntarioStatusEnum.Inativo
                                : VoluntarioStatusEnum.Ativo,
                            );
                          },
                        },
                        {
                          label: 'Excluir',
                          icon: { library: 'FontAwesome6', name: 'trash-can', size: 16, style: { borderWidth: 0 } },
                          onPress: () => {
                            handleDeleteVoluntario(item.id!);
                          },
                        },
                      ],
                    },
                  ],
                  // content: (
                  //   <FancyActionButtons
                  //     containerStyle={{
                  //       justifyContent: 'flex-start',
                  //       marginTop: 6,
                  //       gap: 8,
                  //       width: '100%',
                  //     }}
                  //     actions={[
                  //       {
                  //         label: 'Editar',
                  //         size: 'small',
                  //         icon: {
                  //           ...DefaultIconsNames.edit,
                  //           size: 12,
                  //         },
                  //         onPress: () => {
                  //           router.push({
                  //             pathname: '/admin/voluntarios/details',
                  //             params: {
                  //               id: item.data.id,
                  //             },
                  //           });
                  //         },
                  //       },
                  //       {
                  //         label: VoluntarioStatusEnumMap[item.data.status] === VoluntarioStatusEnum.Ativo ? 'Desativar' : 'Ativar',
                  //         size: 'small',
                  //         icon:
                  //           VoluntarioStatusEnumMap[item.data.status] === VoluntarioStatusEnum.Ativo
                  //             ? {
                  //                 library: 'MaterialCommunityIcons',
                  //                 name: 'close-thick',
                  //                 size: 12,
                  //                 backgroundColor: Pallete.terciary,
                  //               }
                  //             : {
                  //                 library: 'MaterialCommunityIcons',
                  //                 name: 'check-bold',
                  //                 size: 12,
                  //                 backgroundColor: Pallete.terciary,
                  //               },
                  //         onPress: () =>
                  //           handleChangeStatus(
                  //             item.data.id!,
                  //             item.data.nome,
                  //             item.data.status === VoluntarioStatusEnum.Ativo ? VoluntarioStatusEnum.Inativo : VoluntarioStatusEnum.Ativo,
                  //           ),
                  //       },
                  //       {
                  //         label: 'Excluir',
                  //         icon: {
                  //           library: DefaultIconsNames.delete.library,
                  //           name: DefaultIconsNames.delete.name,
                  //           size: 12,
                  //           backgroundColor: Pallete.error,
                  //         },
                  //         onPress: () => {
                  //           FancyAlert.alert(
                  //             'Excluir definitivamente este voluntário?',
                  //             `A exclusão deste voluntário é permanente. Todos os vínculos com ministérios, funções, escalas e relatórios históricos serão removidos e não poderão ser recuperados. Se você não quiser perder o histórico, use a opção "Desativar" em vez de excluir.`,
                  //             [
                  //               {
                  //                 text: 'Cancelar',
                  //                 style: 'cancel',
                  //               },
                  //               {
                  //                 text: 'Sim, estou ciente',
                  //                 style: 'destructive',
                  //                 onPress: () => {
                  //                   handleDeleteVoluntario(item.data.id!);
                  //                 },
                  //               },
                  //             ],
                  //           );
                  //         },
                  //         size: 'small',
                  //       },
                  //     ]}
                  //   />
                  // ),
                }}
              />
            </View>
          );
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, paddingTop: 10, borderWidth: 0, borderColor: 'magenta' },
  searchbar: { paddingHorizontal: 18 },
  list_content: { gap: 10 },
});
