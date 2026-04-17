import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import React from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FancyStepsConfig } from './FancyStepsConfig';
import FancyStepsHeader, { FancyStepsHeaderProps } from './FancyStepsHeader';
import FancyStepsNavigation, { FancyStepsNavigationProps } from './FancyStepsNavigation';
import { ThemePalette } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export type FancyStepsSize = 'normal' | 'small';
export type FancyStepsOverflowBehavior = 'always' | 'fitThenScroll';

export type FancyStepsProps = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  headerProps?: FancyStepsHeaderProps;
  content?: { containerStyle?: StyleProp<ViewStyle> };
  contentContainerStyle?: StyleProp<ViewStyle>;
  navigationContainerStyle?: StyleProp<ViewStyle>;
  navigatorProps?: FancyStepsNavigationProps;
  /** Tamanho dos steps: 'normal' (35px) ou 'small' (25px). Padrão: 'normal' */
  size?: FancyStepsSize;
  /** Controle de rolagem do conteúdo: 'always' (padrão) ou 'fitThenScroll' */
  overflowBehavior?: FancyStepsOverflowBehavior;
};

export default function FancySteps(props: FancyStepsProps) {
  const styles = useThemedStyles(createStyles);
  const { size = 'normal' } = props;

  const stepContent = props.config.steps[props.index].content;

  return (
    <View style={[styles.container, props.containerStyle]}>
      <FancyStepsHeader
        {...props}
        {...props.headerProps}
        containerStyle={props.headerContainerStyle}
        size={size}
      />

      <View style={[styles.body, props.content?.containerStyle]}>
        <KeyboardAwareScrollView
          style={styles.scroll}
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={24}
          extraHeight={0}
          nestedScrollEnabled
          scrollEnabled
          bounces={false}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='interactive'
          contentContainerStyle={[styles.scrollContent, props.contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {stepContent}
        </KeyboardAwareScrollView>
      </View>

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

function createStyles(palette: ThemePalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: palette.backgroundColor,
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      gap: 20,
    },
    body: {
      flex: 1,
      minHeight: 0,
    },
    scroll: {
      flex: 1,
      minHeight: 0,
    },
    scrollContent: {
      flexGrow: 1,
      gap: 10,
      paddingBottom: 10,
    },
  });
}
