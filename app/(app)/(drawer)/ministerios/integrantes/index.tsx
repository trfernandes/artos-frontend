import { useCallback, useMemo, useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useMinisterioVoluntariosCrud } from '../../../../../hooks/useMinisterioVoluntariosCrud';
import { router, useLocalSearchParams } from 'expo-router';
import { Condition, DynamicQuery, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import {
  HierarquiaEnumLabel,
  MinisterioVoluntarioModel,
  MinisterioVoluntarioStatusEnum,
  MinisterioVoluntarioStatusEnumMap,
} from '../../../../../domain/models/MinisterioVoluntario';
import FancyLoading from '../../../../../components/FancyLoading';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancySectionHeader, { Item, Row, Section } from '../../../../../components/cards/Horizontal/FancySectionHeader';
import { FancyTextDisplayCard } from '../../../../../components/cards/FancyTextDisplayCard';
import { FancyActionButtons } from '../../../../../components/cards/Horizontal/FancyCardActionButtons';

export default function MinisterioIntegrantesIndex() {
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
            value: { type: ValueType.LITERAL as const, value: ministerioId },
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

  const integrantesData = useMemo<Row<MinisterioVoluntarioModel>[]>(() => {
    const ativos = data
      .filter(v => MinisterioVoluntarioStatusEnumMap[v.status] === MinisterioVoluntarioStatusEnum.Ativo)
      .sort((a, b) => (a.voluntario?.nome ?? '').localeCompare(b.voluntario?.nome ?? '', 'pt-BR', { sensitivity: 'base' }));
    const inativos = data
      .filter(v => MinisterioVoluntarioStatusEnumMap[v.status] === MinisterioVoluntarioStatusEnum.Inativo)
      .sort((a, b) => (a.voluntario?.nome ?? '').localeCompare(b.voluntario?.nome ?? '', 'pt-BR', { sensitivity: 'base' }));

    const rows: Row<MinisterioVoluntarioModel>[] = [];

    if (ativos.length > 0) {
      rows.push({ type: 'section', key: 'section-ativos', title: `Ativos (${ativos.length})` } as Section);
      rows.push(
        ...(ativos.map(v => ({ type: 'item', key: `ativo-${v.id}`, data: v })) as unknown as Item<MinisterioVoluntarioModel>[])
      );
    }

    if (inativos.length > 0) {
      rows.push({ type: 'section', key: 'section-inativos', title: `Inativos (${inativos.length})` } as Section);
      rows.push(
        ...(inativos.map(v => ({
          type: 'item',
          key: `inativo-${v.id}`,
          data: v,
        })) as unknown as Item<MinisterioVoluntarioModel>[])
      );
    }

    return rows;
  }, [data]);

  const handleChangeStatus = useCallback(
    (id: string, nome: string, newStatus: MinisterioVoluntarioStatusEnum) => {
      FancyAlert.alert(
        newStatus === MinisterioVoluntarioStatusEnum.Inativo ? 'Desativação de Voluntário' : 'Ativação de Voluntário',
        `Tem certeza que deseja "${
          newStatus === MinisterioVoluntarioStatusEnum.Inativo ? 'DESATIVAR' : 'ATIVAR'
        }" o voluntário "${nome}"?`,
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => {
              updateIntegrante({ id, data: { status: newStatus } }).then(() => {
                Toast.show({
                  text1: `Voluntário ${
                    newStatus === MinisterioVoluntarioStatusEnum.Inativo ? 'desativado' : 'ativado'
                  } com sucesso!`,
                  type: 'success',
                });
              });
            },
          },
        ]
      );
    },
    [updateIntegrante]
  );

  const handleRemoveVoluntario = useCallback((ministerioVoluntarioId: string) => {
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
      ]
    );
  }, [removeIntegrante]);

  if (isLoading || isLoadingMutation) return <FancyLoading />;

  return (
    <FancyListPage
      showFab
      fabProps={{
        onPress: () => router.push({ pathname: '/ministerios/integrantes/add', params: { ministerioId } }),
      }}
      showSearchBar
      searchBarProps={{
        value: searchText,
        onSearch: text => setSearchText(text.trim()),
      }}
      listProps={{
        data: integrantesData,
        renderItem: ({ item, index }) => {
          if (item.type === 'section')
            return <FancySectionHeader key={index} title={item.title} containerStyle={{ marginTop: index > 0 ? 10 : 0 }} />;
          else
            return (
              <View style={{ marginLeft: 10 }} key={index}>
                <FancyCard.Image
                  type="image"
                  props={{
                    title: item.data?.voluntario?.nome,
                    subtitle: <FancyTextDisplayCard title={'E-mail:'} value={item.data?.voluntario?.email} />,
                    additionalData1: <FancyTextDisplayCard title="Função:" value={HierarquiaEnumLabel[item.data?.hierarquia!]} />,
                    source: item.data?.voluntario?.foto ?? require('../../../../../assets/images/empty_profile_image.png'),
                    content: (
                      <FancyActionButtons
                        containerStyle={{
                          justifyContent: 'flex-start',
                          marginTop: 6,
                          gap: 8,
                          width: '100%',
                        }}
                        actions={[
                          {
                            label: 'Editar',
                            size: 'small',
                            icon: {
                              ...DefaultIconsNames.edit,
                              size: 12,
                            },
                            onPress: () => {
                              router.push({
                                pathname: '/ministerios/integrantes/edit',
                                params: {
                                  ministerioId: item.data?.ministerio?.id!,
                                  ministerioVoluntarioId: item.data?.id!,
                                  voluntario: JSON.stringify(item.data!),
                                },
                              });
                            },
                          },
                          {
                            label:
                              MinisterioVoluntarioStatusEnumMap[item.data.status] === MinisterioVoluntarioStatusEnum.Ativo
                                ? 'Desativar'
                                : 'Ativar',
                            size: 'small',
                            icon:
                              MinisterioVoluntarioStatusEnumMap[item.data.status] === MinisterioVoluntarioStatusEnum.Ativo
                                ? {
                                    library: 'MaterialCommunityIcons',
                                    name: 'close-thick',
                                    size: 12,
                                    backgroundColor: Pallete.terciary,
                                  }
                                : {
                                    library: 'MaterialCommunityIcons',
                                    name: 'check-bold',
                                    size: 12,
                                    backgroundColor: Pallete.confirm,
                                  },
                            onPress: () => {
                              handleChangeStatus(
                                item.data.id!,
                                item.data?.voluntario?.nome!,
                                MinisterioVoluntarioStatusEnumMap[item.data?.status] === MinisterioVoluntarioStatusEnum.Ativo
                                  ? MinisterioVoluntarioStatusEnum.Inativo
                                  : MinisterioVoluntarioStatusEnum.Ativo
                              );
                            },
                          },
                          {
                            label: 'Excluir',
                            icon: {
                              library: DefaultIconsNames.delete.library,
                              name: DefaultIconsNames.delete.name,
                              size: 12,
                              backgroundColor: Pallete.error,
                            },
                            onPress: () => {
                              FancyAlert.alert(
                                'Excluir definitivamente este ministério?',
                                `A exclusão deste ministério é permanente. Todos os vínculos com voluntários, funções, escalas e relatórios históricos serão removidos e não poderão ser recuperados. Se você não quiser perder o histórico, use a opção "Desativar" em vez de excluir.`,
                                [
                                  { text: 'Cancelar', style: 'cancel' },
                                  {
                                    text: 'Sim, estou ciente',
                                    style: 'destructive',
                                    onPress: () => {
                                      handleRemoveVoluntario(item.data.id!);
                                    },
                                  },
                                ]
                              );
                            },
                            size: 'small',
                          },
                        ]}
                      />
                    ),
                  }}
                />
              </View>
            );
        },
      }}
    />
  );
}
