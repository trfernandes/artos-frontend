import { Control, Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';
import FancyBottomSheetSelect, {
  FancyBottomSheetSelectProps,
} from '../fields/FancyBottomSheetSelect';
import { View } from 'react-native';

interface ControlledBottomSheetSelectProps<
  TFormValues extends FieldValues,
  TName extends Path<TFormValues>,
> extends Pick<
  FancyBottomSheetSelectProps<PathValue<TFormValues, TName>>,
  'placeholder' | 'listItems' | 'label' | 'onChange' | 'disabled' | 'isLoading' | 'title'
> {
  control: Control<TFormValues>;
  name: TName;
}

export default function ControlledBottomSheetSelect<
  TFormValues extends FieldValues,
  TName extends Path<TFormValues>,
>({ control, name, ...rest }: ControlledBottomSheetSelectProps<TFormValues, TName>) {
  const { listItems, onChange: externalOnChange, ...selectProps } = rest;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyBottomSheetSelect<PathValue<TFormValues, TName>>
            listItems={listItems}
            value={value as PathValue<TFormValues, TName>}
            onBlur={onBlur}
            onChange={(selectedValue) => {
              onChange(selectedValue);
              externalOnChange?.(selectedValue);
            }}
            disabled={disabled}
            {...selectProps}
          />
          {error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
