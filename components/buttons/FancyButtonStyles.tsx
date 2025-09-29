import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Pallete } from '../../constants/colors';

const containedStyles = StyleSheet.create({
  container: { backgroundColor: Pallete.buttons.active },
  text: { color: Pallete.fonts.light },
  disabled: { backgroundColor: Pallete.buttons.inactive, borderWidth: 1, borderColor: Pallete.border },
  disabledText: { color: Pallete.fonts.inactive },
  icon: { color: Pallete.fonts.light },
  disabledIcon: { color: Pallete.fonts.inactive },
});

const outlinedStyles = StyleSheet.create({
  container: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Pallete.primary },
  text: { color: Pallete.primary },
  disabled: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Pallete.disabled2 },
  disabledText: { color: Pallete.fonts.inactive },
  icon: { color: Pallete.primary },
  disabledIcon: { color: Pallete.fonts.inactive },
});

const textStyles = StyleSheet.create({
  container: {},
  text: { color: Pallete.primary },
  disabled: {},
  disabledText: { color: Pallete.fonts.inactive },
  icon: { color: Pallete.primary },
  disabledIcon: { color: Pallete.fonts.inactive },
});

const lightStyles = StyleSheet.create({
  container: { backgroundColor: 'rgba(59, 130, 246, 0.16)', borderWidth: 2, borderColor: Pallete.primary },
  text: { color: Pallete.primary },
  disabled: { backgroundColor: 'rgba(233, 233, 233, 0.16)', borderWidth: 2, borderColor: Pallete.primary },
  disabledText: { color: Pallete.fonts.inactive },
  icon: { color: Pallete.primary },
  disabledIcon: { color: Pallete.fonts.inactive },
});

type ButtonParamters = {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  disabledTextStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<TextStyle>;
  disabledIconStyle?: StyleProp<TextStyle>;
};

const containedParameters: ButtonParamters = {
  containerStyle: containedStyles.container,
  textStyle: containedStyles.text,
  disabledContainerStyle: containedStyles.disabled,
  disabledTextStyle: containedStyles.disabledText,
  iconStyle: containedStyles.icon,
  disabledIconStyle: containedStyles.disabledIcon,
};

const outlinedParameters: ButtonParamters = {
  containerStyle: outlinedStyles.container,
  textStyle: outlinedStyles.text,
  disabledContainerStyle: outlinedStyles.disabled,
  disabledTextStyle: outlinedStyles.disabledText,
  iconStyle: outlinedStyles.icon,
  disabledIconStyle: outlinedStyles.disabledIcon,
};

const textParameters: ButtonParamters = {
  containerStyle: textStyles.container,
  textStyle: textStyles.text,
  disabledContainerStyle: textStyles.disabled,
  disabledTextStyle: textStyles.disabledText,
  iconStyle: textStyles.icon,
  disabledIconStyle: textStyles.disabledIcon,
};

const lightParameters: ButtonParamters = {
  containerStyle: lightStyles.container,
  textStyle: lightStyles.text,
  disabledContainerStyle: lightStyles.disabled,
  disabledTextStyle: lightStyles.disabledText,
  iconStyle: lightStyles.icon,
  disabledIconStyle: lightStyles.disabledIcon,
};

export { containedParameters, outlinedParameters, textParameters, lightParameters };

