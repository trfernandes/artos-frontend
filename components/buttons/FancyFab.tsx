import { StyleSheet, TouchableOpacity } from 'react-native';
import { Pallete } from '../../constants/colors';
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
}: FABProps) {
  return (
    <TouchableOpacity
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
