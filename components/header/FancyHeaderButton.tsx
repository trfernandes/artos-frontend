import { StyleProp, ViewStyle } from 'react-native';
import { Pallete } from '../../constants/colors';
import FancyButton, { FancyButtonProps } from '../buttons/FancyButton';
import { CustomIconProps } from '../FancyIcons';

export type FancyHeaderButtonProps = {
  icon: CustomIconProps;
  onPress: () => void;
  buttonProps?: FancyButtonProps;
  showBackground?: boolean;
  containerStyle?: StyleProp<ViewStyle>
};

export default function FancyHeaderButton({
  icon,
  onPress,
  buttonProps,
  showBackground = false,
}: FancyHeaderButtonProps) {
  return (
    <FancyButton
      mode="icon"
      type="text"
      icon={{
        ...icon,
        color: Pallete.icons.dark,
        size: icon.size || 22,
      }}
      onPress={onPress}
      {...buttonProps}
      containerStyle={[
        {
          // borderWidth: 1,
          height: 30,
          minWidth: 30,          
          backgroundColor: showBackground ? Pallete.backgroundColor3 : 'transparent',
        },
        buttonProps?.containerStyle,
      ]}
    />
  );
}
