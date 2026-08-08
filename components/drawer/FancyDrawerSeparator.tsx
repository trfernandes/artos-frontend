import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAppTheme } from '../../hooks/useAppTheme';

export type FancyDrawerSeparatorProps = {
  label?: string;
};

export default function FancyDrawerSeparator(props: FancyDrawerSeparatorProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <FancyText
        size={'small'}
        type='semiBold'
        color={isDark ? palette.fonts.light : palette.fonts.inactive}
        style={{ opacity: isDark ? 0.95 : 1 }}
      >
        {props.label}
      </FancyText>
    </View>
  );
}

function createStyles(_palette: ThemePalette) {
  return StyleSheet.create({
    container: { paddingHorizontal: 10, paddingTop: 7, paddingBottom: 8 },
  });
}
