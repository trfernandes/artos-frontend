import { View, StyleSheet, Pressable } from 'react-native';
import { CalendarVisualization, FancyCalendarProps } from './FancyCalendar';
import { MONTH_NAMES } from '../../constants/calendar';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ColorUtils } from '../../utils/color_utils';

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
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const safeDate = Number.isNaN(props.currentDate?.getTime?.()) ? new Date() : props.currentDate;
  const minimumDate = props.calendarProps?.minimumDate
    ? new Date(props.calendarProps.minimumDate.getFullYear(), props.calendarProps.minimumDate.getMonth(), 1)
    : undefined;

  const maximumDate = props.calendarProps?.maximumDate
    ? new Date(props.calendarProps.maximumDate.getFullYear(), props.calendarProps.maximumDate.getMonth(), 1)
    : undefined;

  const canGoToPreviousMonth = (): boolean => {
    if (!minimumDate) return true;
    const previousMonth = new Date(safeDate.getFullYear(), safeDate.getMonth() - 1, 1);
    return previousMonth >= minimumDate;
  };

  const canGoToNextMonth = (): boolean => {
    if (!maximumDate) return true;
    const nextMonth = new Date(safeDate.getFullYear(), safeDate.getMonth() + 1, 1);
    return nextMonth <= maximumDate;
  };

  // Exibe mes/ano atual conforme navegacao
  const displayDate = safeDate;

  const prevEnabled = canGoToPreviousMonth();
  const nextEnabled = canGoToNextMonth();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.actualDateContainer}
        onPress={() => {
          if (visualization === CalendarVisualization.Day) props.onChangeVisualization(CalendarVisualization.Month);
          else if (visualization === CalendarVisualization.Month) props.onChangeVisualization(CalendarVisualization.Year);
        }}
      >
        <FancyText size='large' type='bold' color={palette.fonts.inactive} numberOfLines={1} ellipsizeMode='tail'>
          {displayDate.getFullYear()}
        </FancyText>
        <FancyText size='large' type='bold' numberOfLines={1} ellipsizeMode='tail'>
          {MONTH_NAMES[displayDate.getMonth()]}
        </FancyText>
      </Pressable>
      <View style={styles.buttonsContainer}>
        <Pressable
          disabled={!prevEnabled}
          onPress={props.onPreviousMonth}
          style={[styles.navButton, !prevEnabled && styles.navButtonDisabled]}
        >
          <DefaultIcons.Custom
            library="Entypo"
            name="chevron-left"
            size={18}
            color={prevEnabled ? palette.primary : palette.icons.inactive2}
          />
        </Pressable>
        <Pressable
          disabled={!nextEnabled}
          onPress={props.onNextMonth}
          style={[styles.navButton, !nextEnabled && styles.navButtonDisabled]}
        >
          <DefaultIcons.Custom
            library="Entypo"
            name="chevron-right"
            size={18}
            color={nextEnabled ? palette.primary : palette.icons.inactive2}
          />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 34 },
    actualDateContainer: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    buttonsContainer: { flexDirection: 'row', gap: 8, flexShrink: 0 },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1),
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonDisabled: {
      backgroundColor: palette.disabled,
      opacity: 0.5,
    },
  });
}
