import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { FancyTextInputProps } from '../fields/FancyTextInput';
import { TextInputProps, View } from 'react-native';
import FancyErrorText from './FancyErrorText';
import FancyPasswordInput from '../fields/FancyPasswordInput';

interface ControlledFancyTextInputProps<FormData extends FieldValues>
  extends Pick<FancyTextInputProps, 'label' | 'labelProps' | 'inputContainerStyle' | 'inputProps'>, Pick<TextInputProps, 'keyboardType'> {
  control: Control<FormData>;
  name: Path<FormData>;
  showErrorMessage?: boolean;
}

export default function ControlledPasswordInput<FormData extends FieldValues>({
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
          <FancyPasswordInput
            disabled={disabled}
            {...rest}
            value={value}
            inputProps={{
              ...rest.inputProps,
              onBlur,
              onChangeText: onChange,
            }}
          />
          {showErrorMessage && error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
