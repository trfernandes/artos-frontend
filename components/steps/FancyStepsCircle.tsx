import { StyleProp, View, ViewStyle } from 'react-native';
import FancyText from '../FancyText';

export type FancyStepsCircleProps = {
  stepNumber: string;
  circleWidth: number;
  color: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancyStepsCircle({ stepNumber, circleWidth, color, containerStyle }: FancyStepsCircleProps) {
  return (
    <View
      style={[
        {
          width: circleWidth,
          height: circleWidth,
          borderRadius: circleWidth / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        },
        containerStyle,
      ]}
    >
      <FancyText size={circleWidth <= 25 ? 'small' : 'large'} color="white" type="bold">
        {stepNumber}
      </FancyText>
    </View>
  );
}
