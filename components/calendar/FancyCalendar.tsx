import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyCalendarHeader from './FancyCalendarHeader';
import DayView, { DayViewProps } from './day/DayView';
import MonthView from './month/MonthView';
import YearView from './year/YearView';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Gesture, Directions, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { ThemePalette } from '../../constants/colors';
import { MONTH_NAMES } from '../../constants/calendar';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export { MONTH_NAMES };

export enum CalendarVisualization {
  Day,
  Month,
  Year,
}

export interface MarkedDate {
  date: Date;
  color?: string;
}

export type CalendarVisualStyle = 'default' | 'agendaPremium';

export type FancyCalendarProps = {
  maximumDate?: Date;
  minimumDate?: Date;
  markedDates?: MarkedDate[];
  containerStyle?: StyleProp<ViewStyle>;
  canChangeMonthsOnSwiple?: boolean;
  onChangeSelectedDate?: (date: Date) => void;
  onChangeMonthVisualization?: (date: Date) => void;
  border?: boolean;
  value?: Date;
  dayViewProps?: Partial<DayViewProps>;
  selectDateOnPress?: boolean;
  markedDatesType?: DayViewProps['markedDatesType'];
  dayModeTopPadding?: number;
  visualStyle?: CalendarVisualStyle;
};

export default function FancyCalendar({
  canChangeMonthsOnSwiple = true,
  markedDates,
  containerStyle,
  border,
  value,
  onChangeSelectedDate,
  onChangeMonthVisualization,
  minimumDate,
  maximumDate,
  dayViewProps,
  selectDateOnPress = true,
  markedDatesType = 'bottomPoint',
  dayModeTopPadding = 16,
  visualStyle = 'default',
}: FancyCalendarProps) {
  const styles = useThemedStyles(createStyles);
  const dayViewMaximum = dayViewProps?.maximumDate;

  const [visualization, setVisualization] = useState(CalendarVisualization.Day);
  const isDayVisualization = visualization === CalendarVisualization.Day;

  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date | undefined>(value);
  const selectedDate = isControlled ? value : selectDateOnPress ? internalDate : undefined;

  const mergedDayViewProps = useMemo(() => {
    return {
      ...dayViewProps,
      markedDatesType: dayViewProps?.markedDatesType ?? markedDatesType,
      visualStyle: dayViewProps?.visualStyle ?? visualStyle,
    };
  }, [dayViewProps, markedDatesType, visualStyle]);

  const resolvedDayModeTopPadding =
    visualStyle === 'agendaPremium' ? Math.min(dayModeTopPadding, 8) : dayModeTopPadding;

  useEffect(() => {
    if (isControlled) setInternalDate(value);
  }, [isControlled, value]);

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

  const minDate = useMemo(() => {
    return normalizedMinimum ?? today;
  }, [normalizedMinimum, today]);

  const maxDate = useMemo(() => {
    const source = maximumDate ?? dayViewMaximum;

    let candidate: Date;
    if (!source) {
      candidate = new Date();
      candidate.setHours(0, 0, 0, 0);
      candidate.setFullYear(candidate.getFullYear() + 50);
    } else {
      candidate = new Date(source);
      candidate.setHours(0, 0, 0, 0);
    }

    if (candidate < minDate) {
      return new Date(minDate);
    }

    return candidate;
  }, [maximumDate, dayViewMaximum, minDate]);

  const initialCurrentDate = useMemo(() => {
    if (selectedDate) {
      const normalized = new Date(selectedDate);
      normalized.setHours(0, 0, 0, 0);
      if (normalized < minDate) return new Date(minDate);
      if (normalized > maxDate) return new Date(maxDate);
      return normalized;
    }

    // Sem valor: parte de hoje-30 anos (útil pra ranges amplos tipo data de
    // nascimento) em vez do minimumDate, clampado ao range válido.
    const fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    fallback.setFullYear(fallback.getFullYear() - 30);
    if (fallback < minDate) return new Date(minDate);
    if (fallback > maxDate) return new Date(maxDate);
    return fallback;
  }, [minDate, maxDate]);

  const [currentDate, setCurrentDate] = useState<Date>(initialCurrentDate);

  useEffect(() => {
    setCurrentDate((prev) => {
      const monthStart = new Date(prev.getFullYear(), prev.getMonth(), 1);
      const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      if (monthStart < minMonth) return new Date(minDate);
      if (monthStart > maxMonth) return new Date(maxDate);
      return prev;
    });
  }, [minDate, maxDate]);

  useEffect(() => {
    if (!selectedDate) return;

    const normalized = new Date(selectedDate);
    normalized.setHours(0, 0, 0, 0);
    const safeDate = normalized < minDate ? minDate : normalized > maxDate ? maxDate : normalized;

    setCurrentDate((prev) => {
      const sameMonth =
        prev.getFullYear() === safeDate.getFullYear() && prev.getMonth() === safeDate.getMonth();
      if (sameMonth) {
        return prev;
      }

      return new Date(safeDate);
    });
  }, [selectedDate, minDate, maxDate]);

  const changeMonth = useCallback(
    (offset: number) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);

      const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      if (newDate < minMonth) return;

      const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
      if (newDate > maxMonth) return;

      setCurrentDate(newDate);
      onChangeMonthVisualization?.(newDate);
    },
    [currentDate, onChangeMonthVisualization, minDate, maxDate],
  );

  const handleSelectDate = useCallback(
    (date: Date) => {
      if (!isControlled && selectDateOnPress) {
        setInternalDate(date);
      }
      onChangeSelectedDate?.(date);
      setVisualization(CalendarVisualization.Day);
    },
    [isControlled, onChangeSelectedDate, selectDateOnPress],
  );

  const flingGestures = Gesture.Simultaneous(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => {
        if (canChangeMonthsOnSwiple && visualization === CalendarVisualization.Day) {
          runOnJS(changeMonth)(+1);
        }
      }),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => {
        if (canChangeMonthsOnSwiple && visualization === CalendarVisualization.Day) {
          runOnJS(changeMonth)(-1);
        }
      }),
  );

  return (
    <View
      style={[
        styles.container,
        visualStyle === 'agendaPremium' ? styles.containerAgendaPremium : null,
        containerStyle,
        border && styles.border,
      ]}
    >
      <View
        style={[
          styles.headerContainer,
          visualStyle === 'agendaPremium' ? styles.headerContainerAgendaPremium : null,
        ]}
      >
        <FancyCalendarHeader
          visualization={visualization}
          currentDate={currentDate}
          selectedDate={selectedDate}
          onChangeVisualization={setVisualization}
          onGoToToday={() => {
            const todayDate = new Date(minDate);
            setCurrentDate(todayDate);
            onChangeMonthVisualization?.(todayDate);
          }}
          onNextMonth={() => changeMonth(+1)}
          onPreviousMonth={() => changeMonth(-1)}
          calendarProps={{ minimumDate: minDate, maximumDate: maxDate }}
          visualStyle={visualStyle}
        />
      </View>

      <GestureDetector gesture={flingGestures}>
        <View
          style={[
            styles.contentContainerBase,
            isDayVisualization ? styles.contentContainerDay : styles.contentContainerFixed,
            visualStyle === 'agendaPremium' ? styles.contentContainerAgendaPremium : null,
            isDayVisualization && {
              paddingTop: resolvedDayModeTopPadding,
              paddingBottom: resolvedDayModeTopPadding - (visualStyle === 'agendaPremium' ? 2 : 0),
            },
          ]}
        >
          {isDayVisualization && (
            <DayView
              currentDate={currentDate}
              selectedDate={selectedDate}
              markedDates={markedDates}
              onSelectDate={handleSelectDate}
              minimumDate={minDate}
              maximumDate={maxDate}
              {...mergedDayViewProps}
            />
          )}
          {visualization === CalendarVisualization.Month && (
            <MonthView
              selectedDate={selectedDate}
              currentDate={currentDate}
              minimumDate={minDate}
              maximumDate={maxDate}
              visualStyle={visualStyle}
              onSelectMonth={(month) => {
                const candidate = new Date(currentDate.getFullYear(), month, 1);
                const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

                let nextDate = candidate;
                if (candidate < minMonth) {
                  nextDate = new Date(minDate);
                } else if (candidate > maxMonth) {
                  nextDate = new Date(maxDate);
                }

                setCurrentDate(nextDate);
                onChangeMonthVisualization?.(nextDate);
                setVisualization(CalendarVisualization.Day);
              }}
            />
          )}
          {visualization === CalendarVisualization.Year && (
            <YearView
              minimumDate={minDate}
              maximumDate={maxDate}
              currentDate={currentDate}
              visualStyle={visualStyle}
              onSelectYear={(year) => {
                const candidate = new Date(year, currentDate.getMonth(), 1);
                const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

                let nextDate = candidate;
                if (candidate < minMonth) {
                  nextDate = new Date(minDate);
                } else if (candidate > maxMonth) {
                  nextDate = new Date(maxDate);
                }

                setCurrentDate(nextDate);
                onChangeMonthVisualization?.(nextDate);
                setVisualization(CalendarVisualization.Month);
              }}
            />
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { backgroundColor: palette.backgroundColor2, gap: 0 },
    containerAgendaPremium: {
      backgroundColor: 'transparent',
    },
    headerContainer: {
      width: '100%',
      paddingHorizontal: 0,
      paddingLeft: 2,
      paddingTop: 2,
      paddingBottom: 0,
      zIndex: 1,
    },
    headerContainerAgendaPremium: {
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 4,
    },
    contentContainerBase: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingLeft: 2,
      paddingBottom: 0,
    },
    contentContainerAgendaPremium: {
      paddingLeft: 0,
    },
    contentContainerDay: {
      width: '100%',
    },
    contentContainerFixed: {
      height: 250,
      width: '100%',
      paddingTop: 6,
    },
    border: {
      borderWidth: 0.5,
      borderRadius: 10,
      borderColor: palette.border,
      ...palette.shadows[100],
    },
  });
}
