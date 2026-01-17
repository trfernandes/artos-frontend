import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';
import FancyButton from '../buttons/FancyButton';
import { DefaultIconsNames } from '../../constants/icons';

export type FancyNumberInputProps = {
  title?: string;
  value?: number;
  onChange?: (value: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  min?: number;
  max?: number;
};

export default function FancyNumberInput({ title, value, onChange, containerStyle, min, max }: FancyNumberInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {title && (
        <FancyText type='semiBold' size={'small'} color={Pallete.fonts.inactive} style={{ opacity: 1, flex: 1 }}>
          {title}
        </FancyText>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 0, borderColor: Pallete.primary, borderRadius: 12 }}>
        <FancyButton
          type='contained'
          mode='icon'
          icon={{ ...DefaultIconsNames.minus, color: Pallete.fonts.light, size: 18, style: { marginTop: 1 } }}
          size={{ h: 25, w: 25 }}
          onPress={() => {
            onChange?.(value ? Math.max(min ?? 0, value - 1) : 0);
          }}
        />
        <FancyText size={'large'} type='semiBold' color={Pallete.fonts.inactive}>
          {value ?? '0'}
        </FancyText>
        <FancyButton
          type='contained'
          mode='icon'
          icon={{ ...DefaultIconsNames.add, color: Pallete.icons.light, size: 18 }}
          size={{ h: 25, w: 25 }}
          onPress={() => {
            onChange?.(value ? Math.min(max ?? Infinity, value + 1) : 1);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
    height: 48,
    flexDirection: 'row',
    borderWidth: 0.6,
    borderColor: Pallete.border,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
});
