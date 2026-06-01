import { View } from 'react-native';
import FancyNumberInput, { FancyNumberInputProps } from '../fields/FancyNumberInput';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';

interface ControlledNumberInputProps<FormData extends FieldValues> extends Omit<
  FancyNumberInputProps,
  'value' | 'onChange'
> {
  control: Control<FormData>;
  name: Path<FormData>;
}

export default function ControlledNumberInput<FormData extends FieldValues>({
  control,
  name,
  ...rest
}: ControlledNumberInputProps<FormData>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => {
        return (
          <View style={{ gap: 5 }}>
            <FancyNumberInput value={value} onChange={onChange} title={rest.title} {...rest} />
            {error && <FancyErrorText message={error.message!} />}
          </View>
        );
      }}
    />
  );
}
