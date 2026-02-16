import { useCallback, useMemo, useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { router, useLocalSearchParams } from 'expo-router';
import { Condition, DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { FancyTextDisplayCard } from '../../../../../components/cards/FancyTextDisplayCard';
import { VoluntarioHierarquiaEnumLabel } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
    MinisterioStatusColorMap,
    MinisterioVoluntarioStatusEnum,
    MinisterioVoluntarioStatusEnumLabel,
    MinisterioVoluntarioStatusEnumMap,
} from '../../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import { useLoading } from '../../../../../contexts/LoadingContext';
import FancyChips from '../../../../../components/FancyChips';

export default function MinisterioIntegrantesIndex() {
  const { showLoading } = useLoading();

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
            value: {
              type: ValueType.LITERAL as const,
              value: ministerioId,
            },
          },
          ...(searchCondition ? [searchCondition] : []),
        ],
      },
      relations: ['voluntario', 'ministerio'],
      orderBy: [{ path: 'voluntario.nome', direction: OrderDirection.ASC }],
    } as DynamicQuery;
  }, [ministerioId, searchText]);

  const {
    data,
    update: updateIntegrante,
    remove: removeIntegrante,
    isLoading,
    isLoadingMutation,
  } = useMinisterioVoluntariosCrud({
    autoFetch: true,
    initialParams: params,
  });

  const handleChangeStatus = useCallback(
    (id: string, nome: string, newStatus: MinisterioVoluntarioStatusEnum) => {
      FancyAlert.alert(
        newStatus === MinisterioVoluntarioStatusEnum.Inativo ? 'Desativação de Voluntário' : 'Ativação de Voluntário',
        `Tem certeza que deseja "${newStatus === MinisterioVoluntarioStatusEnum.Inativo ? 'DESATIVAR' : 'ATIVAR'}" o voluntário "${nome}"?`,
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => {
              updateIntegrante({
                id,
                data: { status: newStatus },
              }).then(() => {
                Toast.show({
                  text1: `Voluntário ${newStatus === MinisterioVoluntarioStatusEnum.Inativo ? 'desativado' : 'ativado'} com sucesso!`,
                  type: 'success',
                });
              });
            },
          },
        ],
      );
    },
    [updateIntegrante],
  );

  const handleRemoveVoluntario = useCallback(
    (ministerioVoluntarioId: string) => {
      FancyAlert.alert(
        'Excluir definitivamente este voluntário desse ministério?',
        `A exclusão deste voluntário é permanente. Todos os vínculos com esse ministério como funções, escalas e histórico serão removidos e não poderão ser recuperados. Se você não quiser perder o histórico, use a opção "Desativar" em vez de excluir.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, estou ciente',
            style: 'destructive',
            onPress: () => {
              removeIntegrante(ministerioVoluntarioId);
            },
          },
        ],
      );
    },
    [removeIntegrante],
  );

  if (isLoading || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () =>
          router.push({
            pathname: '/ministerios/integrantes/add',
            params: { ministerioId },
          }),
      }}
      showSearchBar
      searchBarProps={{
        value: searchText,
        onSearch: (text) => setSearchText(text.trim()),
      }}
      listProps={{
        data: data,
        renderItem: ({ item, index }) => (
          <FancyCard.Image
            key={index}
            type='image'
            props={{
              title: item.voluntario?.nome,
              subtitle: <FancyTextDisplayCard icon={{ library: 'MaterialCommunityIcons', name: 'email-outline', size: 12, color: Pallete.primary }} value={item.voluntario?.email} valueStyle={{ numberOfLines: 1 }} />,
              additionalData1: <FancyTextDisplayCard icon={{ library: 'MaterialCommunityIcons', name: 'account-cog-outline', size: 12, color: Pallete.primary }} value={VoluntarioHierarquiaEnumLabel[item.hierarquia!]} />,
              additionalData2: (
                <FancyChips
                  size='small'
                  style={{ marginTop: 2 }}
                  label={MinisterioVoluntarioStatusEnumLabel[item.status]}
                  color={MinisterioStatusColorMap[item.status]}
                />
              ),
              source:
                item.voluntario?.fotoThumbUrl || item.voluntario?.fotoThumbUrl
                  ? { uri: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl || '' }
                  : AppImages.emptyProfile,
              actionButtons: [
                {
                  icon: { ...DefaultIconsNames.edit, size: 17 },
                  onPress: () => {
                    showLoading();
                    router.push({
                      pathname: '/ministerios/integrantes/edit',
                      params: {
                        ministerioId: ministerioId!,
                        ministerioVoluntarioId: item.id!,
                      },
                    });
                  },
                },
                {
                  type: 'menu',
                  icon: { library: 'Entypo', name: 'dots-three-vertical', size: 15, backgroundColor: Pallete.secondary },
                  options: [
                    {
                      label: MinisterioVoluntarioStatusEnumMap[item.status] == MinisterioVoluntarioStatusEnum.Ativo ? 'Desativar' : 'Ativar',
                      icon:
                        MinisterioVoluntarioStatusEnumMap[item.status] == MinisterioVoluntarioStatusEnum.Ativo
                          ? { library: 'FontAwesome6', name: 'thumbs-down', size: 16 }
                          : { library: 'FontAwesome6', name: 'thumbs-up', size: 16 },
                      onPress: () => {
                        handleChangeStatus(
                          item.id!,
                          item.voluntario?.nome ?? '',
                          MinisterioVoluntarioStatusEnumMap[item.status] === MinisterioVoluntarioStatusEnum.Ativo
                            ? MinisterioVoluntarioStatusEnum.Inativo
                            : MinisterioVoluntarioStatusEnum.Ativo,
                        );
                      },
                    },
                    {
                      label: 'Excluir',
                      icon: { library: 'FontAwesome6', name: 'trash-can', size: 16, style: { borderWidth: 0 } },
                      onPress: () => {
                        handleRemoveVoluntario(item.id!);
                      },
                    },
                  ],
                },
              ],
            }}
          />
        ),
      }}
    />
  );
}
