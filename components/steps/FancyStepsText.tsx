import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';
import FancyText from '../FancyText';

export type FancyStepsTextProps = {
  text: string;
  textColor: string;
  maxWidth?: number;
  containerStyle?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export default function FancyStepsText({
  text,
  textColor,
  maxWidth,
  containerStyle,
  onLayout,
}: FancyStepsTextProps) {
  return (
    <View
      onLayout={onLayout}
      style={[
        {
          alignItems: 'center',
          justifyContent: 'flex-start',
          maxWidth,
        },
        containerStyle,
      ]}
    >
      <FancyText
        numberOfLines={2}
        maxFontSizeMultiplier={1}
        size='extraSmall'
        type='semiBold'
        color={textColor}
        style={{
          textAlign: 'center',
          maxWidth,
          lineHeight: 13,
        }}
      >
        {text}
      </FancyText>
    </View>
  );
}
