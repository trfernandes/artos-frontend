import { View } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';

export type FancyStepsCircleProps = {
  position?: 'left' | 'center' | 'right';
  stepLabel: string;
  stepNumber: string;
  containerWidth: number;
  circleWidth: number;
  color: string;
  rightBackgroundColor?: string;
  leftBackgroundColor?: string;
};

export default function FancyStepsCircle({ position = 'center', ...props }: FancyStepsCircleProps) {
  return (
    <View
      style={{
        alignItems: position === 'left' ? 'flex-start' : position === 'right' ? 'flex-end' : 'center',
        borderColor: 'purple',
      }}
    >
      <View
        style={{
          borderWidth: 0,
          borderColor: 'lightblue',
          alignItems: 'center',
        }}
      >
        <View>
          <View
            style={{
              zIndex: 11,
              borderRadius: 100,
              backgroundColor: props.color,
              height: props.circleWidth,
              width: props.circleWidth,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FancyText size="large" color="white" type="bold">
              {props.stepNumber}
            </FancyText>
          </View>
        </View>
        <FancyText
          adjustsFontSizeToFit
          numberOfLines={1}
          maxFontSizeMultiplier={1}
          size="small"
          type="semiBold"
          color={'red'}
          style={{ height: 0, borderWidth: 0, borderColor: Pallete.terciary, textAlign: 'center' }}
        >
          {props.stepLabel}
        </FancyText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          // borderWidth: 2,
          // height: props.circleWidth,
          // width: props.circleWidth,
          flex: 1,
          height: '100%',
          width: '100%',
          position: 'absolute',
        }}
      >
        <View style={{ backgroundColor: props.leftBackgroundColor || 'transparent', flex: 1 }} />
        <View style={{ backgroundColor: props.rightBackgroundColor || 'transparent', flex: 1 }} />
      </View>
    </View>
  );
}
