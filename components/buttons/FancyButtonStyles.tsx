import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { ThemePalette } from '../../constants/colors';

type ButtonParamters = {
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabledContainerStyle?: StyleProp<ViewStyle>;
  disabledTextStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<TextStyle>;
  disabledIconStyle?: StyleProp<TextStyle>;
};

type FancyButtonParameters = {
  containedParameters: ButtonParamters;
  outlinedParameters: ButtonParamters;
  textParameters: ButtonParamters;
  lightParameters: ButtonParamters;
};

export function getFancyButtonParameters(palette: ThemePalette): FancyButtonParameters {
  const containedStyles = StyleSheet.create({
    container: { backgroundColor: palette.buttons.active },
    text: { color: palette.fonts.light },
    disabled: {
      backgroundColor: palette.buttons.inactive,
      borderWidth: 1,
      borderColor: palette.border,
    },
    disabledText: { color: palette.fonts.inactive },
    icon: { color: palette.fonts.light },
    disabledIcon: { color: palette.fonts.inactive },
  });

  const outlinedStyles = StyleSheet.create({
    container: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: palette.primary,
    },
    text: { color: palette.primary },
    disabled: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: palette.disabled2,
    },
    disabledText: { color: palette.fonts.inactive },
    icon: { color: palette.primary },
    disabledIcon: { color: palette.fonts.inactive },
  });

  const textStyles = StyleSheet.create({
    container: {},
    text: { color: palette.primary },
    disabled: {},
    disabledText: { color: palette.fonts.inactive },
    icon: { color: palette.primary },
    disabledIcon: { color: palette.fonts.inactive },
  });

  const lightStyles = StyleSheet.create({
    container: {
      backgroundColor: 'rgba(59, 130, 246, 0.16)',
      borderWidth: 2,
      borderColor: palette.primary,
    },
    text: { color: palette.primary },
    disabled: {
      backgroundColor: 'rgba(233, 233, 233, 0.16)',
      borderWidth: 2,
      borderColor: palette.primary,
    },
    disabledText: { color: palette.fonts.inactive },
    icon: { color: palette.primary },
    disabledIcon: { color: palette.fonts.inactive },
  });

  return {
    containedParameters: {
      containerStyle: containedStyles.container,
      textStyle: containedStyles.text,
      disabledContainerStyle: containedStyles.disabled,
      disabledTextStyle: containedStyles.disabledText,
      iconStyle: containedStyles.icon,
      disabledIconStyle: containedStyles.disabledIcon,
    },
    outlinedParameters: {
      containerStyle: outlinedStyles.container,
      textStyle: outlinedStyles.text,
      disabledContainerStyle: outlinedStyles.disabled,
      disabledTextStyle: outlinedStyles.disabledText,
      iconStyle: outlinedStyles.icon,
      disabledIconStyle: outlinedStyles.disabledIcon,
    },
    textParameters: {
      containerStyle: textStyles.container,
      textStyle: textStyles.text,
      disabledContainerStyle: textStyles.disabled,
      disabledTextStyle: textStyles.disabledText,
      iconStyle: textStyles.icon,
      disabledIconStyle: textStyles.disabledIcon,
    },
    lightParameters: {
      containerStyle: lightStyles.container,
      textStyle: lightStyles.text,
      disabledContainerStyle: lightStyles.disabled,
      disabledTextStyle: lightStyles.disabledText,
      iconStyle: lightStyles.icon,
      disabledIconStyle: lightStyles.disabledIcon,
    },
  };
}
