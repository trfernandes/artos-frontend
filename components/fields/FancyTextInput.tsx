import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, ViewProps, TextInput, TextInputProps, Pressable } from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { isValidElement, ReactNode } from 'react';
import type { Ref } from 'react';
import { MEDIUM_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import { ThemePalette } from '../../constants/colors';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';

interface Button {
  icon: CustomIconProps;
  onPress?: () => void;
}

export type FancyTextInputProps = {
  label?: string;
  errorMessage?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  inputContainerStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerProps?: ViewProps;
  leftContainer?: Button | Button[] | ReactNode;
  rightContainer?: Button | Button[] | ReactNode;
  onPress?: () => void;
  inputProps?: Omit<TextInputProps, 'value'>;
  inputRef?: Ref<TextInput>;
  readonly?: boolean;
  labelProps?: FancyTextProps;
};

function generateButtonsComponent(buttons: Button[], iconColor: string) {
  return buttons.map((button, idx) => (
    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={button.onPress} key={idx}>
      <DefaultIcons.Custom size={button.icon.size || 18} color={iconColor} {...button.icon} />
    </TouchableOpacity>
  ));
}

export default function FancyTextInput({ disabled = false, ...props }: FancyTextInputProps) {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const {
    style: rawInputStyle,
    multiline,
    placeholder: inputPlaceholder,
    placeholderTextColor: inputPlaceholderTextColor,
    ...remainingInputProps
  } = props.inputProps ?? {};
  const isMultiline = Boolean(multiline);
  const normalizedInputStyle = Array.isArray(rawInputStyle) ? rawInputStyle : rawInputStyle ? [rawInputStyle] : [];
  const resolvedPlaceholder = inputPlaceholder ?? props.placeholder;
  const resolvedPlaceholderTextColor = inputPlaceholderTextColor ?? Pallete.fonts.inactive2;

  return (
    <Pressable {...props.inputContainerProps} style={[styles.container, props.containerStyle]} onPress={props.onPress}>
      {props.label && (
        <View style={styles.labelContainer}>
          <FancyText size={'extraSmall'} type='semiBold' style={[styles.labelText, disabled && styles.labelDisabledText]} {...props.labelProps}>
            {props.label}
          </FancyText>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          disabled && styles.inputDisabledContainer,
          isMultiline && styles.inputContainerMultiline,
          props.inputContainerStyle,
        ]}
      >
        {props.leftContainer && (
          <View style={styles.leftContainer}>
            {isValidElement(props.leftContainer)
              ? props.leftContainer
              : Array.isArray(props.leftContainer)
              ? generateButtonsComponent(props.leftContainer, Pallete.fonts.dark)
              : null}
          </View>
        )}
        <View style={styles.centerContainer}>
          <TextInput
            onPress={props.onPress}
            ref={props.inputRef}
            readOnly={disabled || props.readonly}
            value={props.value}
            placeholder={resolvedPlaceholder}
            placeholderTextColor={resolvedPlaceholderTextColor}
            multiline={isMultiline}
            {...remainingInputProps}
            style={[
              styles.valueText,
              disabled && styles.valueDisabledText,
              isMultiline && styles.valueTextMultiline,
              ...normalizedInputStyle,
            ]}
          />
        </View>
        {props.rightContainer && (
          <View style={styles.rightContainer}>
            {isValidElement(props.rightContainer)
              ? props.rightContainer
              : Array.isArray(props.rightContainer)
              ? generateButtonsComponent(props.rightContainer, Pallete.fonts.dark)
              : null}
          </View>
        )}
      </View>
      {props.errorMessage && (
        <View style={styles.errorContainer}>
          <FancyText size='extraSmall' type='semiBold' style={styles.errorText} accessibilityRole='alert' accessibilityLiveRegion='polite'>
            {props.errorMessage || ''}
          </FancyText>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    container: { gap: 5 },
    inputContainer: {
      backgroundColor: Pallete.backgroundColor,
      borderColor: Pallete.border,
      borderWidth: 0.6,
      borderRadius: 10,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      ...Pallete.shadows[200],
    },
    inputContainerMultiline: {
      alignItems: 'flex-start',
      paddingVertical: 10,
    },
    inputDisabledContainer: { backgroundColor: Pallete.disabled },
    labelContainer: { paddingLeft: 2 },
    labelText: { color: Pallete.fonts.inactive },
    labelDisabledText: { color: Pallete.fonts.inactive2 },
    leftContainer: {
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      paddingLeft: 10,
      borderColor: 'coral',
    },
    centerContainer: {
      flex: 1,
      borderColor: 'chocolate',
      justifyContent: 'center',
    },
    valueText: {
      fontFamily: MEDIUM_FONT,
      fontSize: SMALL_SIZE_FONT,
      color: Pallete.fonts.dark,
      minHeight: 39,
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 0,
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
    valueTextMultiline: {
      height: undefined,
      minHeight: 110,
      textAlignVertical: 'top',
      paddingTop: 10,
      paddingBottom: 10,
      paddingHorizontal: 14,
    },
    valueDisabledText: { color: Pallete.fonts.inactive },
    rightContainer: {
      height: '100%',
      gap: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      borderColor: 'deepskyblue',
      alignItems: 'center',
      paddingRight: 10,
    },
    errorContainer: { paddingLeft: 2 },
    errorText: { color: Pallete.error },
    placeholderText: { color: Pallete.fonts.inactive },
    placeholderDisabledText: { color: Pallete.fonts.inactive2 },
  });
}
