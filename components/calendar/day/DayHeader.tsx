import { StyleSheet, View } from 'react-native';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export default function DayViewHeader() {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
        <FancyText key={i} size='medium' type='bold' color={palette.fonts.inactive} style={styles.dayHeader}>
          {d}
        </FancyText>
      ))}
    </View>
  );
}

function createStyles(_palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dayHeader: {
      width: `${100 / 9}%`, // 7 colunas, igual aos dias
      textAlign: 'center',
    },
  });
}
