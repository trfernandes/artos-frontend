import { StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import EventosListView from '../../../../../components/pages/admin/eventos/EventosListView';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { ResponseEventoDto } from '../../../../../domain/dtos/Evento/evento.response';

export default function EventosIndexPage() {
  const [searchText, setSearchText] = useState('');

  const {
    data,
    isLoading,
    setSearchParams,
    remove,
    isLoadingMutation: isLoadingRemove,
  } = useEventosCrud({ autoFetch: false });

  const eventosData = useMemo<ResponseEventoDto[]>(() => {
    return data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
  }, [data]);

  if (isLoading) {
    return <FancyLoading label='Carregando...' />;
  }

  if (isLoadingRemove) {
    return <FancyLoading label='Excluindo...' />;
  }

  const handleEditItem = (evento: ResponseEventoDto) => {
    router.push({
      pathname: '/admin/eventos/edit',
      params: {
        id: evento.id,
      },
    });
  };

  return (
    <FancyBasePage
      showSearchBar
      fabProps={{ onPress: () => router.push('admin/eventos/add') }}
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
                      type: ValueType.LITERAL as const,
                      value: text.trim(),
                    },
                  },
                ],
              },
            });
          } else {
            setSearchParams({});
          }
        },
      }}
    >
      <EventosListView
        // containerStyle={{ borderWidth: 1, borderColor: 'red' }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        onEditItem={handleEditItem}
        data={eventosData}
        listProps={{ style: styles.list }}
        onDeleteItem={(event) => remove(event.id!)}
      />
    </FancyBasePage>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 5, borderWidth: 0 },
});
