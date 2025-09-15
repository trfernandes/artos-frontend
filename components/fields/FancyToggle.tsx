import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyText from '../FancyText';
import { useEffect, useState } from 'react';
import { EXTRA_SMALL_SIZE_FONT, ITALIC_SEMI_BOLD_FONT, SEMI_BOLD_FONT, SMALL_SIZE_FONT } from '../../constants/font';

export interface Option<ValueType> {
  title: string;
  value: ValueType;
}

export interface FancyToggleProps<ValueType> {
  label?: string;
  value: ValueType;
  option1: Option<ValueType>;
  option2: Option<ValueType>;
  onChange: (value: ValueType) => void;
  disabled?: boolean;
}

export default function FancyToggle<ValueType>({ label, value, option1, option2, onChange, disabled = false }: FancyToggleProps<ValueType>) {
  const [selectedOption, setSelectedOption] = useState<Option<ValueType> | undefined>(option1);

  useEffect(() => {
    if (value) {
      if (option1.value == value) {
        setSelectedOption(option1);
      } else {
        setSelectedOption(option2);
      }
    }
  }, [value]);

  return (
    <View style={styles.container}>
      {label && (
        <FancyText size={'extraSmall'} type="semiBold" color={disabled ? Pallete.fonts.inactive2 : Pallete.fonts.inactive}>
          {label}
        </FancyText>
      )}
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.optionItemContainer,
            { borderTopRightRadius: 100, borderBottomRightRadius: 100 },
            (selectedOption && selectedOption.value) === option1.value ? styles.optionSelectedContainer : styles.optionUnselectedContainer,
          ]}
          disabled={disabled}
          onPress={() => {
            if (disabled) return;
            setSelectedOption(option1);
            onChange(option1.value as unknown as ValueType);
          }}
        >
          <FancyText
            style={[
              styles.optionText,
              (selectedOption && selectedOption.value) === option1.value ? styles.optionSelectedText : null,
              disabled && {
                color: Pallete.fonts.inactive,
              },
            ]}
          >
            {option1.title}
          </FancyText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionItemContainer,
            { borderTopLeftRadius: 100, borderBottomLeftRadius: 100 },
            (selectedOption && selectedOption.value) === option2.value ? styles.optionSelectedContainer : styles.optionUnselectedContainer,
          ]}
          disabled={disabled}
          onPress={() => {
            if (disabled) return;
            setSelectedOption(option2);
            onChange(option2.value as unknown as ValueType);
          }}
        >
          <FancyText
            style={[
              styles.optionText,
              (selectedOption && selectedOption.value) === option2.value ? styles.optionSelectedText : null,
              disabled && {
                color: Pallete.fonts.inactive2,
              },
            ]}
          >
            {option2.title}
          </FancyText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5 },
  optionContainer: {
    backgroundColor: Pallete.backgroundColor2,
    borderRadius: 100,
    borderColor: Pallete.border,
    borderWidth: 0.8,
    flexDirection: 'row',
    paddingHorizontal: 1,
    height: 40,
  },
  optionItemContainer: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelectedContainer: {
    width: '55%',
    backgroundColor: Pallete.backgroundColor,
    shadowColor: 'gray',
    elevation: 1,
    shadowOffset: {
      width: -1,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  optionUnselectedContainer: { backgroundColor: Pallete.backgroundColor2, width: '45%' },
  optionText: {
    fontSize: EXTRA_SMALL_SIZE_FONT,
    fontFamily: ITALIC_SEMI_BOLD_FONT,
    color: Pallete.fonts.inactive,
  },
  optionSelectedText: {
    fontFamily: SEMI_BOLD_FONT,
    fontSize: SMALL_SIZE_FONT,
    color: Pallete.fonts.dark,
  },
});
