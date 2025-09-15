import { Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';

export type FancyDataPanelProps = {
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>; 
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  value?: string;
  disabled?: boolean;
};

export default function FancyDataPanel({ disabled = false, ...props }: FancyDataPanelProps) {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <Pressable onPress={props.onPress} style={[styles.panelContainer, props.buttonStyle]}>
        {props.value ? (
          <FancyText
            size={'small'}
            type="bold"
            color={disabled ? Pallete.fonts.inactive : Pallete.fonts.dark}
            style={props.textStyle}
          >
            {props.value}
          </FancyText>
        ) : (
          <FancyText
            size={'extraSmall'}
            type="semiBold"
            color={disabled ? Pallete.fonts.inactive : Pallete.fonts.dark}
            style={props.textStyle}
          >
            Selecionar
          </FancyText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  panelContainer: {
    backgroundColor: Pallete.backgroundColor2,
    minHeight: 30,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 10,
    borderColor: 'blueviolet',
  },
});
