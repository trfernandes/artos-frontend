import { InteractionManager, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import DayView from './day/DayView';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import DateUtils from '../../utils/date_utils';
import FancyList, { FancyListProps } from '../list/FancyList';
import { DayProps } from './day/Day';

export interface MarkedData<A> {
  date: Date;
  T?: A;
  color?: string;
}

type MonthData = {
  year: number;
  month: number;
};

interface FancyCalendarVerticalProps<T extends string, A> {
  startDate: Date;
  endDate: Date;
  markedDates?: MarkedData<A>[];
  selectedDate?: Date;
  highlightCurrentMonth?: boolean;
  onSelectDate: (marked: MarkedData<A>) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  listProps?: Omit<FancyListProps<MonthData>, 'data' | 'renderItem'>;
  daysProps?: Pick<DayProps, 'markerColor'>;
  disablePastDates?: boolean;
  onStartMount?: () => void;
  onFinishMount?: () => void;
}

const monthKey = (y: number, m: number) => `${y}-${m}`;

export default function FancyCalendarVertical<T extends string, A>({
  startDate,
  endDate,
  markedDates = [],
  selectedDate,
  highlightCurrentMonth,
  onSelectDate,
  contentContainerStyle,
  listProps,
  daysProps,
  disablePastDates = false,
  onFinishMount,
  onStartMount,
}: FancyCalendarVerticalProps<T, A>) {
  // 1) Lista achatada de meses entre startDate e endDate
  const monthsList = useMemo<MonthData[]>(() => {
    const list: MonthData[] = [];
    const inicio = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const fim = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    const ptr = new Date(inicio);

    while (ptr <= fim) {
      list.push({ year: ptr.getFullYear(), month: ptr.getMonth() });
      ptr.setMonth(ptr.getMonth() + 1);
    }

    return list;
  }, [startDate, endDate]);

  // 2) Marcados por mês
  const markedByMonth = useMemo(() => {
    const map: Record<string, { date: Date; T?: A; color?: string }[]> = {};

    for (const md of markedDates) {
      const d = new Date(md.date);
      d.setHours(0, 0, 0, 0);
      const k = monthKey(d.getFullYear(), d.getMonth());
      (map[k] ||= []).push({ date: d, T: md.T, color: md.color });
    }

    return map;
  }, [markedDates]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 3) Índice EXATO do mês atual
  const monthIndexForToday = useMemo(() => {
    const idx = monthsList.findIndex((m) => m.year === today.getFullYear() && m.month === today.getMonth());
    return idx >= 0 ? idx : 0;
  }, [monthsList, today]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      onSelectDate({ date: new Date(date) });
    },
    [onSelectDate],
  );

  const startRef = useRef(onStartMount);
  const finishRef = useRef(onFinishMount);

  useEffect(() => {
    startRef.current = onStartMount;
    finishRef.current = onFinishMount;
  }, [onStartMount, onFinishMount]);

  // Efeito de "mount" que roda só uma vez por montagem
  useEffect(() => {
    startRef.current?.();

    const task = InteractionManager.runAfterInteractions(() => {
      finishRef.current?.();
    });

    return () => task.cancel();
  }, []);

  return (
    <FancyList
      data={monthsList}
      extraData={markedDates}
      initialScrollIndex={monthIndexForToday}
      keyExtractor={(item) => `${item.year}-${item.month}`}
      contentContainerStyle={[styles.container, contentContainerStyle]}
      ListFooterComponent={<View></View>}
      renderItem={({ item, index }) => {
        const isCurrentMonth = item.year === today.getFullYear() && item.month === today.getMonth();

        const monthMarked = markedByMonth[monthKey(item.year, item.month)] ?? [];

        const showYearHeader = index === 0 || monthsList[index - 1].year !== item.year;

        return (
          <View>
            {showYearHeader && index > 0 && (
              <View style={styles.yearSeparator}>
                <View style={styles.yearLine} />
                <FancyText size='extraLarge' type='bold' color={Pallete.fonts.inactive2}>
                  {item.year}
                </FancyText>
                <View style={styles.yearLine} />
              </View>
            )}

            <View style={{ gap: 10 }}>
              <View style={styles.header}>
                <FancyText
                  size='large'
                  type='bold'
                  color={highlightCurrentMonth && isCurrentMonth ? Pallete.terciary : undefined}
                >
                  {DateUtils.getMonthName(item.month)}
                </FancyText>
                <FancyText size='large' type='bold' color={Pallete.fonts.inactive2} style={{ borderWidth: 0, lineHeight: 12 }}>
                  {item.year}
                </FancyText>
              </View>

              <DayView
                containerStyle={styles.calendar}
                markedDatesType='SurroundCircle'
                markedDates={monthMarked}
                selectedDate={selectedDate}
                currentDate={new Date(item.year, item.month, 1)}
                onSelectDate={handleSelectDate}
                daysProps={daysProps}
                disablePastDates={disablePastDates}
              />
            </View>
          </View>
        );
      }}
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
    alignItems: 'flex-end',
    paddingHorizontal: 0,
    // borderWidth: 1,
    paddingVertical: 5,
  },
  yearSeparator: {
    paddingHorizontal: 0,
    gap: 20,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  yearLine: {
    height: 0,
    borderWidth: 0.5,
    borderColor: Pallete.border,
    flex: 1,
  },
});
