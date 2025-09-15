import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyCalendarHeader from './FancyCalendarHeader';
import DayView from './day/DayView';
import { useEffect, useState } from 'react';
import MonthView from './month/MonthView';
import YearView from './year/YearView';
import { Gesture, Directions, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Pallete } from '../../constants/colors';

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];
export enum CalendarVisualization {
  Day,
  Month,
  Year,
}
export type FancyCalendarProps = {
  maximumDate?: Date;
  minimumDate?: Date;
  markedDates?: Date[];
  containerStyle?: StyleProp<ViewStyle>;
  canChangeMonthsOnSwiple?: boolean;
  onChangeDate?: (date: Date) => void;
  border?: boolean;
  value?: Date;
};

export default function FancyCalendar({ canChangeMonthsOnSwiple = true, ...props }: FancyCalendarProps) {
  const [visualization, setVisualization] = useState<CalendarVisualization>(CalendarVisualization.Day);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(props.value);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  //Atualiza o dia selecionado conforme passado pelo pai
  useEffect(() => {
    setSelectedDate(props.value);
  }, [props.value]);

  const defaultMinDate = new Date();
  const defaultMaxDate = new Date();
  defaultMinDate.setFullYear(1900);
  defaultMaxDate.setFullYear(defaultMaxDate.getFullYear() + 50);
  const minDate: Date = props.minimumDate || defaultMinDate;
  const maxDate: Date = props.maximumDate || defaultMaxDate;

  const handleSwipeLeftDayView = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleSwipeRightDayView = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const flingGestureLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (!canChangeMonthsOnSwiple) return;
      if (visualization === CalendarVisualization.Day) {
        runOnJS(handleSwipeRightDayView)();
      }
    });

  const flingGestureRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(a => {
      if (!canChangeMonthsOnSwiple) return;
      if (visualization === CalendarVisualization.Day) {
        runOnJS(handleSwipeLeftDayView)(); // 🔐 chamada segura para setState
      }
    });

  return (
    <View style={[styles.container, props.containerStyle, props.border && styles.border]}>
      <View style={styles.headerContainer}>
        <FancyCalendarHeader
          calendarProps={props}
          visualization={visualization}
          currentDate={currentDate}
          onChangeVisualization={setVisualization}
          onGoToToday={() => setCurrentDate(new Date())}
          onNextMonth={() => {
            const newDate = new Date(currentDate!.setMonth(currentDate!.getMonth() + 1));
            setCurrentDate(newDate);
          }}
          onPreviousMonth={() => {
            const newDate = new Date(currentDate!.setMonth(currentDate!.getMonth() - 1));
            if (newDate >= minDate) setCurrentDate(newDate);
          }}
        />
      </View>
      <GestureDetector gesture={flingGestureLeft}>
        <GestureDetector gesture={flingGestureRight}>
          <View style={styles.contentContainer}>
            {visualization === CalendarVisualization.Day && (
              <DayView
                currentDate={currentDate}
                selectedDate={selectedDate}
                markedDates={props.markedDates}
                onSelectDate={date => {
                  setSelectedDate(date);
                  props.onChangeDate?.(date);
                }}
              />
            )}
            {visualization === CalendarVisualization.Month && (
              <MonthView
                selectedDate={selectedDate}
                currentDate={currentDate}
                onSelectMonth={month => {
                  setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
                  setVisualization(CalendarVisualization.Day);
                }}
              />
            )}
            {visualization === CalendarVisualization.Year && (
              <YearView
                minimumDate={minDate}
                maximumDate={maxDate}
                onSelectYear={year => {
                  setCurrentDate(new Date(year, currentDate.getMonth(), 1));
                  setVisualization(CalendarVisualization.Month);
                }}
                currentDate={currentDate}
              />
            )}
          </View>
        </GestureDetector>
      </GestureDetector>
    </View>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    minHeight: 290,
    borderWidth: DESIGN_MODE,
    borderColor: 'blueviolet',
    backgroundColor: 'white',
  },
  headerContainer: { borderWidth: DESIGN_MODE },
  contentContainer: {
    borderWidth: DESIGN_MODE,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'lightgreen',
    paddingTop: 20,
    paddingBottom: 5,
  },
  border: { borderWidth: 0.5, borderRadius: 10, borderColor: Pallete.border, ...Pallete.shadows[100] },
});
