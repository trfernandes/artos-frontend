import { GestureResponderEvent, StyleProp, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { containedParameters, outlinedParameters, textParameters, lightParameters } from './FancyButtonStyles';
import { Pallete } from '../../constants/colors';

type FancyButtonSize = number | { w: number; h: number };

export type FancyButtonProps = {
  label?: string;
  labelProps?: FancyTextProps;
  onPress?: (event: GestureResponderEvent) => void;
  icon?: CustomIconProps;
  iconPosition?: 'left' | 'right';
  type?: 'contained' | 'outlined' | 'text' | 'light';
  disabled?: boolean;
  mode?: 'default' | 'icon';
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<TextStyle>;
  textProps?: FancyTextProps;
  size?: FancyButtonSize;
};

const resolveSize = (size?: FancyButtonSize, fallback = 40) => {
  if (!size) return fallback;
  return typeof size === 'number' ? size : size.h;
};

const resolveMinWidth = (size?: FancyButtonSize, fallback = 45) => {
  if (!size) return fallback;
  return typeof size === 'number' ? size : size.w;
};

export default function FancyButton({
  type = 'contained',
  disabled = false,
  mode = 'default',
  iconPosition = 'left',
  textProps,
  ...props
}: FancyButtonProps) {
  const height = resolveSize(props.size);
  const minWidth = resolveMinWidth(props.size);

  const parameters =
    type === 'contained' ? containedParameters : type === 'outlined' ? outlinedParameters : type === 'text' ? textParameters : lightParameters;

  const {
    style: labelPropsStyle,
    size: providedLabelSize,
    numberOfLines: providedNumberOfLines,
    adjustsFontSizeToFit: providedAdjustsFontSizeToFit,
    minimumFontScale: providedMinimumFontScale,
    ...restLabelProps
  } = props.labelProps ?? {};

  const numberOfLines = providedNumberOfLines ?? 1;
  const adjustsFontSizeToFit = providedAdjustsFontSizeToFit ?? true;
  const minimumFontScale = providedMinimumFontScale ?? 0.85;

  const dimensionStyle = mode === 'icon' ? { width: minWidth, height } : { minWidth, height };

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        baseStyles.container,
        iconPosition === 'left' ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' },
        mode === 'icon' && baseStyles.mode_icon,
        disabled ? parameters.disabledContainerStyle : parameters.containerStyle,
        dimensionStyle,
        props.containerStyle,
      ]}
      activeOpacity={disabled ? 1 : 0.7}
      onPress={!disabled ? props.onPress : undefined}
    >
      {props.icon &&
        DefaultIcons.Custom({
          ...props.icon,
          size: props.icon.size || height - 8,
          style: [
            {
              lineHeight: props.icon.size || height - 8,
              textAlign: 'center',
              verticalAlign: 'middle',
              justifyContent: 'center',
              alignItems: 'center',
            },
            disabled ? parameters.disabledIconStyle : parameters.iconStyle,
            props.iconStyle,
            { color: props.icon.color || (disabled ? Pallete.icons.dark : Pallete.icons.light) },
            props.icon.style,
          ],
        })}
      {props.label && mode === 'default' && (
        <FancyText
          {...restLabelProps}
          type={restLabelProps.type ?? 'semiBold'}
          size={props.labelProps?.size ?? 'small'}
          numberOfLines={numberOfLines}
          // adjustsFontSizeToFit={adjustsFontSizeToFit}
          minimumFontScale={minimumFontScale}
          style={[{ textAlign: 'center' }, disabled ? parameters.disabledTextStyle : parameters.textStyle, props.labelStyle, labelPropsStyle]}
          {...textProps}
        >
          {props.label}
        </FancyText>
      )}
    </TouchableOpacity>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  mode_icon: { paddingHorizontal: 0 },
});
