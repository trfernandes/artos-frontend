import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import FancyColorPicker, { FancyColorPickerProps } from '../FancyColorPicker';

interface ControlledColorPickerProps<TFormValues extends FieldValues, TName extends Path<TFormValues>>
  extends Omit<FancyColorPickerProps, 'value' | 'onSelectColor'> {
  control: Control<TFormValues>;
  name: TName;
}

export default function ControlledColorPicker<TFormValues extends FieldValues, TName extends Path<TFormValues>>({
  control,
  name,
  ...rest
}: ControlledColorPickerProps<TFormValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <FancyColorPicker value={value} onSelectColor={onChange} {...rest} />
      )}
    />
  );
}
