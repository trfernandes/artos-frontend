import { View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';

export interface FancyLoadingProps {
  label?: string;
  containerSyle?: StyleProp<ViewStyle>;
}

export default function FancyLoading({ label = 'Carregando...' }: FancyLoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} />
      <FancyText size={'medium'} type="semiBold" color={Pallete.fonts.inactive}>
        {label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Pallete.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
});
