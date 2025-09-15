import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import React from 'react';
import { FancyStepsConfig } from './FancyStepsConfig';
import FancyStepsHeader, { FancyStepsHeaderProps } from './FancyStepsHeader';
import FancyStepsNavigation, { FancyStepsNavigationProps } from './FancyStepsNavigation';
import { Pallete } from '../../constants/colors';

export type FancyStepsProps = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
  headerProps?: FancyStepsHeaderProps;
  content?: { containerStyle?: StyleProp<ViewStyle> };
  navigatorProps?: FancyStepsNavigationProps;
};

export default function FancySteps(props: FancyStepsProps) {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <FancyStepsHeader {...props} {...props.headerProps} />
      <View style={[{ flex: 1 }, props.content?.containerStyle]}>{props.config.steps[props.index].content}</View>
      <FancyStepsNavigation
        stepIndex={props.index}
        setStepIndex={props.setIndex}
        config={props.config}
        {...props.navigatorProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Pallete.backgroundColor, flex: 1, gap: 25 },
});
