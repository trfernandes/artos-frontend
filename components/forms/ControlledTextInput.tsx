import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FancyTextInput, { FancyTextInputProps } from '../fields/FancyTextInput';
import { TextInputProps, View } from 'react-native';
import FancyErrorText from './FancyErrorText';

interface ControlledFancyTextInputProps<FormData extends FieldValues>
  extends
    Pick<FancyTextInputProps, 'label' | 'inputContainerStyle' | 'inputProps' | 'disabled' | 'rightContainer' | 'leftContainer' | 'containerStyle'>,
    Pick<TextInputProps, 'keyboardType'> {
  control: Control<FormData>;
  name: Path<FormData>;
  showErrorMessage?: boolean;
}

export default function ControlledTextInput<FormData extends FieldValues>({
  control,
  name,
  showErrorMessage = true,
  ...rest
}: ControlledFancyTextInputProps<FormData>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyTextInput
            disabled={disabled}
            {...rest}
            value={value === undefined || value === null ? '' : typeof value === 'string' ? value : String(value)}
            inputProps={{
              ...rest.inputProps,
              onBlur,
              onChangeText: (text) => {
                onChange(text);
              },
            }}
          />
          {showErrorMessage && error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
