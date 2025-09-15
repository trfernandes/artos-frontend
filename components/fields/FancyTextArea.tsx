import { StyleProp, ViewStyle } from 'react-native';
import FancyTextInput, { FancyTextInputProps } from './FancyTextInput';

export type FancyTextAreaProps = { containerStyle?: StyleProp<ViewStyle> } & Omit<
  FancyTextInputProps,
  'multiline' | 'numberOfLines' | 'style' | 'inputContainerStyle'
>;

export default function FancyTextArea(props: FancyTextAreaProps) {
  return (
    <FancyTextInput
      {...props}
      inputProps={{
        multiline: true,
        numberOfLines: 4,
        style: [{ height: 100, paddingVertical: 10 }, props.containerStyle],
        ...props.inputProps,
      }}
    />
  );
}
