import { useCallback, useMemo, useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
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
import FancyLoading from '../../../../../components/FancyLoading';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import { FancyTextDisplayCard } from '../../../../../components/cards/FancyTextDisplayCard';
import { VoluntarioHierarquiaEnumLabel } from '../../../../../domain/enums/MinisterioVoluntario/hierarquia.enum';
import {
  getMinisterioStatusColorMap,
  MinisterioVoluntarioStatusEnum,
  MinisterioVoluntarioStatusEnumLabel,
  MinisterioVoluntarioStatusEnumMap,
} from '../../../../../domain/enums/MinisterioVoluntario/ministerio-voluntario-status.enum';
import { MinisterioVoluntarioFuncaoStatusEnum } from '../../../../../domain/enums/MinisterioVoluntarioFuncao/ministerio-voluntario-funcao-status.enum';
import { AppImages } from '../../../../../assets/app_images';
import { useLoading } from '../../../../../contexts/LoadingContext';
import FancyChips from '../../../../../components/FancyChips';
import { usePallete } from '../../../../../hooks/usePallete';
import FancyText from '../../../../../components/FancyText';
import DefaultIcons from '../../../../../components/FancyIcons';
import { StyleSheet, View } from 'react-native';
import { ResponseMinisterioVoluntarioDto } from '../../../../../domain/dtos/MinisterioVoluntario/ministerio-voluntario.response';
import FancyActionSheet from '../../../../../components/actions/FancyActionSheet';

export default function MinisterioIntegrantesIndex() {
  const palette = usePallete();
  const { showLoading } = useLoading();

  const { ministerioId } = useLocalSearchParams<{ ministerioId: string }>();

  const [searchText, setSearchText] = useState('');
  const [actionsIntegrante, setActionsIntegrante] = useState<ResponseMinisterioVoluntarioDto | null>(null);
  const ministerioStatusColorMap = useMemo(() => getMinisterioStatusColorMap(palette), [palette]);

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
      relations: ['voluntario', 'ministerio', 'funcoes', 'funcoes.funcao'],
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
        newStatus === MinisterioVoluntarioStatusEnum.Inativo
          ? 'Desativação de Voluntário'
          : 'Ativação de Voluntário',
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
              updateIntegrante?.({
                id,
                data: { status: newStatus },
              })?.then(() => {
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

  if (isLoading) return <FancyLoading />;

  const openEdit = (item: ResponseMinisterioVoluntarioDto) => {
    setActionsIntegrante(null);
    showLoading();
    router.push({
      pathname: '/ministerios/integrantes/edit',
      params: {
        ministerioId: ministerioId!,
        ministerioVoluntarioId: item.id!,
      },
    });
  };

  const selectedStatus = actionsIntegrante
    ? MinisterioVoluntarioStatusEnumMap[actionsIntegrante.status]
    : MinisterioVoluntarioStatusEnum.Ativo;
  const selectedIsActive = selectedStatus === MinisterioVoluntarioStatusEnum.Ativo;

  return (
    <>
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
          listEmptyProps: {
            label: searchText ? 'Nenhum integrante encontrado' : 'Nenhum integrante cadastrado',
            icon: { library: 'MaterialCommunityIcons', name: 'account-multiple-outline', size: 68 },
          },
          data: data,
          renderItem: ({ item, index }) => (
            <FancyCard.Image
              key={index}
              type='image'
              props={{
                title: item.voluntario?.nome,
                subtitle: (
                  <View style={styles.emailRow}>
                    <View style={styles.emailIconWrap}>
                      <DefaultIcons.Custom
                        library='MaterialCommunityIcons'
                        name='email-outline'
                        size={12}
                        color={palette.fonts.inactive}
                      />
                    </View>
                    <FancyText
                      size='extraSmall'
                      type='semiBold'
                      color={palette.fonts.inactive}
                      numberOfLines={1}
                      ellipsizeMode='middle'
                      style={styles.emailText}
                    >
                      {item.voluntario?.email}
                    </FancyText>
                  </View>
                ),
                containerStyle: styles.memberCard,
                contentContainerStyle: styles.memberCardContent,
                centerContainerStyle: styles.memberCardCenter,
                additionalData1: (
                  <FancyTextDisplayCard
                    icon={{
                      library: 'MaterialCommunityIcons',
                      name: 'account-cog-outline',
                      size: 12,
                      color: palette.fonts.inactive,
                    }}
                    value={VoluntarioHierarquiaEnumLabel[item.hierarquia!]}
                    valueStyle={{ numberOfLines: 1, ellipsizeMode: 'tail' } as any}
                  />
                ),
                additionalData2: (
                  <View style={styles.memberMetaBlock}>
                    {(() => {
                      const funcoesAtivas =
                        item.funcoes?.filter(
                          (f) => f.status === MinisterioVoluntarioFuncaoStatusEnum.Ativo,
                        ) ?? [];
                      if (funcoesAtivas.length === 0) return null;
                      const funcoesLabel = funcoesAtivas
                        .map((f) => f.funcao?.nome?.trim())
                        .filter((nome): nome is string => Boolean(nome))
                        .join(', ');

                      return (
                        <FancyTextDisplayCard
                          icon={{
                            library: 'MaterialCommunityIcons',
                            name: 'music-note',
                            size: 12,
                            color: palette.fonts.inactive,
                            style: { marginTop: 2, alignSelf: 'flex-start' },
                          }}
                          containerStyle={styles.functionInfo}
                          value={funcoesLabel}
                          valueStyle={{ numberOfLines: 2, ellipsizeMode: 'tail', style: styles.functionText } as any}
                        />
                      );
                    })()}
                    <FancyChips
                      size='small'
                      style={styles.statusChip}
                      label={MinisterioVoluntarioStatusEnumLabel[item.status]}
                      color={ministerioStatusColorMap[item.status]}
                    />
                  </View>
                ),
                source:
                  item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl
                    ? { uri: item.voluntario?.fotoThumbUrl || item.voluntario?.fotoUrl || '' }
                    : AppImages.emptyProfile,
                actionButtons: [
                  {
                    icon: {
                      library: 'Entypo',
                      name: 'dots-three-vertical',
                      size: 15,
                      color: palette.fonts.inactive,
                      backgroundColor: `${palette.fonts.inactive}14`,
                    },
                    onPress: () => setActionsIntegrante(item),
                  },
                ],
              }}
            />
          ),
        }}
      />

      <FancyActionSheet
        visible={!!actionsIntegrante}
        onClose={() => setActionsIntegrante(null)}
        actions={[
          {
            label: selectedIsActive ? 'Desativar' : 'Ativar',
            disabled: isLoadingMutation,
            icon: {
              library: 'FontAwesome6',
              name: selectedIsActive ? 'thumbs-down' : 'thumbs-up',
              size: 16,
            },
            onPress: () => {
              if (!actionsIntegrante) return;
              handleChangeStatus(
                actionsIntegrante.id!,
                actionsIntegrante.voluntario?.nome ?? '',
                selectedIsActive ? MinisterioVoluntarioStatusEnum.Inativo : MinisterioVoluntarioStatusEnum.Ativo,
              );
            },
          },
          {
            label: 'Excluir',
            destructive: true,
            disabled: isLoadingMutation,
            icon: { library: 'FontAwesome6', name: 'trash-can', size: 16 },
            onPress: () => {
              if (actionsIntegrante) handleRemoveVoluntario(actionsIntegrante.id!);
            },
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  memberCard: {
    borderRadius: 24,
    paddingVertical: 8,
  },
  memberCardContent: {
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  memberCardCenter: {
    gap: 4,
    minWidth: 0,
    paddingRight: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    marginTop: 0,
    minWidth: 0,
  },
  emailIconWrap: {
    width: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailText: {
    flex: 1,
    opacity: 0.85,
    minWidth: 0,
  },
  memberMetaBlock: {
    gap: 3,
  },
  functionInfo: {
    alignItems: 'flex-start',
    gap: 4,
  },
  functionText: {
    lineHeight: 15,
    flexShrink: 1,
    opacity: 0.8,
  },
  statusChip: {
    marginTop: 1,
    alignSelf: 'flex-start',
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
});
