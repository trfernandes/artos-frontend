import { StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyHeaderButton from '../../../../../components/header/FancyHeaderButton';
import EventoCalendarView from '../../../../../components/pages/admin/eventos/EventoCalendarView';
import EventosListView from '../../../../../components/pages/admin/eventos/EventosListView';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { Evento } from '../../../../../domain/models/Evento';

export default function EventosIndexPage() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [mode, setMode] = useState<'list' | 'calendar'>('list');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <FancyHeaderButton
            icon={mode === 'calendar' ? { ...DefaultIconsNames.list } : { ...DefaultIconsNames['calendar-month'] }}
            onPress={() => setMode(mode === 'list' ? 'calendar' : 'list')}
            buttonProps={{ containerStyle: { marginRight: 8, borderWidth: 0 } }}
          />
          <MainHeaderButtons />
        </View>
      ),
    });
  }, [navigation, mode]);

  const {
    data: eventosData,
    isLoading,
    setSearchParams,
    remove,
    isLoadingMutation: isLoadingRemove,
  } = useEventosCrud({ autoFetch: false, initialParams: {} });

  if (isLoading) {
    return <FancyLoading label="Carregando..." />;
  }

  if (isLoadingRemove) {
    return <FancyLoading label="Processando..." />;
  }

  const handleEditItem = (evento: Evento) => {
    router.push({
      pathname: '/admin/eventos/edit',
      params: {
        id: evento.id,
      },
    });
  };

  return (
    <FancyBasePage
      fabProps={{ onPress: () => router.push('admin/eventos/add') }}
      showSearchBar={mode === 'list'}
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
    >
      {mode === 'list' ? (
        <EventosListView
          onEditItem={handleEditItem}
          items={eventosData}
          listProps={{ style: styles.list }}
          onDeleteItem={event => remove(event.id!)}
        />
      ) : (
        <EventoCalendarView onEditItem={handleEditItem} items={eventosData} onDeleteItem={event => remove(event.id!)} />
      )}
    </FancyBasePage>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 5 },
});
