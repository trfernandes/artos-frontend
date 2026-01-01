import { Alert, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyList, { FancyListProps } from '../../../list/FancyList';
import FancyText from '../../../FancyText';
import DateUtils from '../../../../utils/date_utils';
import { Pallete } from '../../../../constants/colors';
import { FancyCard } from '../../../cards/Horizontal/FancyCard';
import { DefaultIconsNames } from '../../../../constants/icons';
import {
  EventoModel,
  RecorrenciaDiaSemanaEnumMap,
  RecorrenciaEnumMap,
  RecorrenciaSemanaMesEnumMap,
} from '../../../../domain/models/Evento';
import { generateRecorrenciaDescription } from '../../../../hooks/useEventosCrud';
import { format } from 'date-fns';

export type EventoGroup = {
  month: number;
  year: number;
  events: EventoModel[];
};

export type EventosListProps = {
  items: EventoModel[];
  listProps?: Omit<FancyListProps<EventoGroup>, 'data' | 'renderItem'>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEditItem: (item: EventoModel) => void;
  onDeleteItem: (item: EventoModel) => void;
};

export default function EventosListView({
  items,
  listProps,
  containerStyle,
  contentContainerStyle,
  onDeleteItem,
  onEditItem,
}: EventosListProps) {
  let data: {
    month: number;
    year: number;
    events: EventoModel[];
  }[] = [];

  items.forEach(item => {
    const month = item.dataInicio.getMonth();
    const year = item.dataInicio.getFullYear();

    const existing = data.find(d => d.month === month && d.year === year);
    if (existing) {
      existing.events.push(item);
    } else {
      data.push({
        month,
        year,
        events: [item],
      });
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
            <View
              style={[
                styles.header,
                index > 0 && {
                  marginTop: 10,
                },
              ]}
            >
              <FancyText size={'largeMedium'} type="bold" color={Pallete.fonts.inactive}>
                {DateUtils.getMonthName(item.month)}
              </FancyText>
              <FancyText size={'largeMedium'} type="bold" color={Pallete.fonts.inactive2}>
                {item.year}
              </FancyText>
            </View>

            <View style={styles.eventList}>
              {item.events.map((item, index) => (
                <FancyCard.Color
                  key={index}
                  title={item.nome}
                  subtitle={
                    format(item.dataInicio,'dd/MM/yyyy HH:mm') +
                    ' - ' +
                    (item.dataTermino ? format(item.dataTermino, 'dd/MM/yyyy HH:mm') : 'Sem término')
                  }
                  additionalData1={generateRecorrenciaDescription(
                    RecorrenciaEnumMap[item.recorrencia!],
                    item.recorrenciaSemanaDias?.map(i => RecorrenciaDiaSemanaEnumMap[i]) || [],
                    item.recorrenciaACadaMeses!,
                    item.recorrenciaSemanasMes?.map(i => RecorrenciaSemanaMesEnumMap[i]) || []
                  )}
                  color={item.cor || 'blue'}
                  actionButtons={[
                    {
                      icon: {
                        library: DefaultIconsNames.edit.library,
                        name: DefaultIconsNames.edit.name,
                        size: 18,
                      },
                      onPress: () => onEditItem?.(item),
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
                          {
                            text: 'Cancelar',
                            style: 'cancel',
                          },
                          {
                            text: 'Remover',
                            style: 'destructive',
                            onPress: () => {
                              onDeleteItem?.(item);
                            },
                          },
                        ]);
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
  listContent: {
    gap: 10,
    borderWidth: DESIGN_MODE,
    borderColor: 'indigo',
  },
  header: {
    borderWidth: DESIGN_MODE,
    borderColor: 'hotpink',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
  eventList: {
    gap: 10,
    paddingHorizontal: 8,
  },
  separator: {
    height: 15,
  },
});
