import { router } from 'expo-router';
import { FancyCard, IconType, ImageType } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import {
  MinisterioModel,
  MinisterioStatusEnum,
  MinisterioStatusEnumMap,
  MinisterioTipoLabel,
} from '../../../../../domain/models/Ministerio';
import { Pallete } from '../../../../../constants/colors';
import { ImageUtils } from '../../../../../utils/image_utils';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { useCallback, useMemo, useState } from 'react';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import FancyLoading from '../../../../../components/FancyLoading';
import { FancyTextDisplayCard } from '../../../../../components/cards/FancyTextDisplayCard';
import { FancyAlert } from '../../../../../components/modal/FancyAlert';
import FancySectionHeader, { Item, Row, Section } from '../../../../../components/cards/Horizontal/FancySectionHeader';
import Toast from 'react-native-toast-message';
import { ActionButtonProps, FancyActionButtons } from '../../../../../components/cards/Horizontal/FancyCardActionButtons';

export default function MinisteriosIndex() {
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
    autoFetch: false,
    initialParams: {},
  });

  const ministeriosData = useMemo<Row<MinisterioModel>[]>(() => {
    const ativos = data
      .filter(m => MinisterioStatusEnumMap[m.status] === MinisterioStatusEnum.Ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    const inativos = data
      .filter(m => MinisterioStatusEnumMap[m.status] === MinisterioStatusEnum.Inativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));

    const rows: Row<MinisterioModel>[] = [];

    if (ativos.length > 0) {
      rows.push({ type: 'section', key: 'section-ativos', title: `Ativos (${ativos.length})` } as Section);
      rows.push(...(ativos.map(v => ({ type: 'item', key: `ativo-${v.id}`, data: v })) as unknown as Item<MinisterioModel>[]));
    }

    if (inativos.length > 0) {
      rows.push({ type: 'section', key: 'section-inativos', title: `Inativos (${inativos.length})` } as Section);
      rows.push(
        ...(inativos.map(v => ({
          type: 'item',
          key: `inativo-${v.id}`,
          data: v,
        })) as unknown as Item<MinisterioModel>[])
      );
    }

    return rows;
  }, [data]);

  const handleChangeStatus = useCallback(
    (ministerioId: string, ministerioNome: string, newStatus: MinisterioStatusEnum) => {
      FancyAlert.alert(
        newStatus === MinisterioStatusEnum.Inativo ? 'Desativação de Ministério' : 'Ativação de Ministério',
        `Tem certeza que deseja "${
          newStatus === MinisterioStatusEnum.Inativo ? 'DESATIVAR' : 'ATIVAR'
        }" o ministério "${ministerioNome}"?`,
        [
          {
            text: 'Não',
            style: 'cancel',
          },
          {
            text: 'Sim',
            style: 'destructive',
            onPress: () => {
              updateMinisterio({ id: ministerioId, data: { status: newStatus } }).then(() => {
                Toast.show({
                  text1: `Ministério ${newStatus === MinisterioStatusEnum.Inativo ? 'desativado' : 'ativado'} com sucesso!`,
                  type: 'success',
                });
              });
            },
          },
        ]
      );
    },
    [updateMinisterio]
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
            },
          },
        ]
      );
    },
    [removeMinisterio]
  );

  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  if (isLoading) {
    return <FancyLoading />;
  }

  return (
    <FancyListPage
      fabProps={{ onPress: () => router.push('/admin/ministerios/add') }}
      searchBarProps={{
        value: searchText,
        onSearch: text => {
          setSearchText(text.trim());
          if (text && text.trim() !== '') {
            setSearchParams({
              where: {
                conditions: [
                  {
                    path: 'nome',
                    operator: Operator.ILIKE,
                    value: { type: ValueType.LITERAL, value: text.trim() },
                  },
                ],
              },
            });
          } else {
            setSearchParams({});
          }
        },
      }}
      listProps={{
        onRefresh: refetch,
        data: ministeriosData,
        renderItem: ({ item, index }) => {
          if (item.type === 'section')
            return <FancySectionHeader key={index} title={item.title} containerStyle={{ marginTop: index > 0 ? 10 : 0 }} />;

          const commonProps = {
            title: item.data.nome,
            subtitle: <FancyTextDisplayCard value={MinisterioTipoLabel[item.data.tipo]} title="Tipo:" />,
            content: (
              <FancyActionButtons
                containerStyle={{
                  justifyContent: 'flex-start',
                  marginTop: 6,
                  gap: 8,
                  width: '100%',
                }}
                actions={
                  [
                    {
                      label: 'Editar',
                      icon: {
                        library: DefaultIconsNames.edit.library,
                        name: DefaultIconsNames.edit.name,
                        size: 12,
                      },
                      onPress: () => {
                        router.push({
                          pathname: '/admin/ministerios/edit',
                          params: {
                            id: item.data.id,
                          },
                        });
                      },
                      size: 'small',
                    },
                    {
                      label: MinisterioStatusEnumMap[item.data.status] === MinisterioStatusEnum.Ativo ? 'Desativar' : 'Ativar',
                      icon: {
                        library: 'MaterialCommunityIcons' as const,
                        name:
                          MinisterioStatusEnumMap[item.data.status] === MinisterioStatusEnum.Ativo ? 'close-thick' : 'check-bold',
                        size: 12,
                        backgroundColor:
                          MinisterioStatusEnumMap[item.data.status] === MinisterioStatusEnum.Ativo
                            ? Pallete.terciary
                            : Pallete.confirm,
                      } as ActionButtonProps['icon'],
                      onPress: () => {
                        handleChangeStatus(
                          item.data.id!,
                          item.data.nome,
                          MinisterioStatusEnumMap[item.data.status] === MinisterioStatusEnum.Ativo
                            ? MinisterioStatusEnum.Inativo
                            : MinisterioStatusEnum.Ativo
                        );
                      },
                      size: 'small',
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
                                handleRemoveMinisterio(item.data.id!);
                              },
                            },
                          ]
                        );
                      },
                      size: 'small',
                    },
                  ] as ActionButtonProps[]
                }
              />
            ),
          };

          const logoSource = item.data.logo ? ImageUtils.rawToDataUri(item.data.logo) ?? item.data.logo : undefined;
          const cardImageProps: ImageType | IconType = logoSource
            ? { type: 'image', props: { source: logoSource, ...commonProps } }
            : {
                type: 'icon',
                props: {
                  cardIcon: { library: 'MaterialCommunityIcons' as const, name: 'home-group', size: 18 },
                  ...commonProps,
                },
              };
          return <FancyCard.Image key={index} {...cardImageProps} />;
        },
      }}
    ></FancyListPage>
  );
}
