import { router } from 'expo-router';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet } from 'react-native';
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
import FancyListItemCard from '../../../../../components/cards/FancyListItemCard';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';
import { usePallete } from '../../../../../hooks/usePallete';
import { ResponseVoluntarioDto } from '../../../../../domain/dtos/Voluntario/voluntario.response';

export default function VoluntariosIndexPage() {
  const palette = usePallete();
  const [searchText, setSearchText] = useState('');
  const [actionsVoluntario, setActionsVoluntario] = useState<ResponseVoluntarioDto | null>(null);
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

  if (isLoading || isRefetching) return <FancyLoading />;

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
          const statusColor = item.status === VoluntarioStatusEnum.ATIVO ? palette.primary : palette.error;
          return (
            <FancyListItemCard
              title={item.nome}
              subtitle={item.email}
              leading={{
                type: 'image',
                source:
                  item.fotoThumbUrl || item.fotoUrl
                    ? { uri: item.fotoThumbUrl || item.fotoUrl || '' }
                    : AppImages.emptyProfile,
              }}
              meta={
                    <FancyChips
                      label={VoluntarioStatusEnumLabel[item.status]}
                      color={statusColor}
                      size='small'
                    />
              }
              trailing={{ type: 'menu', onPress: () => setActionsVoluntario(item) }}
              contentStyle={isLoadingMutation ? { opacity: 0.68 } : undefined}
            />
          );
        },
      }}
    >
      <FancyActionSheet
        visible={!!actionsVoluntario}
        onClose={() => setActionsVoluntario(null)}
        actions={[
          {
            label: 'Abrir detalhes',
            icon: { ...DefaultIconsNames.edit, size: 18 },
            onPress: () => {
              if (!actionsVoluntario) return;
              showLoading();
              router.push({
                pathname: '/admin/voluntarios/details',
                params: { id: actionsVoluntario.id },
              });
            },
          },
          {
            label: actionsVoluntario?.status === VoluntarioStatusEnum.ATIVO ? 'Desativar' : 'Ativar',
            icon:
              actionsVoluntario?.status === VoluntarioStatusEnum.ATIVO
                ? { library: 'FontAwesome6', name: 'thumbs-down', size: 16 }
                : { library: 'FontAwesome6', name: 'thumbs-up', size: 16 },
            disabled: isLoadingMutation,
            onPress: () => {
              if (!actionsVoluntario) return;
              handleChangeStatus(
                actionsVoluntario.id!,
                actionsVoluntario.nome,
                actionsVoluntario.status === VoluntarioStatusEnum.ATIVO
                  ? VoluntarioStatusEnum.DESATIVADO
                  : VoluntarioStatusEnum.ATIVO,
              );
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            disabled: isLoadingMutation,
            icon: { library: 'FontAwesome6', name: 'trash-can', size: 16 },
            onPress: () => {
              if (actionsVoluntario) handleDeleteVoluntario(actionsVoluntario.id!);
            },
          },
        ]}
      />
    </FancyListPage>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, borderWidth: 0, borderColor: 'magenta' },
  searchbar: { paddingHorizontal: 18 },
  list_content: { gap: 10 },
});
