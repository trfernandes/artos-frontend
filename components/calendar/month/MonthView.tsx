import { View, StyleSheet, Pressable } from 'react-native';
import { MONTH_NAMES } from '../../../constants/calendar';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';
import { LARGE_MEDIUM_SIZE_FONT, SMALL_SIZE_FONT } from '../../../constants/font';

export type MonthViewProps = {
  selectedDate?: Date;
  currentDate: Date;
  onSelectMonth: (month: number) => void;
  minimumDate: Date;
  maximumDate: Date;
  visualStyle?: 'default' | 'agendaPremium';
};

export default function MonthView({
  minimumDate,
  maximumDate,
  visualStyle = 'default',
  ...props
}: MonthViewProps) {
  const styles = useThemedStyles(createStyles);
  const isAgendaPremium = visualStyle === 'agendaPremium';

  return (
    <View style={[styles.container, isAgendaPremium ? styles.containerAgenda : null]}>
      {MONTH_NAMES.map((month, i) => {
        const monthStart = new Date(props.currentDate.getFullYear(), i, 1);
        const monthEnd = new Date(props.currentDate.getFullYear(), i + 1, 0);

        const disabled = monthEnd < minimumDate || monthStart > maximumDate;
        const isSelected = i === props.currentDate.getMonth();

        return (
          <Pressable
            key={month}
            style={[
              styles.cell,
              isAgendaPremium ? styles.cellAgenda : null,
              isSelected && styles.selectedCell,
              isSelected && isAgendaPremium ? styles.selectedCellAgenda : null,
              disabled && styles.disabledCell,
            ]}
            onPress={() => {
              if (!disabled) props.onSelectMonth(i);
            }}
            disabled={disabled}
          >
            <FancyText
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              type={isSelected ? 'bold' : 'medium'}
              size='small'
              style={[
                styles.text,
                isAgendaPremium ? styles.textAgenda : null,
                isSelected && styles.selectedText,
                disabled && styles.disabledText,
              ]}
            >
              {month}
            </FancyText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignContent: 'center',
    },
    containerAgenda: {
      gap: 8,
      paddingTop: 4,
      paddingBottom: 2,
    },
    cell: {
      width: '30%',
      margin: '1.5%',
      padding: 0,
      height: 50,
      borderRadius: 5,
      backgroundColor: palette.backgroundColor3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellAgenda: {
      width: '31%',
      margin: 0,
      height: 46,
      borderRadius: 14,
      backgroundColor: ColorUtils.withAlpha(palette.primary, 0.05),
      borderWidth: 1,
      borderColor: ColorUtils.withAlpha(palette.primary, 0.06),
    },
    selectedCell: {
      backgroundColor: palette.primary,
    },
    selectedCellAgenda: {
      borderColor: ColorUtils.withAlpha(palette.primary, 0.25),
      ...palette.shadows[100],
    },
    disabledCell: {
      opacity: 0.4,
    },
    text: {
      paddingHorizontal: 10,
      textAlign: 'center',
      width: '100%',
    },
    textAgenda: {
      fontSize: SMALL_SIZE_FONT,
      lineHeight: LARGE_MEDIUM_SIZE_FONT,
      letterSpacing: -0.1,
    },
    selectedText: {
      color: palette.fonts.light,
    },
    disabledText: {
      color: palette.fonts.inactive2,
    },
  });
}
