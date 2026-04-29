import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyText from '../FancyText';
import { ThemePalette } from '../../constants/colors';
import FancyButton from '../buttons/FancyButton';
import { DefaultIconsNames } from '../../constants/icons';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export type FancyNumberInputProps = {
  title?: string;
  value?: number;
  onChange?: (value: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  min?: number;
  max?: number;
};

export default function FancyNumberInput({
  title,
  value,
  onChange,
  containerStyle,
  min,
  max,
}: FancyNumberInputProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, containerStyle]}>
      {title && (
        <FancyText
          type='semiBold'
          size={'small'}
          color={palette.fonts.inactive}
          style={{ opacity: 1, flex: 1 }}
        >
          {title}
        </FancyText>
      )}
      <View style={styles.controlsRow}>
        <FancyButton
          type='contained'
          mode='icon'
          icon={{
            ...DefaultIconsNames.minus,
            color: palette.fonts.light,
            size: 18,
            style: { marginTop: 1 },
          }}
          size={{ h: 25, w: 25 }}
          onPress={() => {
            onChange?.(value ? Math.max(min ?? 0, value - 1) : 0);
          }}
        />
        <View style={styles.valueWrap}>
          <FancyText size={'large'} type='semiBold' color={palette.fonts.inactive} style={styles.valueText}>
            {value ?? '0'}
          </FancyText>
        </View>
        <FancyButton
          type='contained'
          mode='icon'
          icon={{ ...DefaultIconsNames.add, color: palette.icons.light, size: 18 }}
          size={{ h: 25, w: 25 }}
          onPress={() => {
            onChange?.(value ? Math.min(max ?? Infinity, value + 1) : 1);
          }}
        />
      </View>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor2,
      ...palette.shadows[200],
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 0.6,
      borderColor: palette.border,
      borderRadius: 10,
      paddingHorizontal: 10,
    },
    controlsRow: {
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    valueWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    valueText: {
      includeFontPadding: false,
      textAlign: 'center',
    },
  });
}
