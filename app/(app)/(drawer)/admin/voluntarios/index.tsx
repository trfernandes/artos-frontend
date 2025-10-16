import { router } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { ImageUtils } from '../../../../../utils/image_utils';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet } from 'react-native';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import { useState } from 'react';
import FancyListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { Conjunction, Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { useVoluntariosCrud } from '../../../../../hooks/useVoluntariosCrud';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function VoluntariosIndexPage() {
  console.log('VoluntariosIndexPage Rendered');

  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();
  const { data, setSearchParams, isLoading, error, refetch, isRefetching, isError } = useVoluntariosCrud({
    autoFetch: true,
  });

  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  return (
    <FancyListPage
      showFab={false}
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
                  {
                    path: 'id',
                    operator: Operator.NOT_EQUALS,
                    value: { type: ValueType.LITERAL, value: user?.id! },
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
                    value: { type: ValueType.LITERAL, value: user?.id! },
                  },
                ],
              },
            });
          }
        },
      }}
      listProps={{
        refreshing: isLoading || isRefetching,
        onRefresh: refetch,
        data: data?.sort((a, b) => a.nome.localeCompare(b.nome)) || [],
        renderItem: ({ item, index }) => (
          <FancyCard.Image
            key={index}
            type="image"
            props={{
              title: item.nome,
              subtitle: item.email,
              source:
                item.foto
                  ? ImageUtils.rawToDataUri(item.foto) ?? item.foto
                  : require('../../../../../assets/images/empty_profile_image.png'),
              actionButtons: [
                {
                  icon: {
                    ...DefaultIconsNames.edit,
                    size: 18,
                  },
                  onPress: () => {
                    router.push({
                      pathname: '/admin/voluntarios/details',
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
                },
              ],
            }}
          />
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, paddingTop: 10, borderWidth: 0, borderColor: 'magenta' },
  searchbar: { paddingHorizontal: 18 },
  list_content: { paddingHorizontal: 18, gap: 10 },
});

