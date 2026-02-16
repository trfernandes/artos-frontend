import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';
import FancyDropDown, { FancyDropDownProps } from '../fields/FancyDropDown';
import { View } from 'react-native';

interface ControlledFancyDropDownProps<TFormValues extends FieldValues, TName extends Path<TFormValues>> extends Pick<
  FancyDropDownProps<PathValue<TFormValues, TName>>,
  'placeholder' | 'listItems' | 'label' | 'onChange' | 'disabled' | 'isLoading' | 'dropdownPosition' | 'renderMode' | 'inverted'
> {
  control: Control<TFormValues>;
  name: TName;
}

export default function ControlledDropDown<TFormValues extends FieldValues, TName extends Path<TFormValues>>({
  control,
  name,
  ...rest
}: ControlledFancyDropDownProps<TFormValues, TName>) {
  const { listItems, onChange: externalOnChange, ...dropDownProps } = rest;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyDropDown<PathValue<TFormValues, TName>>
            listItems={listItems}
            value={value as PathValue<TFormValues, TName>}
            onBlur={onBlur}
            onChange={(selectedValue) => {
              onChange(selectedValue);
              externalOnChange?.(selectedValue);
            }}
            disabled={disabled}
            {...dropDownProps}
          />
          {error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
