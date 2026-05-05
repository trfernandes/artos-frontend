import { StyleProp, ViewStyle } from 'react-native';
import FancyButton, { FancyButtonProps } from '../buttons/FancyButton';
import { CustomIconProps } from '../FancyIcons';
import { usePallete } from '../../hooks/usePallete';

export type FancyHeaderButtonProps = {
  icon: CustomIconProps;
  onPress: () => void;
  buttonProps?: FancyButtonProps;
  showBackground?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancyHeaderButton({ icon, onPress, buttonProps, showBackground = false }: FancyHeaderButtonProps) {
  const palette = usePallete();

  return (
    <FancyButton
      mode='icon'
      type='text'
      icon={{
        ...icon,
        color: palette.icons.dark,
        size: icon.size || 22,
      }}
      onPress={onPress}
      {...buttonProps}
      containerStyle={[
        {
          // borderWidth: 1,
          height: 30,
          minWidth: 30,
          backgroundColor: showBackground ? palette.backgroundColor3 : 'transparent',
        },
        buttonProps?.containerStyle,
      ]}
    />
  );
}
