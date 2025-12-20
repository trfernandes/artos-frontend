import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  ViewProps,
  TextInput,
  TextInputProps,
  Pressable,
} from 'react-native';
import FancyText, { FancyTextProps } from '../FancyText';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { isValidElement, ReactNode } from 'react';
import { MEDIUM_FONT, SMALL_SIZE_FONT } from '../../constants/font';
import { Pallete } from '../../constants/colors';

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
  readonly?: boolean;
  labelProps?: FancyTextProps;
};

function generateButtonsComponent(buttons: Button[]) {
  return buttons.map((button, idx) => (
    <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={button.onPress} key={idx}>
      <DefaultIcons.Custom size={button.icon.size || 18} color={Pallete.fonts.dark} {...button.icon} />
    </TouchableOpacity>
  ));
}

export default function FancyTextInput({ disabled = false, ...props }: FancyTextInputProps) {
  const { style: rawInputStyle, multiline, ...remainingInputProps } = props.inputProps ?? {};
  const isMultiline = Boolean(multiline);
  const normalizedInputStyle = Array.isArray(rawInputStyle) ? rawInputStyle : rawInputStyle ? [rawInputStyle] : [];

  return (
    <Pressable {...props.inputContainerProps} style={[styles.container, props.containerStyle]} onPress={props.onPress}>
      {props.label && (
        <View style={styles.labelContainer}>
          <FancyText
            size={'extraSmall'}
            type="semiBold"
            style={[styles.labelText, disabled && styles.labelDisabledText]}
            {...props.labelProps}
          >
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
              ? generateButtonsComponent(props.leftContainer)
              : null}
          </View>
        )}
        <View style={styles.centerContainer}>
          <TextInput
            onPress={props.onPress}
            readOnly={disabled || props.readonly}
            value={props.value}
            placeholderTextColor={Pallete.fonts.inactive}
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
              ? generateButtonsComponent(props.rightContainer)
              : null}
          </View>
        )}
      </View>
      {props.errorMessage && (
        <View style={styles.errorContainer}>
          <FancyText size="extraSmall" type="semiBold" style={styles.errorText}>
            {props.errorMessage || ''}
          </FancyText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: 5 },
  inputContainer: {
    backgroundColor: 'white',
    borderColor: Pallete.border,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  },
  valueText: {
    fontFamily: MEDIUM_FONT,
    fontSize: SMALL_SIZE_FONT,
    color: Pallete.fonts.dark,
    minHeight: 35,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  valueTextMultiline: {
    height: undefined,
    minHeight: 100,
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
  },
  errorContainer: { paddingLeft: 2 },
  errorText: { color: Pallete.error },
  placeholderText: { color: Pallete.fonts.inactive },
  placeholderDisabledText: { color: Pallete.fonts.inactive2 },
});
