import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export type YearViewProps = {
  currentDate: Date;
  maximumDate: Date;
  minimumDate: Date;
  onSelectYear: (year: number) => void;
};

export default function YearView({ ...props }: YearViewProps) {
  const yearsList: number[] = [];
  for (let y = props.minimumDate.getFullYear(); y <= props.maximumDate.getFullYear(); y++) {
    yearsList.push(y);
  }

  const yearsScrollRef = useRef<ScrollView>(null);

  const scrollToCurrentYear = () => {
    const index = yearsList.findIndex(y => y === props.currentDate.getFullYear());
    const row = Math.floor(index / 3);
    const cellHeight = 60;
    const offsetY = row * cellHeight - 120;
    if (yearsScrollRef.current) {
      yearsScrollRef.current.scrollTo({ y: Math.max(offsetY, 0), animated: false });
    }
  };

  useEffect(() => {
    setTimeout(scrollToCurrentYear, 50);
  }, []);

  return (
    <ScrollView ref={yearsScrollRef} style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.containerContent}>
        {yearsList.map(year => {
          const isSelected = year === props.currentDate.getFullYear();
          return (
            <Pressable
              key={year}
              style={[styles.cell, isSelected && styles.selectedCell]}
              onPress={() => props.onSelectYear(year)}
            >
              <FancyText
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                size={'medium'}
                type={isSelected ? 'bold' : 'medium'}
                style={[styles.text, isSelected && styles.selectedText]}
              >
                {year}
              </FancyText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  containerContent: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '30%',
    margin: '1.5%',
    height: 50,
    borderRadius: 5,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: Pallete.primary,
  },
  selectedCell: {
    backgroundColor: Pallete.primary,
  },
  text: { borderWidth: 0, width: '100%', textAlign: 'center', lineHeight: 25 },
  selectedText: {
    color: '#fff',
  },
});
