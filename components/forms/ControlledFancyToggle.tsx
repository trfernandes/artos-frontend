import { Control, Controller, FieldValues, PathValue } from 'react-hook-form';
import FancyToggle, { FancyToggleProps } from '../fields/FancyToggle';

import { Path } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';
import { View } from 'react-native';

interface ControlledFancyToggleProps<TFormValues extends FieldValues, TName extends Path<TFormValues>>
  extends Pick<
    FancyToggleProps<PathValue<TFormValues, TName>>,
    'label' | 'option1' | 'option2' | 'disabled'
  > {
  control: Control<TFormValues>;
  name: TName;
}

export default function ControlledToggle<TFormValues extends FieldValues, TName extends Path<TFormValues>>({
  control,
  name,
  ...rest
}: ControlledFancyToggleProps<TFormValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => {
        return (
          <View style={{ gap: 5 }}>
            <FancyToggle
              onChange={newValue => onChange(newValue)}
              value={value}
              {...rest}
              disabled={disabled || rest.disabled}
            />
            {error && <FancyErrorText message={error.message!} />}
          </View>
        );
      }}
    />
  );
}
