import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { ThemePalette } from '../../../constants/colors';
import FancyText from '../../FancyText';
import { usePallete } from '../../../hooks/usePallete';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

export type Section = { type: 'section'; key: string; title: string };
export type Item<T> = { type: 'item'; key: string; data: T };
export type Row<T> = Section | Item<T>;

export default function FancySectionHeader(props: { title: string; containerStyle?: StyleProp<ViewStyle> }) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, props.containerStyle]}>
      <FancyText size={'medium'} type={'bold'} color={palette.fonts.inactive2}>
        {props.title}
      </FancyText>
      <View
        style={{
          flex: 1,
          height: 1,
          borderWidth: 1,
          borderRadius: 999,
          borderColor: palette.fonts.inactive2,
          opacity: 0.5,
        }}
      />
    </View>
  );
}

function createStyles(_palette: ThemePalette) {
  return StyleSheet.create({
    container: { marginLeft: 5, flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 5 },
  });
}
