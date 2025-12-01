import { router } from 'expo-router';
import { FancyCard, IconType, ImageType } from '../../../../../components/cards/Horizontal/FancyCard';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import { MinisterioStatusEnum, MinisterioStatusEnumMap, MinisterioStatusLabel, MinisterioTipoLabel } from '../../../../../domain/models/Ministerio';
import { Alert, View } from 'react-native';
import DefaultIcons from '../../../../../components/FancyIcons';
import FancyText from '../../../../../components/FancyText';
import { Pallete } from '../../../../../constants/colors';
import { ImageUtils } from '../../../../../utils/image_utils';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { useMinisteriosCrud } from '../../../../../hooks/useMinisteriosCrud';
import { useState } from 'react';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';

export default function MinisteriosIndex() {
  const [searchText, setSearchText] = useState('');
  const { data, setSearchParams, isLoading, error, refetch, isRefetching, isError, remove } = useMinisteriosCrud({
    autoFetch: false,
    initialParams: {},
  });

  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  return (
    <FancyListPage
      fabProps={{ onPress: () => router.push('/admin/ministerios/add') }}
      searchBarProps={{
        value: searchText,
        onSearch: text => {
          console.log(text);
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
        refreshing: isLoading || isRefetching,
        onRefresh: refetch,
        data: data?.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })) || [],
        renderItem: ({ item }) => {
          const commonProps = {
            title: item.nome,
            subtitle: MinisterioTipoLabel[item.tipo],
            additionalData1: (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  borderWidth: 0,
                  paddingTop: 2,
                }}
              >
                <DefaultIcons.Custom
                  library={'Octicons'}
                  name={'dot-fill'}
                  color={item.status === MinisterioStatusEnum.Ativo ? 'forestgreen' : 'indianred'}
                  size={12}
                  style={{
                    borderWidth: 0,
                    height: 11,
                    justifyContent: 'flex-start',
                    lineHeight: 10.5,
                  }}
                />
                <FancyText size={'extraSmall'} type="semiBold" color={Pallete.fonts.inactive} style={{ lineHeight: 10, borderWidth: 0, height: 11 }}>
                  {MinisterioStatusLabel[MinisterioStatusEnumMap[item.status]]}
                </FancyText>
              </View>
            ),
            actionButtons: [
              {
                icon: {
                  library: DefaultIconsNames.edit.library,
                  name: DefaultIconsNames.edit.name,
                  size: 18,
                },
                onPress: () => {
                  router.push({
                    pathname: '/admin/ministerios/edit',
                    params: {
                      id: item.id,
                    },
                  });
                },
              },
              {
                icon: {
                  library: DefaultIconsNames.delete.library,
                  name: DefaultIconsNames.delete.name,
                  size: 18,
                  backgroundColor: Pallete.error,
                },
                onPress: () => {
                  Alert.alert('Exclusão', `Tem certeza que deseja remover o ministério "${item.nome}?"`, [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Remover',
                      style: 'destructive',
                      onPress: () => {
                        remove(item.id!);
                      },
                    },
                  ]);
                },
              },
            ],
          };

          const logoSource = item.logo ? ImageUtils.rawToDataUri(item.logo) ?? item.logo : undefined;
          const cardImageProps: ImageType | IconType = logoSource
            ? { type: 'image', props: { source: logoSource, ...commonProps } }
            : {
                type: 'icon',
                props: {
                  cardIcon: { library: 'MaterialCommunityIcons', name: 'home-group', size: 18 },
                  ...commonProps,
                },
              };
          return <FancyCard.Image {...cardImageProps} />;
        },
      }}
    >
      {/* <FancyFab onPress={() => router.push('/admin/ministerios/add')} /> */}
    </FancyListPage>
  );
}
