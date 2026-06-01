import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { FancyStepsConfig } from './FancyStepsConfig';
import FancyButton from '../buttons/FancyButton';

export interface FancyStepsNavigationProps {
  stepIndex: number;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  config: FancyStepsConfig;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FancyStepsNavigation({
  config,
  stepIndex,
  setStepIndex,
  containerStyle,
}: FancyStepsNavigationProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {config.steps[stepIndex]?.actions?.map(({ enabled = true, ...action }, actionIndex) => {
        // Separar props conhecidos do resto
        const { label, icon, iconPosition, color, onPress, ...buttonProps } = action;
        return (
          <FancyButton
            key={actionIndex}
            onPress={
              enabled && typeof onPress === 'function'
                ? onPress
                : onPress === 'next'
                  ? () => {
                      stepIndex < config.steps.length - 1 ? setStepIndex(stepIndex + 1) : null;
                    }
                  : () => {
                      stepIndex > 0 ? setStepIndex(stepIndex - 1) : null;
                    }
            }
            label={label}
            icon={icon}
            iconPosition={iconPosition}
            disabled={!enabled}
            containerStyle={[
              styles.action,
              enabled && color && { backgroundColor: color },
              { gap: 6 },
            ]}
            {...buttonProps}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, width: '100%' },
  action: { flex: 1 },
});
