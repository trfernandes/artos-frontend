import { StyleSheet, TouchableOpacity } from 'react-native';
import { Pallete } from '../../constants/colors';
import { ButtonOption } from './FancyToggle';
import FancyText from '../FancyText';

export default function FancyToggleButton<ValueType>({
  title,
  value,
  activeContainerStyle,
  activeLabelProps,
  inactiveContainerStyle,
  inactiveLabelProps,
  isSelected,
  disabled = false,
  onPress,
}: { isSelected: boolean; disabled?: boolean; onPress?: () => void } & ButtonOption<ValueType>) {
  return (
    <TouchableOpacity
      style={[
        styles.optionItemContainer,
        { borderTopRightRadius: 100, borderBottomRightRadius: 100 },
        isSelected
          ? [styles.optionSelectedContainer, activeContainerStyle]
          : [styles.optionUnselectedContainer, inactiveContainerStyle],
      ]}
      disabled={disabled}
      onPress={() => {
        if (disabled) return;
        onPress?.();
      }}
    >
      <FancyText
        color={disabled || isSelected === false ? Pallete.fonts.inactive : Pallete.fonts.dark}
        type={isSelected ? 'bold' : 'semiBoldItalic'}
        size={isSelected ? 'small' : 'extraSmall'}
        {...(isSelected ? activeLabelProps : inactiveLabelProps)}
      >
        {title}
      </FancyText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionItemContainer: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelectedContainer: {
    width: '55%',
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
});
