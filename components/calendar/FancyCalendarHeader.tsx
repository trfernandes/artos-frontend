import { View, StyleSheet, Pressable } from 'react-native';
import { CalendarVisualization, CalendarVisualStyle, FancyCalendarProps } from './FancyCalendar';
import { MONTH_NAMES } from '../../constants/calendar';
import FancyText from '../FancyText';
import DefaultIcons from '../FancyIcons';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { ColorUtils } from '../../utils/color_utils';
import { BOLD_FONT, EXTRA_SMALL_SIZE_FONT, LARGE_SIZE_FONT } from '../../constants/font';

export type FancyCalendarHeaderProps = {
  currentDate: Date;
  selectedDate?: Date;
  visualization: CalendarVisualization;
  onChangeVisualization: (visualization: CalendarVisualization) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  /** Quando definido, mostra o botão "ir para data" à esquerda das setas. */
  onOpenDatePicker?: () => void;
  calendarProps?: FancyCalendarProps;
  visualStyle?: CalendarVisualStyle;
};

export default function FancyCalendarHeader({
  visualization = CalendarVisualization.Day,
  visualStyle = 'default',
  ...props
}: FancyCalendarHeaderProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const safeDate = Number.isNaN(props.currentDate?.getTime?.()) ? new Date() : props.currentDate;
  const minimumDate = props.calendarProps?.minimumDate
    ? new Date(
        props.calendarProps.minimumDate.getFullYear(),
        props.calendarProps.minimumDate.getMonth(),
        1,
      )
    : undefined;

  const maximumDate = props.calendarProps?.maximumDate
    ? new Date(
        props.calendarProps.maximumDate.getFullYear(),
        props.calendarProps.maximumDate.getMonth(),
        1,
      )
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
  const isAgendaPremium = visualStyle === 'agendaPremium';

  return (
    <View style={[styles.container, isAgendaPremium ? styles.containerAgendaPremium : null]}>
      <Pressable
        style={[
          styles.actualDateContainer,
          isAgendaPremium ? styles.actualDateContainerAgenda : null,
        ]}
        onPress={() => {
          if (visualization === CalendarVisualization.Day)
            props.onChangeVisualization(CalendarVisualization.Month);
          else if (visualization === CalendarVisualization.Month)
            props.onChangeVisualization(CalendarVisualization.Year);
        }}
      >
        {isAgendaPremium ? (
          <>
            <FancyText
              size='extraSmall'
              type='semiBold'
              color={palette.fonts.inactive}
              numberOfLines={1}
              style={styles.yearTextAgenda}
            >
              {displayDate.getFullYear()}
            </FancyText>
            <View style={styles.monthRowAgenda}>
              <FancyText numberOfLines={1} ellipsizeMode='tail' style={styles.monthTextAgenda}>
                {MONTH_NAMES[displayDate.getMonth()]}
              </FancyText>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='chevron-down'
                size={15}
                color={palette.icons.inactive}
              />
            </View>
          </>
        ) : (
          <>
            <FancyText
              size='large'
              type='bold'
              color={palette.fonts.inactive}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {displayDate.getFullYear()}
            </FancyText>
            <FancyText size='large' type='bold' numberOfLines={1} ellipsizeMode='tail'>
              {MONTH_NAMES[displayDate.getMonth()]}
            </FancyText>
          </>
        )}
      </Pressable>
      <View
        style={[styles.buttonsContainer, isAgendaPremium ? styles.buttonsContainerAgenda : null]}
      >
        {props.onOpenDatePicker && (
          <Pressable
            onPress={props.onOpenDatePicker}
            accessibilityRole='button'
            accessibilityLabel='Ir para data'
            hitSlop={isAgendaPremium ? { top: 8, bottom: 8, left: 8, right: 3 } : undefined}
            style={[styles.navButton, isAgendaPremium ? styles.navButtonAgenda : null]}
          >
            <DefaultIcons.Custom
              library='MaterialCommunityIcons'
              name='calendar-search'
              size={isAgendaPremium ? 17 : 18}
              color={palette.primary}
            />
          </Pressable>
        )}
        <Pressable
          disabled={!prevEnabled}
          onPress={props.onPreviousMonth}
          accessibilityRole='button'
          accessibilityLabel='Mês anterior'
          hitSlop={isAgendaPremium ? { top: 8, bottom: 8, left: 8, right: 3 } : undefined}
          style={[
            styles.navButton,
            isAgendaPremium ? styles.navButtonAgenda : null,
            !prevEnabled && styles.navButtonDisabled,
          ]}
        >
          <DefaultIcons.Custom
            library='Entypo'
            name='chevron-left'
            size={20}
            color={prevEnabled ? palette.primary : palette.icons.inactive2}
          />
        </Pressable>
        <Pressable
          disabled={!nextEnabled}
          onPress={props.onNextMonth}
          accessibilityRole='button'
          accessibilityLabel='Próximo mês'
          hitSlop={isAgendaPremium ? { top: 8, bottom: 8, left: 3, right: 8 } : undefined}
          style={[
            styles.navButton,
            isAgendaPremium ? styles.navButtonAgenda : null,
            !nextEnabled && styles.navButtonDisabled,
          ]}
        >
          <DefaultIcons.Custom
            library='Entypo'
            name='chevron-right'
            size={20}
            color={nextEnabled ? palette.primary : palette.icons.inactive2}
          />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 34,
    },
    containerAgendaPremium: {
      minHeight: 40,
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    actualDateContainer: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    actualDateContainerAgenda: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 1,
    },
    yearTextAgenda: {
      letterSpacing: 0.55,
      textTransform: 'uppercase',
      opacity: 0.85,
      lineHeight: EXTRA_SMALL_SIZE_FONT + 2,
    },
    monthRowAgenda: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
    },
    monthTextAgenda: {
      fontFamily: BOLD_FONT,
      fontSize: LARGE_SIZE_FONT,
      lineHeight: LARGE_SIZE_FONT + 2,
      color: palette.fonts.dark,
      letterSpacing: -0.35,
    },
    buttonsContainer: { flexDirection: 'row', gap: 8, flexShrink: 0 },
    buttonsContainerAgenda: {
      gap: 0,
      padding: 2,
      borderRadius: 999,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.065),
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.08),
    },
    navButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.1),
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonAgenda: {
      width: 40,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'transparent',
    },
    navButtonDisabled: {
      backgroundColor: palette.disabled,
      opacity: 0.5,
    },
  });
}
