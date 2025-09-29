import { useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import { Pallete } from '../../constants/colors';
import DefaultIcons, { CustomIconProps } from '../FancyIcons';
import { DefaultIconsNames } from '../../constants/icons';
import FancyText from '../FancyText';

type FabButtonProps = {
  label?: string;
  backgroundColor?: string;
  icon: CustomIconProps;
  size?: number;
  onPress?: () => void;
};

type FancyExpandableFabProps = {
  mainButtonClosed?: FabButtonProps;
  mainButtonOpen?: FabButtonProps;
  buttons?: FabButtonProps[];
  spacing?: number;
  right?: number;
  bottom?: number;
};

const FAB_SIZE = 56;

export default function FancyExpandableFab({
  mainButtonClosed = {
    backgroundColor: Pallete.terciary,
    icon: DefaultIconsNames.edit,
  },
  mainButtonOpen = {
    backgroundColor: Pallete.terciary,
    icon: DefaultIconsNames.cancel,
  },
  buttons = [],
  spacing = 70,
  right = 20,
  bottom = 20,
}: FancyExpandableFabProps) {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current; // JS

  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    setOpen(!open);

    Animated.parallel([
      Animated.spring(animation, { toValue, useNativeDriver: true }),
      Animated.spring(colorAnim, { toValue, useNativeDriver: false }),
    ]).start();
  };

  // Ícones
  const closedOpacity = animation.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });
  const openOpacity = animation.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  // Cor do botão principal interpolada
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [mainButtonClosed.backgroundColor!, mainButtonOpen.backgroundColor!],
  });

  return (
    <View style={styles.container}>
      {/* Sub-botões */}
      {buttons.map((button, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(spacing * (index + 1))],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.optionButtonContainer,
              { transform: [{ translateY }], opacity: animation },
            ]}
            pointerEvents={open ? 'auto' : 'none'}
          >
            <View style={styles.labelContainer}>
              <FancyText type="semiBold" size={'small'}>
                {button.label}
              </FancyText>
            </View>
            <View
              style={[
                styles.optionButton,
                { backgroundColor: button.backgroundColor || Pallete.terciary },
              ]}
            >
              <DefaultIcons.Custom
                {...button.icon}
                color={Pallete.icons.light}
                size={button.size || 22}
              />
            </View>
          </Animated.View>
        );
      })}

      {/* Botão principal */}
      <TouchableOpacity activeOpacity={0.9} onPress={toggleMenu}>
        <Animated.View style={[styles.button, { backgroundColor }]}>
          {/* Ícone fechado */}
          <Animated.View
            style={[RNStyleSheet.absoluteFill, styles.iconWrapper, { opacity: closedOpacity }]}
            pointerEvents="none"
          >
            <DefaultIcons.Custom
              {...mainButtonClosed.icon}
              size={mainButtonClosed.size || 22}
              color={Pallete.icons.light}
            />
          </Animated.View>

          {/* Ícone aberto */}
          <Animated.View
            style={[RNStyleSheet.absoluteFill, styles.iconWrapper, { opacity: openOpacity }]}
            pointerEvents="none"
          >
            <DefaultIcons.Custom
              {...mainButtonOpen.icon}
              size={mainButtonOpen.size || 22}
              color={Pallete.icons.light}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'flex-end',
  },
  button: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginVertical: 8,
  },
  optionButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginVertical: 8,
  },
  optionButtonContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    position: 'absolute',
    right: 0,
  },
  labelContainer: {
    backgroundColor: Pallete.backgroundColor,
    justifyContent: 'center',
    elevation: 3,
    borderRadius: 10,
    height: '50%',
    paddingHorizontal: 12,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
