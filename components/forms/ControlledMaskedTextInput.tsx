import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FancyMaskedTextInput, { FancyMaskedTextInputProps } from '../fields/FancyMaskedTextInput';
import { View } from 'react-native';
import FancyErrorText from './FancyErrorText';

interface ControlledMaskedTextInputProps<FormData extends FieldValues> extends Pick<
  FancyMaskedTextInputProps,
  | 'label'
  | 'inputContainerStyle'
  | 'inputProps'
  | 'disabled'
  | 'maskType'
  | 'customPattern'
  | 'labelProps'
> {
  control: Control<FormData>;
  name: Path<FormData>;
  showErrorMessage?: boolean;
}

export default function ControlledMaskedTextInput<FormData extends FieldValues>({
  control,
  name,
  showErrorMessage = true,
  ...rest
}: ControlledMaskedTextInputProps<FormData>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyMaskedTextInput
            disabled={disabled}
            {...rest}
            value={
              value === undefined || value === null
                ? ''
                : typeof value === 'string'
                  ? value
                  : String(value)
            }
            inputProps={{
              ...rest.inputProps,
              onBlur,
            }}
            onChangeText={(rawValue) => {
              onChange(rawValue);
            }}
          />
          {showErrorMessage && error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
