import { View, StyleSheet, Pressable } from 'react-native';
import { CalendarVisualization, FancyCalendarProps, MONTH_NAMES } from './FancyCalendar';
import FancyText from '../FancyText';
import FancyButton from '../buttons/FancyButton';
import { Pallete } from '../../constants/colors';

export type FancyCalendarHeaderProps = {
  currentDate: Date;
  selectedDate?: Date;
  visualization: CalendarVisualization;
  onChangeVisualization: (visualization: CalendarVisualization) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  calendarProps?: FancyCalendarProps;
};

export default function FancyCalendarHeader({ visualization = CalendarVisualization.Day, selectedDate, ...props }: FancyCalendarHeaderProps) {
  const canGoToPreviousMonth = (): boolean => {
    if (!props.calendarProps?.minimumDate) return true;
    const prevMonthEnd = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth(), 0);
    return prevMonthEnd >= props.calendarProps.minimumDate;
  };
  const canGoToNextMonth = (): boolean => {
    const nextMonthDate = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth() + 1, 1);
    return !props.calendarProps?.maximumDate || nextMonthDate <= props.calendarProps.maximumDate;
  };

  // Exibe mes/ano atual conforme navegacao
  const displayDate = props.currentDate;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.actualDateContainer}
        onPress={() => {
          if (visualization === CalendarVisualization.Day) props.onChangeVisualization(CalendarVisualization.Month);
          else if (visualization === CalendarVisualization.Month) props.onChangeVisualization(CalendarVisualization.Year);
        }}
      >
        <FancyText size="large" type="bold" color={Pallete.fonts.inactive}>
          {displayDate.getFullYear()}
        </FancyText>
        <FancyText size="large" type="bold">
          {MONTH_NAMES[displayDate.getMonth()]}
        </FancyText>
      </Pressable>
      <View style={styles.buttonsContainer}>
        <FancyButton
          disabled={!canGoToPreviousMonth()}
          size={30}
          icon={{ library: 'Entypo', name: 'chevron-left', color: Pallete.icons.dark }}
          onPress={props.onPreviousMonth}
          containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
        />
        <FancyButton
          disabled={!canGoToNextMonth()}
          size={30}
          icon={{ library: 'Entypo', name: 'chevron-right', color: Pallete.icons.dark }}
          onPress={props.onNextMonth}
          containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actualDateContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  buttonsContainer: { flexDirection: 'row', gap: 6 },
});
