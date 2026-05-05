import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemePalette } from '../../constants/colors';
import { ButtonOption } from './FancyToggle';
import FancyText from '../FancyText';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export default function FancyToggleButton<ValueType>({
  title,
  value,
  activeContainerStyle,
  activeLabelProps,
  inactiveContainerStyle,
  inactiveLabelProps,
  isSelected,
  disabled = false,
  position = 'left',
  onPress,
}: { isSelected: boolean; disabled?: boolean; onPress?: () => void; position?: 'left' | 'right' } & ButtonOption<ValueType>) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      style={[
        styles.optionItemContainer,
        position === 'left' ? styles.leftOptionRadius : styles.rightOptionRadius,
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
        color={disabled || isSelected === false ? palette.fonts.inactive : palette.fonts.dark}
        type={isSelected ? 'bold' : 'semiBoldItalic'}
        size={isSelected ? 'small' : 'extraSmall'}
        {...(isSelected ? activeLabelProps : inactiveLabelProps)}
      >
        {title}
      </FancyText>
    </TouchableOpacity>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    optionItemContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    leftOptionRadius: {
      borderTopLeftRadius: 100,
      borderBottomLeftRadius: 100,
    },
    rightOptionRadius: {
      borderTopRightRadius: 100,
      borderBottomRightRadius: 100,
    },
    optionSelectedContainer: {
      backgroundColor: palette.backgroundColor,
      shadowColor: 'gray',
      elevation: 1,
      shadowOffset: {
        width: -1,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    optionUnselectedContainer: { backgroundColor: palette.backgroundColor2 },
  });
}
