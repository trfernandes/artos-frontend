import { router } from 'expo-router';
import { FancyCard } from '../../../../../components/cards/Horizontal/FancyCard';
import { Pallete } from '../../../../../constants/colors';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { StyleSheet } from 'react-native';
import FancyScreenErrorHandler from '../../../../../components/error/FancyScreenErrorHandler';
import { useState } from 'react';
import FancyBaseListPage from '../../../../../components/pages/base/FancyBaseListPage';
import { Operator, OrderDirection, ValueType } from '../../../../../domain/utils/query_utils';
import { useVoluntarios } from '../../../../../hooks/useVoluntarios';

const phoneRegex = /^\(?[1-9]{2}\)?\s?(?:9[1-9]\d{3}-?\d{4}|\d{4}-?\d{4})$/;

export default function VoluntariosIndexPage() {
  const [searchText, setSearchText] = useState('');
  const { data, setSearchParams, isLoading, error, refetch, isRefetching, isError } = useVoluntarios({
    autoFetch: false,
    initialParams: { orderBy: [{ path: 'nome', direction: OrderDirection.ASC }] },
  });

  if (isError) {
    return <FancyScreenErrorHandler error={error!} onTryAgrainPress={refetch} />;
  }

  return (
    <FancyBaseListPage
      searchBarProps={{
        value: searchText,
        onSearch: text => {
          setSearchText(text.trim());
          if (text && text.trim() !== '') {
            setSearchParams({
              where: {
                conditions: [
                  { path: 'nome', operator: Operator.ILIKE, value: { type: ValueType.LITERAL, value: text.trim() } },
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
        data: data?.sort((a, b) => a.nome.localeCompare(b.nome)) || [],
        renderItem: ({ item, index }) => (
          <FancyCard.Image
            key={index}
            type="image"
            props={{
              title: item.nome,
              subtitle: item.email,
              source: item.foto,
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
    ></FancyBaseListPage>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, paddingTop: 10, borderWidth: 0, borderColor: 'magenta' },
  searchbar: { paddingHorizontal: 18 },
  list_content: { paddingHorizontal: 18, gap: 10 },
});
