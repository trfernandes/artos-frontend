import { View, StyleSheet, Pressable } from 'react-native';
import { MONTH_NAMES } from '../../../constants/calendar';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export type MonthViewProps = {
  selectedDate?: Date;
  currentDate: Date;
  onSelectMonth: (month: number) => void;
  minimumDate: Date;
  maximumDate: Date;
};

export default function MonthView({ minimumDate, maximumDate, ...props }: MonthViewProps) {
  return (
    <View style={styles.container}>
      {MONTH_NAMES.map((month, i) => {
        const monthStart = new Date(props.currentDate.getFullYear(), i, 1);
        const monthEnd = new Date(props.currentDate.getFullYear(), i + 1, 0);

        const disabled = monthEnd < minimumDate || monthStart > maximumDate;
        const isSelected = i === props.currentDate.getMonth();

        return (
          <Pressable
            key={month}
            style={[styles.cell, isSelected && styles.selectedCell, disabled && styles.disabledCell]}
            onPress={() => {
              if (!disabled) props.onSelectMonth(i);
            }}
            disabled={disabled}
          >
            <FancyText
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              type={isSelected ? 'bold' : 'medium'}
              size={12}
              style={[styles.text, isSelected && styles.selectedText, disabled && styles.disabledText]}
            >
              {month}
            </FancyText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
  },
  cell: {
    width: '30%',
    margin: '1.5%',
    padding: 0,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    backgroundColor: Pallete.primary,
  },
  disabledCell: {
    opacity: 0.4,
  },
  text: {
    paddingHorizontal: 10,
    textAlign: 'center',
    width: '100%',
  },
  selectedText: {
    color: '#fff',
  },
  disabledText: {
    color: Pallete.fonts.inactive2,
  },
});
