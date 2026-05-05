import { router } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet, View } from 'react-native';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import { useCallback, useMemo, useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { useIgrejaVoluntariosCrud } from '../../../../../hooks/useIgrejaVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';
import FancyLoading from '../../../../../components/FancyLoading';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import {
    VoluntarioStatusEnum,
    VoluntarioStatusEnumLabel,
} from '../../../../../domain/enums/Voluntario/voluntario-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import { useLoading } from '../../../../../contexts/LoadingContext';
import FancyChips from '../../../../../components/FancyChips';

export default function VoluntariosIndexPage() {
  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();
  const { showLoading } = useLoading();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
    isError,
    isLoadingMutation,
    update: updateVoluntario,
    remove: removeVoluntario,
  } = useIgrejaVoluntariosCrud({
    autoFetch: true,
  });

  const handleChangeStatus = useCallback(
    (id: string, nome: string, newStatus: VoluntarioStatusEnum) => {
      FancyAlert.alert(
        newStatus === VoluntarioStatusEnum.DESATIVADO
          ? 'Desativação de Voluntário'
          : 'Ativação de Voluntário',
        `Tem certeza que deseja "${newStatus === VoluntarioStatusEnum.DESATIVADO ? 'DESATIVAR' : 'ATIVAR'}" o voluntário "${nome}"?`,
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => {
              updateVoluntario?.({
                id,
                data: { status: newStatus },
              }).then(() => {
                Toast.show({
                  text1: `Voluntário ${newStatus === VoluntarioStatusEnum.DESATIVADO ? 'desativado' : 'ativado'} com sucesso!`,
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

  const filteredData = useMemo(() => {
    const normalized = searchText.trim().toLowerCase();
    const currentUserId = user?.user.id;
    const baseList = currentUserId ? data.filter((item) => item.id !== currentUserId) : data;

    if (!normalized) return baseList;
    return baseList.filter((item) => {
      const nome = item.nome?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      return nome.includes(normalized) || email.includes(normalized);
    });
  }, [data, searchText, user?.user.id]);

  const sorteredData = useMemo(() => {
    return [...filteredData].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  }, [filteredData]);

  // Early returns AFTER all hooks
  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  if (isLoading || isRefetching || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab={false}
      showSearchBar
      searchBarProps={{
        value: searchText,
        onSearch: (text) => {
          setSearchText(text.trim());
        },
      }}
      listProps={{
        onRefresh: refetch,
        listEmptyProps:
          searchText.trim().length > 0
            ? {
                label: 'Nenhum voluntário encontrado',
                icon: { library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 68 },
              }
            : {
                label: 'Nenhum voluntário cadastrado',
                icon: { library: 'MaterialCommunityIcons', name: 'account-group-outline', size: 68 },
                helperText: 'Para cadastrar voluntários, envie um convite e aguarde a entrada deles na igreja.',
                actionLabel: 'Ir para Convites',
                actionIcon: { library: 'MaterialCommunityIcons', name: 'ticket-confirmation-outline', size: 16 },
                onActionPress: () =>
                  router.push({
                    pathname: '/admin/solicitacoes',
                    params: { tab: 'convites' },
                  }),
              },
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
                      color={
                        item.status === VoluntarioStatusEnum.ATIVO
                          ? Pallete.primary
                          : Pallete.error
                      }
                      size='small'
                    />
                  ),
                  source:
                    item.fotoThumbUrl || item.fotoUrl
                      ? { uri: item.fotoThumbUrl || item.fotoUrl || '' }
                      : AppImages.emptyProfile,
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
                      icon: {
                        library: 'Entypo',
                        name: 'dots-three-vertical',
                        size: 15,
                        backgroundColor: Pallete.secondary,
                      },
                      options: [
                        {
                          label:
                            item.status === VoluntarioStatusEnum.ATIVO
                              ? 'Desativar'
                              : 'Ativar',
                          icon:
                            item.status === VoluntarioStatusEnum.ATIVO
                              ? { library: 'FontAwesome6', name: 'thumbs-down', size: 16 }
                              : { library: 'FontAwesome6', name: 'thumbs-up', size: 16 },
                          onPress: () => {
                            handleChangeStatus(
                              item.id!,
                              item.nome,
                              item.status === VoluntarioStatusEnum.ATIVO
                                ? VoluntarioStatusEnum.DESATIVADO
                                : VoluntarioStatusEnum.ATIVO,
                            );
                          },
                        },
                        {
                          label: 'Excluir',
                          icon: {
                            library: 'FontAwesome6',
                            name: 'trash-can',
                            size: 16,
                            style: { borderWidth: 0 },
                          },
                          onPress: () => {
                            handleDeleteVoluntario(item.id!);
                          },
                        },
                      ],
                    },
                  ],
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
  container: { gap: 20, borderWidth: 0, borderColor: 'magenta' },
  searchbar: { paddingHorizontal: 18 },
  list_content: { gap: 10 },
});
