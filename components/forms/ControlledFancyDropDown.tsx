import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';
import FancyDropDown, { FancyDropDownProps } from '../fields/FancyDropDown';
import { View } from 'react-native';

interface ControlledFancyDropDownProps<TFormValues extends FieldValues, TName extends Path<TFormValues>>
  extends Pick<FancyDropDownProps<PathValue<TFormValues, TName>>, 'listItems' | 'label' | 'onChange' | 'disabled'> {
  control: Control<TFormValues>;
  name: TName;
}

export default function ControlledFancyDropDown<
  TFormValues extends FieldValues,
  TName extends Path<TFormValues>
>({ control, name, ...rest }: ControlledFancyDropDownProps<TFormValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyDropDown
            listItems={rest.listItems}
            value={value as PathValue<TFormValues, TName>}
            onBlur={onBlur}
            onChange={onChange}
            disabled={disabled}
            {...rest}
          />
          {error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
