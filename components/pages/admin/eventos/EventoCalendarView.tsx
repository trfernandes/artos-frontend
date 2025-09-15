import { StyleSheet, View } from 'react-native';
import FancyCalendar, { FancyCalendarProps } from '../../../calendar/FancyCalendar';
import { DefaultIconsNames } from '../../../../constants/icons';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyList from '../../../list/FancyList';
import FancySeparator from '../../../FancySeparator';
import { useState } from 'react';
import DateUtils from '../../../../utils/data_utils';
import { router } from 'expo-router';
import { Evento } from '../../../../domain/models/Evento';

export type EventoCalendarViewProps = { items: Evento[]; calendarProps?: FancyCalendarProps };

export default function EventoCalendarView(props: EventoCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const selectedEvents = selectedDate
    ? props.items.filter(item => {
        return DateUtils.compareOnlyDate(item.dataInicio, selectedDate!);
      })
    : [];

  const hasEvents = props.items.map(item => item.dataInicio);

  return (
    <View style={styles.container}>
      <View style={{ borderWidth: DESIGN_MODE, borderColor: 'pink', height: 335 }}>
        <FancyCalendar
          markedDates={hasEvents}
          onChangeDate={date => setSelectedDate(date)}
          value={selectedDate}
          {...props.calendarProps}
          containerStyle={[styles.calendar, props.calendarProps?.containerStyle]}
        />
      </View>
      <FancySeparator />
      <View style={{ borderWidth: DESIGN_MODE, borderColor: 'blue', flex: 1 }}>
        <FancyList
          data={selectedEvents}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <FancyCard.Color
              key={index}
              title={item.nome}
              subtitle={
                item.dataInicio.toLocaleDateString('pt-BR') +
                ' - ' +
                item.dataInicio.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              }
              color={item.cor || 'blue'}
              actionButtons={[
                {
                  icon: { library: DefaultIconsNames['chevron-right'].library, name: DefaultIconsNames['chevron-right'].name, size: 18 },
                  onPress: () => {
                    router.push(`admin/eventos/edit`);
                  },
                },
              ]}
            />
          )}
        />
      </View>
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: { gap: 15, borderWidth: DESIGN_MODE, borderColor: 'red', flex: 1 },
  eventsList: { paddingHorizontal: 15, borderWidth: DESIGN_MODE, borderColor: 'magenta' },
  listContent: { gap: 10, borderWidth: DESIGN_MODE, borderColor: 'gold', paddingHorizontal: 15, flex: 1 },
  listContainer: { height: '100%' },
  calendar: { height: 'auto' },
});
