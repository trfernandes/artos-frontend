import { StyleSheet, View } from 'react-native';
import FancyText from '../../FancyText';
import { ThemePalette } from '../../../constants/colors';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { EXTRA_SMALL_SIZE_FONT } from '../../../constants/font';

export default function DayViewHeader({
  visualStyle = 'default',
}: {
  visualStyle?: 'default' | 'agendaPremium';
}) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const isAgendaPremium = visualStyle === 'agendaPremium';

  return (
    <View style={[styles.container, isAgendaPremium ? styles.containerAgendaPremium : null]}>
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
        <FancyText
          key={i}
          size='medium'
          type='bold'
          color={isAgendaPremium ? palette.fonts.inactive : palette.fonts.inactive}
          style={[styles.dayHeader, isAgendaPremium ? styles.dayHeaderAgendaPremium : null]}
        >
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
    containerAgendaPremium: {
      paddingBottom: 4,
      paddingHorizontal: 2,
    },
    dayHeader: {
      width: `${100 / 7}%`,
      textAlign: 'center',
    },
    dayHeaderAgendaPremium: {
      fontSize: EXTRA_SMALL_SIZE_FONT,
      opacity: 0.88,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
  });
}
