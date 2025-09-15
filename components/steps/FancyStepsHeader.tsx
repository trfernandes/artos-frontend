import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FancyStepsCircle from './FancyStepsCircle';
import { Pallete } from '../../constants/colors';
import FancyStepsLine from './FancyStepsLine';
import FancyStepsText from './FancyStepsText';
import { FancyStepsConfig } from './FancyStepsConfig';

export type FancyStepsHeaderProps = {
  index: number;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function FancyStepsHeader({ config, containerStyle, ...props }: FancyStepsHeaderProps) {
  const width = 100 / (config.steps?.length ?? 0);

  return (
    <View style={[styles.container, containerStyle]}>
      <View>
        <View style={styles.containerLine}>
          {config.steps?.map((_, index) => {
            const isFirst = index === 0;
            const isLast = index === (config.steps?.length ?? 0) - 1;
            const isSelected = index === props.index;
            const isNextOfSelected = index === props.index + 1;

            let leftColor = Pallete.disabled2;
            let rightColor = Pallete.disabled2;

            if (config.steps?.length === 1) {
              leftColor = 'transparent';
              rightColor = 'transparent';
            }
            //First Not Selected
            else if (isFirst && !isSelected) {
              leftColor = Pallete.disabled2;
              rightColor = Pallete.disabled2;
            }
            //First Selected
            else if (isFirst && isSelected) {
              leftColor = Pallete.primary;
              rightColor = Pallete.primary;
            }
            //Center Not Selected
            else if (!isFirst && !isLast && !isSelected) {
              leftColor = isNextOfSelected ? Pallete.primary : Pallete.disabled2;
              rightColor = isNextOfSelected ? Pallete.disabled2 : Pallete.disabled2;
            }
            //Center Selected
            else if (!isFirst && !isLast && isSelected) {
              leftColor = Pallete.disabled2;
              rightColor = Pallete.primary;
            }
            //Last NOT Selected
            else if (isLast && !isSelected) {
              leftColor = isNextOfSelected ? Pallete.primary : Pallete.disabled2;
              rightColor = isNextOfSelected ? Pallete.primary : Pallete.disabled2;
            }
            //Last Selected
            else if (isLast && isSelected) {
              leftColor = Pallete.disabled2;
              rightColor = Pallete.disabled2;
            }

            return <FancyStepsLine key={index} leftColor={leftColor} rightColor={rightColor} width={width} />;
          })}
        </View>
        <View
          style={[
            styles.containerCircles,
            config.steps?.length === 1 ? { justifyContent: 'center' } : { justifyContent: 'space-between' },
          ]}
        >
          {config.steps?.map((items, index) => {
            const isFirst = index === 0;
            const isLast = index === (config.steps?.length ?? 0) - 1;
            return (
              <FancyStepsCircle
                key={index}
                position={'center'}
                stepNumber={(index + 1).toString()}
                stepLabel={items.title}
                containerWidth={width}
                circleWidth={40}
                color={index === props.index ? Pallete.primary : Pallete.disabled2}
                leftBackgroundColor={isFirst ? 'white' : 'transparent'}
                rightBackgroundColor={isLast ? 'white' : 'transparent'}
              />
            );
          })}
        </View>
      </View>
      <View
        style={[
          styles.containerTexts,
          config.steps?.length === 1 ? { justifyContent: 'center' } : { justifyContent: 'space-between' },
        ]}
      >
        {config.steps?.map((item, index) => {
          return (
            <FancyStepsText
              key={index}
              containerWidth={width}
              text={item.title}
              position={'center'}
              textColor={index === props.index ? Pallete.primary : Pallete.disabled2}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 10, paddingHorizontal: 20 },
  containerLine: {
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    top: '50%',
  },
  containerCircles: {
    zIndex: 10,

    flexDirection: 'row',
  },
  containerTexts: { flexDirection: 'row', justifyContent: 'space-between' },
  selected: { backgroundColor: 'purple' },
});
