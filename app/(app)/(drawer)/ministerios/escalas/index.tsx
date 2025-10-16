import { router, useNavigation } from 'expo-router';
import { useState, useLayoutEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyHeaderButton from '../../../../../components/header/FancyHeaderButton';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import EventosListView from '../../../../../components/pages/admin/eventos/EventosListView';
import EventoCalendarView from '../../../../../components/pages/admin/eventos/EventoCalendarView';
import FancyLoading from '../../../../../components/FancyLoading';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { Evento } from '../../../../../domain/models/Evento';
import { Pallete } from '../../../../../constants/colors';

export default function MinisterioEscalasIndex() {
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

  const handleEditItem = useCallback((evento: Evento) => {
    router.push({
      pathname: '/ministerios/escalas/edit',
      params: {
        id: evento.id,
      },
    });
  }, []);

  if (isLoading) {
    return <FancyLoading label="Carregando..." />;
  }

  if (isLoadingRemove) {
    return <FancyLoading label="Processando..." />;
  }

  return (
    <FancyBasePage
      fabProps={{
        icon: { library: 'MaterialCommunityIcons', name: 'calendar-arrow-right', size: 30 },
        backgroundColor: Pallete.secondary,
        onPress: () => router.push('/ministerios/escalas/assistant'),
      }}
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
