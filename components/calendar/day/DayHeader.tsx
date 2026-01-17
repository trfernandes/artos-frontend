import { StyleSheet, View } from 'react-native';
import FancyText from '../../FancyText';
import { Pallete } from '../../../constants/colors';

export default function DayViewHeader() {
  return (
    <View style={styles.container}>
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
        <FancyText key={i} size='medium' type='bold' color={Pallete.fonts.inactive} style={styles.dayHeader}>
          {d}
        </FancyText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
