import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import React from 'react';
import { FancyStepsConfig } from './FancyStepsConfig';
import FancyStepsHeader, { FancyStepsHeaderProps } from './FancyStepsHeader';
import FancyStepsNavigation, { FancyStepsNavigationProps } from './FancyStepsNavigation';
import { Pallete } from '../../constants/colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export type FancyStepsSize = 'normal' | 'small';

export type FancyStepsProps = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
  headerProps?: FancyStepsHeaderProps;
  content?: { containerStyle?: StyleProp<ViewStyle> };
  navigationContainerStyle?: StyleProp<ViewStyle>;
  navigatorProps?: FancyStepsNavigationProps;
  /** Tamanho dos steps: 'normal' (35px) ou 'small' (25px). Padrão: 'normal' */
  size?: FancyStepsSize;
};

export default function FancySteps(props: FancyStepsProps) {
  const { size = 'normal' } = props;

  return (
    <View style={[styles.container, props.containerStyle]}>
      <FancyStepsHeader {...props} {...props.headerProps} size={size} />

      <KeyboardAwareScrollView
        style={{ flex: 1, minHeight: 0, marginVertical:15 }}
        contentContainerStyle={[{ flexGrow: 1 }, props.content?.containerStyle]}
        keyboardShouldPersistTaps='handled'
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={0}
        showsVerticalScrollIndicator={false}
      >
        {props.config.steps[props.index].content}
      </KeyboardAwareScrollView>

      <FancyStepsNavigation
        containerStyle={props.navigationContainerStyle}
        stepIndex={props.index}
        setStepIndex={props.setIndex}
        config={props.config}
        {...props.navigatorProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Pallete.backgroundColor, flex: 1, justifyContent: 'space-between' },
});
