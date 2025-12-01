import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { FancyStepsConfig } from './FancyStepsConfig';
import FancyButton from '../buttons/FancyButton';

export interface FancyStepsNavigationProps {
  stepIndex: number;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FancyStepsNavigation({ config, stepIndex, setStepIndex, containerStyle }: FancyStepsNavigationProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {config.steps[stepIndex]?.actions?.map(({ enabled = true, ...action }, actionIndex) => {
        return (
          <FancyButton
            key={actionIndex}
            onPress={
              enabled && typeof action.onPress === 'function'
                ? action.onPress
                : action.onPress === 'next'
                ? () => {
                    stepIndex < config.steps.length - 1 ? setStepIndex(stepIndex + 1) : null;
                  }
                : () => {
                    stepIndex > 0 ? setStepIndex(stepIndex - 1) : null;
                  }
            }
            label={action.label}
            icon={action.icon}
            iconPosition={action.iconPosition}
            disabled={!enabled}
            containerStyle={[styles.action, action.color && { backgroundColor: action.color }, { gap: 6 }]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  action: { flex: 1 },
});
