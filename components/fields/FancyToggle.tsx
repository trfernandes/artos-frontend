import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyText, { FancyTextProps } from '../FancyText';
import { useEffect, useState } from 'react';
import FancyToggleButton from './FancyToggleButton';

export interface ButtonOption<ValueType> {
  title: string;
  value: ValueType;
  activeContainerStyle?: StyleProp<ViewStyle>;
  inactiveContainerStyle?: StyleProp<ViewStyle>;
  activeLabelProps?: FancyTextProps;
  inactiveLabelProps?: FancyTextProps;
}

export interface FancyToggleProps<ValueType> {
  label?: string;
  value: ValueType;
  option1: ButtonOption<ValueType>;
  option2: ButtonOption<ValueType>;
  onChange: (value: ValueType) => void;
  disabled?: boolean;
}

export default function FancyToggle<ValueType>({
  label,
  value,
  option1,
  option2,
  onChange,
  disabled = false,
}: FancyToggleProps<ValueType>) {
  const [selectedOption, setSelectedOption] = useState<ButtonOption<ValueType> | undefined>(option1);

  useEffect(() => {
    if (value) {
      if (option1.value == value) {
        setSelectedOption(option1);
      } else {
        setSelectedOption(option2);
      }
    }
  }, [value]);

  const isOption1Selected = (selectedOption && selectedOption.value === option1.value) || false;
  const isOption2Selected = (selectedOption && selectedOption.value === option2.value) || false;

  return (
    <View style={[styles.container, { pointerEvents: disabled ? 'none' : 'auto' }]}>
      {label && (
        <FancyText size={'extraSmall'} type="semiBold" color={disabled ? Pallete.fonts.inactive2 : Pallete.fonts.inactive}>
          {label}
        </FancyText>
      )}
      <View style={styles.optionContainer}>
        <FancyToggleButton
          isSelected={isOption1Selected}
          onPress={() => {
            setSelectedOption(option1);
            onChange?.(option1.value);
          }}
          {...option1}
        />
        <FancyToggleButton
          isSelected={isOption2Selected}
          onPress={() => {
            setSelectedOption(option2);
               onChange?.(option2.value);
          }}
          {...option2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5 },
  optionContainer: {
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 20,
    borderColor: Pallete.border,
    borderWidth: 0.5,
    flexDirection: 'row',
    height: 32,
  },
});
