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

export default function FancyCalendarHeader({
  visualization = CalendarVisualization.Day,
  selectedDate,
  ...props
}: FancyCalendarHeaderProps) {
  const minimumDate = props.calendarProps?.minimumDate
    ? new Date(props.calendarProps.minimumDate.getFullYear(), props.calendarProps.minimumDate.getMonth(), 1)
    : undefined;

  const maximumDate = props.calendarProps?.maximumDate
    ? new Date(props.calendarProps.maximumDate.getFullYear(), props.calendarProps.maximumDate.getMonth(), 1)
    : undefined;

  const canGoToPreviousMonth = (): boolean => {
    if (!minimumDate) return true;
    const previousMonth = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth() - 1, 1);
    return previousMonth >= minimumDate;
  };

  const canGoToNextMonth = (): boolean => {
    if (!maximumDate) return true;
    const nextMonth = new Date(props.currentDate.getFullYear(), props.currentDate.getMonth() + 1, 1);
    return nextMonth <= maximumDate;
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
        <FancyText size='large' type='bold' color={Pallete.fonts.inactive}>
          {displayDate.getFullYear()}
        </FancyText>
        <FancyText size='large' type='bold'>
          {MONTH_NAMES[displayDate.getMonth()]}
        </FancyText>
      </Pressable>
      <View style={styles.buttonsContainer}>
        <FancyButton
          disabled={!canGoToPreviousMonth()}
          size={30}
          icon={{
            library: 'Entypo',
            name: 'chevron-left',
            color: canGoToPreviousMonth() ? Pallete.icons.dark : Pallete.icons.inactive,
          }}
          onPress={props.onPreviousMonth}
          containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
        />
        <FancyButton
          disabled={!canGoToNextMonth()}
          size={30}
          icon={{
            library: 'Entypo',
            name: 'chevron-right',
            color: canGoToNextMonth() ? Pallete.icons.dark : Pallete.icons.inactive,
          }}
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
