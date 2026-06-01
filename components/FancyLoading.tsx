import { View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import FancyText from './FancyText';
import { usePallete } from '../hooks/usePallete';

export interface FancyLoadingProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FancyLoading({
  label = 'Carregando...',
  containerStyle,
}: FancyLoadingProps) {
  const palette = usePallete();

  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor }, containerStyle]}>
      <ActivityIndicator size={'large'} color={palette.primary} />
      <FancyText size={'medium'} type='semiBold' color={palette.fonts.inactive}>
        {label}
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
  },
});
