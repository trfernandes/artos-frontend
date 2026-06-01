import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useEffect, useRef } from 'react';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ColorUtils } from '../../../utils/color_utils';
import { LARGE_MEDIUM_SIZE_FONT, SMALL_SIZE_FONT } from '../../../constants/font';

export type YearViewProps = {
  currentDate: Date;
  maximumDate: Date;
  minimumDate: Date;
  onSelectYear: (year: number) => void;
  visualStyle?: 'default' | 'agendaPremium';
};

export default function YearView({ visualStyle = 'default', ...props }: YearViewProps) {
  const styles = useThemedStyles(createStyles);
  const isAgendaPremium = visualStyle === 'agendaPremium';
  const yearsList: number[] = [];
  for (let y = props.minimumDate.getFullYear(); y <= props.maximumDate.getFullYear(); y++) {
    yearsList.push(y);
  }

  const yearsScrollRef = useRef<ScrollView>(null);

  const scrollToCurrentYear = () => {
    const index = yearsList.findIndex((y) => y === props.currentDate.getFullYear());
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
    <ScrollView
      ref={yearsScrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={[styles.container, isAgendaPremium ? styles.containerAgenda : null]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.containerContent}>
        {yearsList.map((year) => {
          const isSelected = year === props.currentDate.getFullYear();
          return (
            <Pressable
              key={year}
              style={[
                styles.cell,
                isAgendaPremium ? styles.cellAgenda : null,
                isSelected && styles.selectedCell,
                isSelected && isAgendaPremium ? styles.selectedCellAgenda : null,
              ]}
              onPress={() => props.onSelectYear(year)}
            >
              <FancyText
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                size={'medium'}
                type={isSelected ? 'bold' : 'medium'}
                style={[
                  styles.text,
                  isAgendaPremium ? styles.textAgenda : null,
                  isSelected && styles.selectedText,
                ]}
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

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: '100%',
    },
    containerAgenda: {
      paddingTop: 6,
      paddingBottom: 2,
    },
    containerContent: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
    cell: {
      width: '30%',
      margin: '1.5%',
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
    text: { borderWidth: 0, width: '100%', textAlign: 'center', lineHeight: 25 },
    textAgenda: {
      fontSize: SMALL_SIZE_FONT,
      lineHeight: LARGE_MEDIUM_SIZE_FONT,
      letterSpacing: -0.1,
    },
    selectedText: {
      color: palette.fonts.light,
    },
  });
}
