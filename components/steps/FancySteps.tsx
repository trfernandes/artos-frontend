import { View, StyleProp, ViewStyle, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { FancyStepsConfig } from './FancyStepsConfig';
import FancyStepsHeader, { FancyStepsHeaderProps } from './FancyStepsHeader';
import FancyStepsNavigation, { FancyStepsNavigationProps } from './FancyStepsNavigation';
import { Pallete } from '../../constants/colors';

export type FancyStepsSize = 'normal' | 'small';

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
};

export default function FancySteps(props: FancyStepsProps) {
  const { size = 'normal' } = props;

  const stepContent = props.config.steps[props.index].content;

  return (
    <View style={[styles.container, props.containerStyle]}>
      <FancyStepsHeader {...props} {...props.headerProps} containerStyle={props.headerContainerStyle} size={size} />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, props.contentContainerStyle]} showsVerticalScrollIndicator={false}>
        {stepContent}
      </ScrollView>

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
  container: {
    backgroundColor: Pallete.backgroundColor,
    flexDirection: 'column',

    // faz o componente respeitar o tamanho do pai (cresce/encolhe)
    flexGrow: 1,
    flexShrink: 1,

    gap: 20,
    // borderWidth: 1, // debug
  },

  // área “flexível” entre header e navegação
  body: {
    flex: 1,

    // MUITO importante pra ScrollView conseguir encolher dentro de um flex container
    minHeight: 0,
  },

  scroll: {
  },

  scrollContent: {
    // se você quer espaçamento entre itens, coloque aqui
    gap: 10,
    paddingBottom: 10,
  },
});
