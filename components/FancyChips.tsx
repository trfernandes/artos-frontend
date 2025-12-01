import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyText from './FancyText';
import { Pallete } from '../constants/colors';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import { BOLD_FONT, EXTRA_SMALL_SIZE_FONT, MEDIUM_SIZE_FONT, SMALL_SIZE_FONT } from '../constants/font';

export type FancyChipsProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
  icon?: CustomIconProps;
  size?: 'small' | 'medium' | 'large';
  outlined?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function FancyChips({
  label,
  color = Pallete.primary,
  backgroundColor,
  icon,
  size = 'medium',
  outlined = false,
  onPress,
  style,
}: FancyChipsProps) {
  console.log('Rendering FancyChips with label:', label);

  const sizes = {
    small: { font: EXTRA_SMALL_SIZE_FONT, padV: 3, padH: 8, icon: 12 },
    medium: { font: SMALL_SIZE_FONT, padV: 5, padH: 10, icon: 14 },
    large: { font: MEDIUM_SIZE_FONT, padV: 7, padH: 14, icon: 16 },
  }[size];

  const baseBg = outlined ? 'transparent' : backgroundColor ?? `${color}22`;
  const baseBorder = outlined ? color : 'transparent';
  const baseTextColor = outlined ? color : color;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: baseBg,
          borderColor: baseBorder,
          paddingVertical: sizes.padV,
          paddingHorizontal: sizes.padH,
          borderWidth: outlined ? 1.5 : 0,
        },
        style,
      ]}
    >
      {icon && (
        <DefaultIcons.Custom
          library={icon.library}
          name={icon.name}
          size={icon.size || sizes.icon}
          color={baseTextColor}
          style={{ marginRight: 6 }}
        />
      )}
      <FancyText
        style={{
          color: baseTextColor,
          fontSize: sizes.font,
          fontFamily: BOLD_FONT,
        }}
      >
        {label}
      </FancyText>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
  },
});
