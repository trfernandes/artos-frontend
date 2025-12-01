import { Control, Controller } from 'react-hook-form';
import FancyErrorText from './FancyErrorText';
import FancyTextArea, { FancyTextAreaProps } from '../fields/FancyTextArea';
import { View } from 'react-native';

interface ControlledFancyTextAreaProps extends FancyTextAreaProps {
  control: Control<any>;
  name: string;
}

export default function ControlledTextArea({ control, name, ...rest }: ControlledFancyTextAreaProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, disabled }, fieldState: { error } }) => (
        <View style={{ gap: 5 }}>
          <FancyTextArea
            inputProps={{
              onBlur,
              onChangeText: text => {
                onChange(text);
              },
            }}
            value={value}
            disabled={disabled}
            {...rest}
          />
          {error && <FancyErrorText message={error.message!} />}
        </View>
      )}
    />
  );
}
