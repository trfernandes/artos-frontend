import { View, StyleSheet, Pressable } from 'react-native';
import { MONTH_NAMES } from '../FancyCalendar';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export type MonthViewProps = { selectedDate?: Date; currentDate: Date; onSelectMonth: (month: number) => void };

export default function MonthView({ ...props }: MonthViewProps) {
  return (
    <View style={styles.container}>
      {MONTH_NAMES.map((month, i) => {
        const isSelected = i === props.currentDate.getMonth();
        return (
          <Pressable
            key={month}
            style={[styles.cell, isSelected && styles.selectedCell]}
            onPress={() => props.onSelectMonth(i)}
          >
            <FancyText
              adjustsFontSizeToFit={true}
              numberOfLines={1}
              type={isSelected ? 'bold' : 'medium'}
              size={12}
              style={isSelected ? styles.selectedText : { paddingHorizontal: 10 }}
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
  selectedText: {
    color: '#fff',
  },
});
