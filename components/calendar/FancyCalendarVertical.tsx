import { StyleProp, StyleSheet, View, ViewStyle, FlatList } from 'react-native';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import DayView from './day/DayView';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import DateUtils from '../../utils/date_utils';
import FancyList, { FancyListProps } from '../list/FancyList';
import { DayProps } from './day/Day';

interface YearData {
  year: number;
  months: number[];
}

export interface MarkedData<T extends string, A> {
  date: Date;
  T?: A;
}

interface FancyCalendarVerticalProps<T extends string, A> {
  startDate: Date;
  endDate: Date;
  markedDates?: MarkedData<T, A>[];
  selectedDate?: Date;
  highlightCurrentMonth?: boolean;
  onSelectDate: (marked: MarkedData<T, A>) => void;
  containerStyle?: StyleProp<ViewStyle>;
  listProps?: Omit<FancyListProps<YearData>, 'data' | 'renderItem'>;
  onLayout?: () => void;
  daysProps?: Pick<DayProps, 'markerColor'>;
  disablePastDates?: boolean;
}

const monthKey = (y: number, m: number) => `${y}-${m}`;

export default function FancyCalendarVertical<T extends string, A>({
  startDate,
  endDate,
  markedDates = [],
  selectedDate,
  highlightCurrentMonth,
  onSelectDate,
  containerStyle,
  listProps,
  daysProps,
  disablePastDates = false,
}: FancyCalendarVerticalProps<T, A>) {
  // console.log('FancyCalendarVertical render', daysProps);

  const [monthsList, setMonthsList] = useState<YearData[]>([]);
  const flatListRef = useRef<FlatList<YearData>>(null);

  useEffect(() => {
    const list: YearData[] = [];
    const inicio = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const fim = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const ptr = new Date(inicio);

    while (ptr <= fim) {
      const y = ptr.getFullYear();
      const m = ptr.getMonth();
      const found = list.find(it => it.year === y);
      if (found) found.months.push(m);
      else list.push({ year: y, months: [m] });
      ptr.setMonth(ptr.getMonth() + 1);
    }
    setMonthsList(list);
  }, [startDate, endDate]);

  // ✅ Normaliza marcados e particiona por mês (reduz payload pro DayView)
  const markedByMonth = useMemo(() => {
    const map: Record<string, { date: Date; T?: A }[]> = {};
    for (const md of markedDates) {
      const d = new Date(md.date.getFullYear(), md.date.getMonth(), md.date.getDate()); // data limpa
      const k = monthKey(d.getFullYear(), d.getMonth());
      (map[k] ||= []).push({ date: d, T: md.T });
    }
    return map;
  }, [markedDates]);

  // ✅ Índice inicial: ano que contém o mês atual
  const today = useMemo(() => new Date(), []);
  const initialIndex = useMemo(() => {
    const idx = monthsList.findIndex(it => it.year === today.getFullYear() && it.months.includes(today.getMonth()));
    return idx < 0 ? 0 : idx;
  }, [monthsList, today]);

  // ✅ Callback estável
  const handleSelectDate = useCallback((date: Date) => onSelectDate({ date: new Date(date) }), [onSelectDate]);

  return (
    <FancyList
      ref={flatListRef}
      data={monthsList}
      keyExtractor={item => String(item.year)}
      initialScrollIndex={initialIndex} // posiciona direto
      onScrollToIndexFailed={({ index }) => {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index, animated: false });
        }, 250);
      }}
      contentContainerStyle={[styles.container, containerStyle]}
      renderItem={({ item, index: i }) => (
        <View key={i}>
          {i > 0 && (
            <View style={styles.yearSeparator}>
              <View style={styles.yearLine} />
              <FancyText size="extraLarge" type="bold" color={Pallete.fonts.inactive2}>
                {item.year}
              </FancyText>
              <View style={styles.yearLine} />
            </View>
          )}

          <View style={{ gap: 25 }}>
            {item.months.map((month, idx) => {
              const highlight = !!highlightCurrentMonth && item.year === today.getFullYear() && month === today.getMonth();

              const md = markedByMonth[monthKey(item.year, month)] ?? [];

              return (
                <View key={idx} style={{ gap: 10 }}>
                  <View style={styles.header}>
                    <FancyText size="large" type="bold" color={highlight ? Pallete.terciary : undefined}>
                      {DateUtils.getMonthName(month)}
                    </FancyText>
                    <FancyText size="medium" type="bold" color={Pallete.fonts.inactive2}>
                      {item.year}
                    </FancyText>
                  </View>

                  <DayView
                    containerStyle={styles.calendar}
                    markedDatesType="SurroundCircle"
                    markedDates={md}
                    selectedDate={selectedDate}
                    currentDate={new Date(item.year, month, 1)}
                    onSelectDate={handleSelectDate}
                    daysProps={daysProps}
                    disablePastDates={disablePastDates}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
      {...listProps}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 15 },
  calendar: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 15,
  },
  yearSeparator: {
    paddingHorizontal: 5,
    gap: 20,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  yearLine: { height: 0, borderWidth: 0.5, borderColor: Pallete.border, flex: 1 },
});
