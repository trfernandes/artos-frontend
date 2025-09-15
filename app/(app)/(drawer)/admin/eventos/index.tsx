import { StyleSheet, View } from 'react-native';
import FancyPageView from '../../../../../components/containers/FancyPageView';
import FancySearchBar from '../../../../../components/FancySearchBar';
import { router, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyHeaderButton from '../../../../../components/header/FancyHeaderButton';
import FancyFab from '../../../../../components/buttons/FancyFab';
import EventoCalendarView from '../../../../../components/pages/admin/eventos/EventoCalendarView';
import EventosList from '../../../../../components/pages/admin/eventos/EventosList';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';
import { useEventos } from '../../../../../hooks/useEventos';

export default function EventosIndexPage() {
  const navigation = useNavigation();
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

  const { data: eventosData } = useEventos({ autoFetch: false, initialParams: {} });

  return (
    <FancyPageView style={styles.container}>
      {mode === 'list' && <FancySearchBar containerStyle={styles.searchbar} />}
      <View style={styles.contentContainer}>
        {mode === 'list' ? (
          <EventosList items={eventosData} listProps={{ style: styles.list }} onPressItem={_ => router.push(`admin/eventos/edit`)} />
        ) : (
          <EventoCalendarView items={eventosData} calendarProps={{ containerStyle: styles.calendar }} />
        )}
      </View>

      <FancyFab
        onPress={() => {
          router.push('admin/eventos/add');
        }}
      />
    </FancyPageView>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: { gap: 10, paddingVertical: 10, flex: 1 },
  searchbar: { marginHorizontal: 20, borderWidth: DESIGN_MODE },
  contentContainer: { borderWidth: DESIGN_MODE, flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 5, borderWidth: DESIGN_MODE },
  calendar: { borderWidth: DESIGN_MODE, paddingHorizontal: 20 },
});
