import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import DayViewHeader from './DayHeader';
import Day, { DayProps } from './Day';
import React, { useMemo, useCallback } from 'react';
import DateUtils from '../../../utils/date_utils';

const generateDays = (year: number, month: number): number[][] => {
  const matrix: number[][] = [];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDaysToShow = firstDayOfWeek;
  const totalCells = prevMonthDaysToShow + daysInMonth;
  const weeksToShow = totalCells > 35 ? 6 : 5;

  let dayCounter = 1;
  let nextMonthDayCounter = 1;

  for (let row = 0; row < weeksToShow; row++) {
    const week: number[] = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;

      if (cellIndex < prevMonthDaysToShow) {
        week.push(daysInPrevMonth - prevMonthDaysToShow + cellIndex + 1);
      } else if (dayCounter <= daysInMonth) {
        week.push(dayCounter++);
      } else {
        week.push(nextMonthDayCounter++);
      }
    }
    matrix.push(week);
  }

  return matrix;
};

export type DayViewProps = {
  selectedDate?: Date;
  currentDate: Date;
  markedDatesType?: 'bottomPoint' | 'SurroundCircle';
  markedDates?: { date: Date; color?: string }[];
  containerStyle?: StyleProp<ViewStyle>;
  onSelectDate: (date: Date) => void;
  showOtherMonthDays?: boolean;
  daysProps?: Pick<DayProps, 'markerColor'>;
  minimumDate?: Date;
  maximumDate?: Date;
  disablePastDates?: boolean;
};

export function DayView({
  markedDatesType = 'bottomPoint',
  showOtherMonthDays = true,
  minimumDate,
  maximumDate,
  disablePastDates = false,
  ...props
}: DayViewProps) {
  const daysMatrix = useMemo(
    () => generateDays(props.currentDate.getFullYear(), props.currentDate.getMonth()),
    [props.currentDate]
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const normalizedMinimum = useMemo(() => {
    if (!minimumDate) return undefined;
    const d = new Date(minimumDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minimumDate]);

  const normalizedMaximum = useMemo(() => {
    if (!maximumDate) return undefined;
    const d = new Date(maximumDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [maximumDate]);

  const handlePress = useCallback(
    (date: Date, disabled: boolean) => {
      if (disabled) return;
      props.onSelectDate?.(date);
    },
    [props.onSelectDate]
  );

  return (
    <View style={[styles.container, props.containerStyle]}>
      <DayViewHeader />
      <View style={styles.weekContainer}>
        {daysMatrix.map((week, rowIndex) => (
          <View key={rowIndex} style={styles.weekRow}>
            {week.map((day, columnIndex) => {
              const isPrevMonthDay = rowIndex === 0 && day > 7;
              const isNextMonthDay = rowIndex >= 4 && day < 15;
              const isCurrentMonthDay = !isPrevMonthDay && !isNextMonthDay;

              const baseYear = props.currentDate.getFullYear();
              const baseMonth = props.currentDate.getMonth();

              let targetMonth = baseMonth;
              if (isPrevMonthDay) {
                targetMonth -= 1;
              } else if (isNextMonthDay) {
                targetMonth += 1;
              }

              const cellDate = new Date(baseYear, targetMonth, day);
              cellDate.setHours(0, 0, 0, 0);

              const beforeMinimum = normalizedMinimum ? cellDate < normalizedMinimum : false;
              const afterMaximum = normalizedMaximum ? cellDate > normalizedMaximum : false;
              const isPastDate = disablePastDates ? cellDate < today : false;

              const outsideMonth = !isCurrentMonthDay;

              if (outsideMonth && !showOtherMonthDays) {
                return (
                  <View key={`empty-${rowIndex}-${columnIndex}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />
                );
              }

              const isDisabled = outsideMonth || beforeMinimum || afterMaximum || isPastDate;
              const isToday = DateUtils.equal(cellDate, today);
              const isSelected = props.selectedDate ? DateUtils.equal(cellDate, props.selectedDate) : false;

              const markedEntries = props.markedDates?.filter(d => DateUtils.equal(d.date, cellDate)) ?? [];

              const isMarked = markedEntries.length > 0;

              const highlight = markedDatesType === 'SurroundCircle' ? isMarked || isSelected : isSelected;

              const showMarker = markedDatesType === 'bottomPoint' && isMarked;

              const dayType: DayProps['type'] = isDisabled ? 'inactive' : isToday ? 'actual' : 'default';

              // monta cores dos marcadores (um ou vários)
              const markerColorsFromMarks = markedEntries.map(m => m.color).filter((c): c is string => !!c);

              let markerColor: DayProps['markerColor'] | undefined;

              if (markerColorsFromMarks.length === 1) {
                markerColor = markerColorsFromMarks[0];
              } else if (markerColorsFromMarks.length > 1) {
                markerColor = markerColorsFromMarks;
              } else {
                markerColor = props.daysProps?.markerColor;
              }

              return (
                <Day
                  key={`day-${rowIndex}-${columnIndex}`}
                  day={day}
                  selected={highlight}
                  type={dayType}
                  showMarker={showMarker}
                  markerType={markedDatesType}
                  markerColor={markerColor}
                  disabled={isDisabled}
                  onPress={() => handlePress(cellDate, isDisabled)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  weekContainer: {
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default React.memo(DayView);
