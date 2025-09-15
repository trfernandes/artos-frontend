import { GestureResponderEvent, StyleProp, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { containedParameters, outlinedParameters, textParameters, lightParameters } from './FancyButtonStyles';
import { Pallete } from '../../constants/colors';

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
  size?: number | { w: number; h: number };
};

export default function FancyButton({
  type = 'contained',
  disabled = false,
  mode = 'default',
  iconPosition = 'left',
  ...props
}: FancyButtonProps) {
  const minWidth = !props.size ? 45 : typeof props.size !== 'number' ? props.size.w : props.size;
  const height = !props.size ? 45 : typeof props.size !== 'number' ? props.size.h : props.size;
  const lineHeight = height - 20;

  const parameters =
    type === 'contained'
      ? containedParameters
      : type === 'outlined'
      ? outlinedParameters
      : type === 'text'
      ? textParameters
      : lightParameters;

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        baseStyles.container,
        iconPosition === 'left' ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' },
        mode === 'icon' && baseStyles.mode_icon,
        disabled ? parameters.disabledContainerStyle : parameters.containerStyle,
        { minWidth, height },
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
          type="bold"
          size={'small'}
          style={[
            {
              lineHeight: lineHeight,
              // borderWidth: 1,
            },
            ,
            disabled ? parameters.disabledTextStyle : parameters.textStyle,
            props.labelStyle,
          ]}
          {...props.labelProps}
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
  },
  mode_icon: { maxWidth: 45, minWidth: 45 },
});
