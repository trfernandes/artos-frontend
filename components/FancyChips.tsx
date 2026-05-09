import { TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FancyText, { FancyTextProps } from './FancyText';
import DefaultIcons, { CustomIconProps } from './FancyIcons';
import { BOLD_FONT, EXTRA_SMALL_SIZE_FONT, MEDIUM_SIZE_FONT, SMALL_SIZE_FONT } from '../constants/font';
import { usePallete } from '../hooks/usePallete';

export type FancyChipsProps = {
  label: string;
  color?: string;
  backgroundColor?: string;
  icon?: CustomIconProps;
  size?: 'small' | 'medium' | 'large';
  outlined?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  labelProps?: FancyTextProps;
};

export default function FancyChips({
  label,
  color,
  backgroundColor,
  icon,
  size = 'medium',
  outlined = false,
  onPress,
  style,
  labelProps,
}: FancyChipsProps) {
  const Pallete = usePallete();
  const resolvedColor = color ?? Pallete.primary;
  const sizes = {
    small: { font: EXTRA_SMALL_SIZE_FONT - 1, padV: 2, padH: 7, icon: 11 },
    medium: { font: SMALL_SIZE_FONT, padV: 5, padH: 10, icon: 14 },
    large: { font: MEDIUM_SIZE_FONT, padV: 7, padH: 14, icon: 16 },
  }[size];

  const baseBg = outlined ? 'transparent' : (backgroundColor ?? `${resolvedColor}22`);
  const baseBorder = outlined ? resolvedColor : (backgroundColor ?? `${resolvedColor}22`);
  const baseTextColor = outlined ? resolvedColor : resolvedColor;

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
          borderWidth: 1.5,
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
        numberOfLines={1}
        {...labelProps}
        style={[
          {
            color: baseTextColor,
            fontSize: sizes.font,
            fontFamily: BOLD_FONT,
            lineHeight: sizes.font + 3,
            includeFontPadding: false,
          },
          labelProps?.style,
        ]}
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
    minHeight: 20,
  },
});
