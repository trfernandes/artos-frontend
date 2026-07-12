import { StyleSheet, TouchableOpacity } from 'react-native';
import { usePallete } from '../../hooks/usePallete';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { DefaultIconsNames } from '../../constants/icons';

export type FABProps = {
  icon?: CustomIconProps;
  onPress?: () => void;
  size?: number;
  backgroundColor?: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  disabled?: boolean;
  testID?: string;
};

export default function FancyFab({
  top = undefined,
  left = undefined,
  right = 15,
  bottom = 15,
  icon = { library: DefaultIconsNames.add.library, name: DefaultIconsNames.add.name, size: 38 },
  onPress,
  backgroundColor,
  size = 50,
  disabled = false,
  testID,
}: FABProps) {
  const Pallete = usePallete();
  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.container,
        {
          top,
          left,
          right,
          bottom,
          width: size,
          height: size,
          backgroundColor: backgroundColor || Pallete.terciary,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
      onPress={onPress}
    >
      <DefaultIcons.Custom size={icon.size || size - 10} color={Pallete.fonts.light} {...icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    position: 'absolute',
    right: 15,
    bottom: 15,
    zIndex: 100,
  },
});
