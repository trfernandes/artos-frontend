import { View, StyleSheet, TouchableOpacity } from 'react-native';
import FancyText from './FancyText';
import DefaultIcons from './FancyIcons';
import { Pallete } from '../constants/colors';
import { DefaultIconsNames } from '../constants/icons';

export type FancyCheckboxProps = {
  label?: string;
  value: boolean;
  size?: number;
  iconSize?: number;
  onChangeValue?: (value: boolean) => void;
  disabled?: boolean;
  color?: string;
};

export default function FancyCheckbox(props: FancyCheckboxProps) {
  const accentColor = props.color ?? Pallete.primary;

  const checkboxStateStyle = (() => {
    if (props.value) {
      if (props.disabled) {
        return [styles.disabledChecked];
      }
      return [styles.checked, { backgroundColor: accentColor }];
    }

    if (props.disabled) {
      return [styles.disabledUnchecked];
    }

    return [styles.unchecked, { borderColor: accentColor }];
  })();

  return (
    <TouchableOpacity style={styles.container} onPress={() => props.onChangeValue?.(!props.value)}>
      <View style={styles.checkboxContainer}>
        <View
          style={[
            styles.checkbox,
            { width: props.size || 16, height: props.size || 16 },
            ...checkboxStateStyle,
          ]}
        >
          <DefaultIcons.Custom {...DefaultIconsNames.confirm} size={props.iconSize || 9} color="white" />
        </View>
      </View>
      {props.label && (
        <View style={styles.labelContainer}>
          <FancyText type="medium" size={'small'}>
            {props.label}
          </FancyText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxContainer: {},
  labelContainer: {},
  checkbox: { borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: Pallete.primary },
  disabledChecked: { backgroundColor: Pallete.border },
  unchecked: { backgroundColor: 'white', borderWidth: 1.5, borderColor: Pallete.primary },
  disabledUnchecked: { backgroundColor: 'white', borderWidth: 1.5, borderColor: Pallete.border },
});
