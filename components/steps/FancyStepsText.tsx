import { View } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';

export type FancyStepsTextProps = {
  containerWidth: number;
  text: string;
  textColor: string;
  position?: 'left' | 'center' | 'right';
};

export default function FancyStepsText({ position = 'center', ...props }: FancyStepsTextProps) {
  return (
    <View
      style={{
        // width: `${props.containerWidth}%`,
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderWidth: 0,
        borderColor: 'orange',
      }}
    >
      <FancyText
        adjustsFontSizeToFit
        numberOfLines={1}
        maxFontSizeMultiplier={1}
        size="extraSmall"
        type="semiBold"
        color={props.textColor}
        style={{
          borderWidth: 0,
          borderColor: Pallete.terciary,
          // width: '100%',
          // textAlign: position,
        }}
      >
        {props.text}
      </FancyText>
    </View>
  );
}
