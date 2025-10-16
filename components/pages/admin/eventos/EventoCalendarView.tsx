import { Alert, StyleSheet, View } from 'react-native';
import FancyCalendar, { FancyCalendarProps } from '../../../calendar/FancyCalendar';
import FancySeparator from '../../../FancySeparator';
import { useEffect, useState } from 'react';
import { Evento } from '../../../../domain/models/Evento';
import { useEventosCrud } from '../../../../hooks/useEventosCrud';
import { Conjunction, Operator, ValueType } from '../../../../domain/utils/query_utils';
import FancyList from '../../../list/FancyList';
import { DefaultIconsNames } from '../../../../constants/icons';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import FancyLoading from '../../../FancyLoading';
import { Pallete } from '../../../../constants/colors';

export type EventoCalendarViewProps = {
  items: Evento[];
  calendarProps?: FancyCalendarProps;
  onDeleteItem: (item: Evento) => void;
  onEditItem: (item: Evento) => void;
};

export default function EventoCalendarView(props: EventoCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: eventosData, setSearchParams, isLoading } = useEventosCrud();

  useEffect(() => {
    setSearchParams({
      where: {
        conjunction: Conjunction.AND,
        conditions: [
          {
            path: 'dataInicio',
            operator: Operator.GTE,
            value: {
              type: ValueType.LITERAL,
              value: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toDateString(),
            },
          },
          {
            path: 'dataTermino',
            operator: Operator.LTE,
            value: {
              type: ValueType.LITERAL,
              value: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toDateString(),
            },
          },
        ],
      },
    });
  }, [selectedDate]);

  return (
    <View style={[styles.container]}>
      <View style={{ borderWidth: DESIGN_MODE, borderColor: 'pink', height: 335, opacity: 1 }}>
        {isLoading && (
          <View style={{ position: 'absolute', zIndex: 1000, height: '100%', width: '100%', backgroundColor: 'chocolate' }}>
            <FancyLoading label="Carregando eventos..." />
          </View>
        )}
        <FancyCalendar
          markedDates={
            eventosData
              ? eventosData.map(ev => ({
                  date: new Date(ev.dataInicio),
                  color: ev.cor,
                }))
              : []
          }
          onChangeSelectedDate={setSelectedDate}
          onChangeMonthVisualization={setSelectedDate}
          value={selectedDate}
          {...props.calendarProps}
          containerStyle={[styles.calendar, props.calendarProps?.containerStyle]}
        />
      </View>
      <FancySeparator />
      <View style={{ borderWidth: DESIGN_MODE, borderColor: 'blue', flex: 1 }}>
        <FancyList
          data={eventosData.filter(ev => {
            const date = new Date(ev.dataInicio);
            return (
              new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime() ===
              new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
            );
          })}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <FancyCard.Color
              key={index}
              title={item.nome}
              subtitle={
                new Date(item.dataInicio).toLocaleDateString('pt-BR') +
                ' - ' +
                new Date(item.dataInicio).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              }
              color={item.cor || 'blue'}
              actionButtons={[
                {
                  icon: {
                    library: DefaultIconsNames.edit.library,
                    name: DefaultIconsNames.edit.name,
                    size: 18,
                  },
                  onPress: () => {
                    props.onEditItem(item);
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
                          props.onDeleteItem?.(item);
                        },
                      },
                    ]);
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
  eventsList: { paddingHorizontal: 0, borderWidth: DESIGN_MODE, borderColor: 'magenta' },
  listContent: { gap: 10, borderWidth: DESIGN_MODE, borderColor: 'gold', paddingHorizontal:0, flex: 1 },
  listContainer: { height: '100%' },
  calendar: { height: 'auto' },
});
