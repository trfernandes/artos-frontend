import { Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import FancyText from './FancyText';
import { ThemePalette } from '../constants/colors';
import { usePallete } from '../hooks/usePallete';
import { useThemedStyles } from '../hooks/useThemedStyles';

export type FancyDataPanelProps = {
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  value?: string;
  disabled?: boolean;
};

export default function FancyDataPanel({ disabled = false, ...props }: FancyDataPanelProps) {
  const palette = usePallete();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.container, props.containerStyle]}>
      <Pressable onPress={props.onPress} style={[styles.panelContainer, props.buttonStyle]}>
        {props.value ? (
          <FancyText
            size={'small'}
            type='bold'
            color={disabled ? palette.fonts.inactive : palette.fonts.dark}
            style={props.textStyle}
          >
            {props.value}
          </FancyText>
        ) : (
          <FancyText
            size={'extraSmall'}
            type='semiBold'
            color={disabled ? palette.fonts.inactive : palette.fonts.dark}
            style={props.textStyle}
          >
            Selecionar
          </FancyText>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {},
    panelContainer: {
      backgroundColor: palette.backgroundColor2,
      minHeight: 30,
      minWidth: 70,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: palette.borderCard,
    },
  });
}
