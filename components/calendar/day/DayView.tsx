import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import DayViewHeader from './DayHeader';
import Day from './Day';
import DateUtils from '../../../utils/data_utils';
import React from 'react';

const generateDays = (year: number, month: number): number[][] => {
  const matrix: number[][] = [];

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (dom) a 6 (sab)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Quantos dias do mês anterior serão exibidos no calendário
  const prevMonthDaysToShow = firstDayOfWeek; // Exatamente o número de dias antes do 1º dia do mês

  const totalCells = prevMonthDaysToShow + daysInMonth;
  const weeksToShow = totalCells > 35 ? 6 : 5; // 5 ou 6 linhas, conforme necessário

  let dayCounter = 1;
  let nextMonthDayCounter = 1;

  for (let row = 0; row < weeksToShow; row++) {
    const week: number[] = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;

      if (cellIndex < prevMonthDaysToShow) {
        // Dias do mês anterior em ordem crescente
        week.push(daysInPrevMonth - prevMonthDaysToShow + cellIndex + 1);
      } else if (dayCounter <= daysInMonth) {
        // Dias do mês atual
        week.push(dayCounter++);
      } else {
        // Dias do próximo mês
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
};

export function DayView({ markedDatesType = 'bottomPoint', showOtherMonthDays = true, ...props }: DayViewProps) {
  const daysMatrix = generateDays(props.currentDate!.getFullYear(), props.currentDate!.getMonth());

  return (
    <View style={[styles.container, props.containerStyle]}>
      <DayViewHeader />
      <View style={styles.weekContainer}>
        {daysMatrix.map((week, i) => (
          <View key={i} style={styles.weekRow}>
            {week.map((day, j) => {
              const isPrevMonthDay = i === 0 && day > 7;
              const isNextMonthDay = i >= 4 && day < 15;
              const isCurrentMonthDay = !isPrevMonthDay && !isNextMonthDay;
              const newDate = new Date(props.currentDate!.getFullYear(), props.currentDate!.getMonth(), day);
              const isSelected =
                isCurrentMonthDay &&
                newDate.getDate() === props.selectedDate?.getDate() &&
                newDate.getMonth() === props.selectedDate?.getMonth() &&
                newDate.getFullYear() === props.selectedDate?.getFullYear();
              const today =
                isCurrentMonthDay &&
                newDate.getDate() === new Date().getDate() &&
                newDate.getMonth() === new Date().getMonth() &&
                newDate.getFullYear() === new Date().getFullYear();
              const marked =
                (isCurrentMonthDay && props.markedDates?.some(d => DateUtils.compareOnlyDate(d.date, newDate))) ||
                (isPrevMonthDay &&
                  props.markedDates?.some(
                    d =>
                      d.date.getTime() ==
                      new Date(props.currentDate!.getFullYear(), props.currentDate!.getMonth() - 1, day).getTime()
                  )) ||
                (isNextMonthDay &&
                  props.markedDates?.some(
                    d =>
                      d.date.getTime() ==
                      new Date(props.currentDate!.getFullYear(), props.currentDate!.getMonth() + 1, day).getTime()
                  ));

              return ((isNextMonthDay || isPrevMonthDay) && showOtherMonthDays) || isCurrentMonthDay ? (
                <Day
                  key={j}
                  day={day}
                  selected={isSelected || (marked && markedDatesType === 'SurroundCircle')}
                  showMarker={marked && markedDatesType === 'bottomPoint'}
                  markerType={markedDatesType}
                  markerColor={
                    marked
                      ? props.markedDates?.find(
                          d => new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()).getTime() === newDate.getTime()
                        )?.color
                      : undefined
                  }
                  type={isCurrentMonthDay ? (today ? 'actual' : 'default') : 'inactive'}
                  onPress={() => {
                    const date = new Date(
                      props.currentDate.getFullYear(),
                      isPrevMonthDay
                        ? props.currentDate.getMonth() - 1
                        : isNextMonthDay
                        ? props.currentDate.getMonth() + 1
                        : props.currentDate.getMonth(),
                      day
                    );
                    if (isPrevMonthDay) {
                      date.setMonth(props.currentDate!.getMonth() - 1);
                    } else if (isNextMonthDay) {
                      date.setMonth(props.currentDate!.getMonth() + 1);
                    }
                    props.onSelectDate?.(date);
                  }}
                />
              ) : (
                <View key={j} style={{ width: `${100 / 9}%` }}></View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: { borderWidth: DESIGN_MODE, borderColor: 'brown', flex: 1 },
  weekContainer: {
    flex: 1,
    borderWidth: DESIGN_MODE,
    borderColor: 'blue',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
  },
});

export default React.memo(DayView);
