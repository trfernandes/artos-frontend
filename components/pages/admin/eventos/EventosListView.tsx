import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyList, { FancyListProps } from '../../../list/FancyList';
import FancyText from '../../../FancyText';
import DateUtils from '../../../../utils/date_utils';
import { Pallete } from '../../../../constants/colors';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../constants/icons';
import { Evento } from '../../../../domain/models/Evento';
import { format } from 'date-fns';
import { router } from 'expo-router';

export type EventoGroup = {
  month: number;
  year: number;
  events: Evento[];
};

export type EventosListProps = {
  items: Evento[];
  listProps?: Omit<FancyListProps<EventoGroup>, 'data' | 'renderItem'>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onDeleteItem?: (item: Evento) => void;
};

export default function EventosListView({
  items,
  listProps,
  containerStyle,
  contentContainerStyle,
  onDeleteItem,
}: EventosListProps) {
  let data: { month: number; year: number; events: Evento[] }[] = [];

  items.forEach(item => {
    const month = new Date(item.dataInicio)?.getMonth();
    const year = new Date(item.dataInicio)?.getFullYear();

    const existing = data.find(d => d.month === month && d.year === year);
    if (existing) {
      existing.events.push(item);
    } else {
      data.push({ month, year, events: [item] });
    }
  });

  data.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return (
    <View style={containerStyle}>
      <FancyList
        data={data}
        fadingEdgeLength={200}
        contentContainerStyle={[styles.listContent, contentContainerStyle]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }: { item: EventoGroup; index: number }) => (
          <View key={index}>
            <View style={styles.header}>
              <FancyText size={'large'} type="bold">
                {DateUtils.getMonthName(item.month)}
              </FancyText>
              <FancyText size={'large'} type="bold" color={Pallete.fonts.inactive2}>
                {item.year}
              </FancyText>
            </View>

            <View style={styles.eventList}>
              {item.events.map((event, index) => (
                <FancyCard.Color
                  key={index}
                  title={event.nome}
                  subtitle={format(new Date(event.dataInicio), 'dd/MM/yyyy HH:mm')}
                  additionalData1={format(new Date(event.dataTermino), 'dd/MM/yyyy HH:mm')}
                  color={event.cor || 'blue'}
                  actionButtons={[
                    {
                      icon: {
                        library: DefaultIconsNames.edit.library,
                        name: DefaultIconsNames.edit.name,
                        size: 18,
                      },
                      onPress: () => {
                        router.push({
                          pathname: '/admin/eventos/edit',
                          params: {
                            id: event.id,
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
                        Alert.alert(
                          'Exclusão',
                          `Tem certeza que deseja remover o ministério "${event.nome}?"`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Remover',
                              style: 'destructive',
                              onPress: () => {
                                onDeleteItem?.(event);
                              },
                            },
                          ]
                        );
                      },
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}
        {...listProps}
      />
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  listContent: { gap: 10, borderWidth: DESIGN_MODE, borderColor: 'indigo' },
  header: {
    borderWidth: DESIGN_MODE,
    borderColor: 'hotpink',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
  eventList: { gap: 10, paddingHorizontal: 8 },
  separator: { height: 15 },
});
