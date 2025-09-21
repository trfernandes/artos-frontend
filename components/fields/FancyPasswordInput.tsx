import { useState } from 'react';
import FancyTextInput, { FancyTextInputProps } from './FancyTextInput';
import FancyButton from '../buttons/FancyButton';
import { Pallete } from '../../constants/colors';

export default function FancyPasswordInput(props: FancyTextInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FancyTextInput
      {...props}
      inputProps={{ ...props.inputProps, secureTextEntry: !showPassword }}
      rightContainer={
        <FancyButton
          mode="icon"
          type="text"
          size={18}
          icon={{
            library: 'Feather',
            name: showPassword ? 'eye-off' : 'eye',
            size: 18,
            color: Pallete.icons.inactive,
            style: { marginRight: 10, marginTop: 1 },
          }}
          onPress={() => setShowPassword(!showPassword)}
        />
      }
    />
  );
}
