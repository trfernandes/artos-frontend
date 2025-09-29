import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import DayViewHeader from './DayHeader';
import Day, { DayProps } from './Day';
import React, { useMemo, useCallback } from 'react';

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

const isSameDay = (a?: Date, b?: Date) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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
  const daysMatrix = useMemo(() => generateDays(props.currentDate.getFullYear(), props.currentDate.getMonth()), [props.currentDate]);

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

              const cellDate = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth(), day);
              if (isPrevMonthDay) {
                cellDate.setMonth(cellDate.getMonth() - 1);
              } else if (isNextMonthDay) {
                cellDate.setMonth(cellDate.getMonth() + 1);
              }
              cellDate.setHours(0, 0, 0, 0);

              const beforeMinimum = normalizedMinimum ? cellDate < normalizedMinimum : false;
              const afterMaximum = normalizedMaximum ? cellDate > normalizedMaximum : false;
              const isPastDate = disablePastDates ? cellDate < today : false;

              const outsideMonth = !isCurrentMonthDay;
              if (outsideMonth && !showOtherMonthDays) {
                return <View key={`empty-${rowIndex}-${columnIndex}`} style={{ width: `${100 / 8}%` }} />;
              }

              const isDisabled = outsideMonth || beforeMinimum || afterMaximum || isPastDate;
              const isToday = isSameDay(cellDate, today);
              const isSelected = props.selectedDate ? isSameDay(cellDate, props.selectedDate) : false;

              const markedEntry = props.markedDates?.find(d => isSameDay(d.date, cellDate));
              const isMarked = !!markedEntry;

              const highlight =
                markedDatesType === 'SurroundCircle'
                  ? isMarked || isSelected
                  : isSelected;

              const showMarker = markedDatesType === 'bottomPoint' && isMarked;
              const markerColor = markedEntry?.color ?? props.daysProps?.markerColor;

              const dayType: DayProps['type'] = isDisabled ? 'inactive' : isToday ? 'actual' : 'default';

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
    flex: 1,
    gap:10
  },
  weekContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap:8
  },
  weekRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default React.memo(DayView);
