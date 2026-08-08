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
        // Mantém a cor de fundo customizada também durante o loading.
        // Sem isso, ao ficar disabled (enabled=false) durante o submit, o botão
        // cairia no estilo de disabled (cinza) com spinner/texto brancos — cores quebradas.
        const keepCustomBg = !!color && (enabled || !!buttonProps.isLoading);
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
            containerStyle={[styles.action, keepCustomBg && { backgroundColor: color }, { gap: 6 }]}
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
