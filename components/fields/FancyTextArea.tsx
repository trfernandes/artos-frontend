import { StyleProp, ViewStyle } from 'react-native';
import FancyTextInput, { FancyTextInputProps } from './FancyTextInput';

export type FancyTextAreaProps = { containerStyle?: StyleProp<ViewStyle> } & Omit<
  FancyTextInputProps,
  'multiline' | 'numberOfLines' | 'style' | 'inputContainerStyle'
>;

export default function FancyTextArea({ containerStyle, inputProps, ...rest }: FancyTextAreaProps) {
  const containerStyleArray = containerStyle
    ? Array.isArray(containerStyle)
      ? containerStyle
      : [containerStyle]
    : [];

  const { style: inputStyle, numberOfLines, ...remainingInputProps } = inputProps ?? {};

  const normalizedInputStyle = inputStyle
    ? Array.isArray(inputStyle)
      ? inputStyle
      : [inputStyle]
    : [];

  return (
    <FancyTextInput
      {...rest}
      inputProps={{
        multiline: true,
        numberOfLines: numberOfLines ?? 4,
        ...remainingInputProps,
        style: [
          { minHeight: 100, paddingVertical: 10, textAlignVertical: 'top' as const },
          ...containerStyleArray,
          ...normalizedInputStyle,
        ],
      }}
    />
  );
}
