import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import FancyText from './FancyText';
import { usePallete } from '../hooks/usePallete';

const SLOW_LABEL_DELAY_MS = 5000;
const SLOW_LABEL = 'Isso está demorando mais que o esperado...';

export interface FancyLoadingProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FancyLoading({
  label = 'Carregando...',
  containerStyle,
}: FancyLoadingProps) {
  const palette = usePallete();
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    setIsSlow(false);
    const timer = setTimeout(() => setIsSlow(true), SLOW_LABEL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [label]);

  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor }, containerStyle]}>
      <ActivityIndicator size={'large'} color={palette.primary} />
      <FancyText
        size={'medium'}
        type='semiBold'
        color={palette.fonts.inactive}
        style={styles.label}
      >
        {isSlow ? SLOW_LABEL : label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    paddingHorizontal: 32,
  },
  label: {
    textAlign: 'center',
  },
});
