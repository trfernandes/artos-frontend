import { StyleProp, StyleSheet, View, ViewStyle, FlatList } from 'react-native';
import DayView from './day/DayView';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import DateUtils from '../../utils/data_utils';
import FancyList, { FancyListProps } from '../list/FancyList';
import { useRef, useEffect, useState } from 'react';

interface YearData {
  year: number;
  months: number[];
}

interface FancyCalendarVerticalProps {
  startDate: Date;
  endDate: Date;
  markedDates?: Date[];
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  containerStyle?: StyleProp<ViewStyle>;
  listProps?: Omit<FancyListProps<YearData>, 'data' | 'renderItem'>;
}

export default function FancyCalendarVertical(props: FancyCalendarVerticalProps) {
  const [monthsList, setMonthsList] = useState<YearData[]>([]);
  const flatListRef = useRef<FlatList<YearData>>(null);

  // Usa useEffect para gerar a lista apenas uma vez
  useEffect(() => {
    let list: YearData[] = [];
    const inicio = new Date(props.startDate);
    const fim = new Date(props.endDate);
    inicio.setDate(1);
    fim.setDate(1);
    const dataAtual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);

    while (dataAtual <= fim) {
      const year = list.find(y => y.year === dataAtual.getFullYear());
      if (year) {
        year.months.push(dataAtual.getMonth());
      } else {
        list.push({
          year: dataAtual.getFullYear(),
          months: [dataAtual.getMonth()],
        });
      }
      dataAtual.setMonth(dataAtual.getMonth() + 1);
    }
    setMonthsList(list);
  }, [props.startDate, props.endDate]);

  const today = new Date();
  const initialIndex = monthsList.findIndex(item => item.year === today.getFullYear());

  const scrollToCurrentMonth = () => {
    if (flatListRef.current && initialIndex !== -1) {
      flatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition: 0.7,
        viewOffset: -42, // Rola 10 pixels para baixo
      });
    }
  };

  useEffect(() => {
    if (monthsList.length > 0) {
      const timer = setTimeout(() => {
        scrollToCurrentMonth();
      }, 500); // Atraso de 500ms para dar tempo ao componente de renderizar

      return () => clearTimeout(timer);
    }
  }, [monthsList]);

  const onScrollToIndexFailed = (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    });
  };

  return (
    <FancyList
      ref={flatListRef}
      data={monthsList}
      contentContainerStyle={[styles.container, props.containerStyle]}
      onScrollToIndexFailed={onScrollToIndexFailed}
      renderItem={({ item, index: i }) => (
        <View key={i}>
          {i > 0 && (
            <View
              style={{
                borderWidth: 0,
                paddingHorizontal: 5,
                gap: 20,
                alignItems: 'center',
                flexDirection: 'row',
                paddingVertical: 20,
                justifyContent: 'center',
              }}
            >
              <View style={{ height: 0, borderWidth: 0.5, borderColor: Pallete.border, flex: 1 }} />
              <FancyText size={'extraLarge'} type="bold" style={{ borderWidth: 0 }} color={Pallete.fonts.inactive2}>
                {item.year}
              </FancyText>
              <View style={{ height: 0, borderWidth: 0.5, borderColor: Pallete.border, flex: 1 }} />
            </View>
          )}
          <View style={{ gap: 25 }}>
            {item.months.map((month, index) => (
              <View key={index} style={{ gap: 10 }}>
                <View style={styles.header}>
                  <FancyText size={'medium'} type="bold">
                    {DateUtils.getMonthName(month)}
                  </FancyText>
                  <FancyText size={'medium'} type="bold" color={Pallete.fonts.inactive2}>
                    {item.year}
                  </FancyText>
                </View>
                <DayView
                  containerStyle={styles.calendar}
                  markedDatesType="SurroundCircle"
                  markedDates={props.markedDates}
                  selectedDate={props.selectedDate}
                  currentDate={new Date(item.year, month, 1)}
                  onSelectDate={props.onSelectDate}
                />
              </View>
            ))}
          </View>
        </View>
      )}
      {...props.listProps}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  calendar: { borderWidth: 0, flex: 1 },
  header: {
    borderWidth: 0,
    borderColor: 'hotpink',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
});
