import { useNavigation } from 'expo-router';
import { useState, useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import FancyLoading from '../../../../../components/FancyLoading';
import FancyHeaderButton from '../../../../../components/header/FancyHeaderButton';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';
import EventoCalendarView from '../../../../../components/pages/admin/eventos/EventoCalendarView';
import EventosListView from '../../../../../components/pages/admin/eventos/EventosListView';
import FancyBasePage from '../../../../../components/pages/base/FancyBasePage';
import { DefaultIconsNames } from '../../../../../constants/icons';
import { Operator, ValueType } from '../../../../../domain/utils/query_utils';
import { useEventosCrud } from '../../../../../hooks/useEventosCrud';

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

  if (isLoading) {
    return <FancyLoading label="Carregando..." />;
  }

  if (isLoadingRemove) {
    return <FancyLoading label="Processando..." />;
  }

  return (
    <FancyBasePage
      showFab={false}
      showSearchBar={mode === 'list'}
      searchBarProps={{
        value: searchText,
        onSearch: text => {
          console.log(text);
          setSearchText(text.trim());
          if (text && text.trim() !== '') {
            setSearchParams({
              where: {
                conditions: [{ path: 'nome', operator: Operator.ILIKE, value: { type: ValueType.LITERAL, value: text.trim() } }],
              },
            });
          } else {
            setSearchParams({});
          }
        },
      }}
    >
      {mode === 'list' ? (
        <EventosListView items={eventosData} listProps={{ style: styles.list }} onDeleteItem={event => remove(event.id!)} />
      ) : (
        <EventoCalendarView items={eventosData} onDeleteItem={event => remove(event.id!)} />
      )}
    </FancyBasePage>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 5 },
});
