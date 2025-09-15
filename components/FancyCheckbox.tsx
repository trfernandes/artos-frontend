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
};

export default function FancyCheckbox(props: FancyCheckboxProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => props.onChangeValue?.(!props.value)}>
      <View style={styles.checkboxContainer}>
        <View
          style={[
            styles.checkbox,
            { width: props.size || 20, height: props.size || 20 },
            props.value
              ? props.disabled
                ? styles.disabledChecked
                : styles.checked
              : props.disabled
              ? styles.disabledUnchecked
              : styles.unchecked,
          ]}
        >
          <DefaultIcons.Custom {...DefaultIconsNames.confirm} size={props.iconSize || 12} color="white" />
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
