import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';
import FancySelectField, { FancySelectFieldProps } from '../fields/FancySelectField';
import { View } from 'react-native';

interface ControlledFancySelectFieldProps<TFormValues extends FieldValues, TName extends Path<TFormValues>>
  extends Pick<
    FancySelectFieldProps<PathValue<TFormValues, TName>>,
    'placeholder' | 'listItems' | 'label' | 'onChange' | 'disabled' | 'isLoading' | 'modalTitle'
  > {
  control: Control<TFormValues>;
  name: TName;
}

export default function ControlledSelectField<TFormValues extends FieldValues, TName extends Path<TFormValues>>({
  control,
  name,
  ...rest
}: ControlledFancySelectFieldProps<TFormValues, TName>) {
  const { listItems, onChange: externalOnChange, ...selectFieldProps } = rest;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancySelectField<PathValue<TFormValues, TName>>
            listItems={listItems}
            value={value as PathValue<TFormValues, TName>}
            onBlur={onBlur}
            onChange={(selectedValue) => {
              onChange(selectedValue);
              externalOnChange?.(selectedValue);
            }}
            disabled={disabled}
            {...selectFieldProps}
          />
          {error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
