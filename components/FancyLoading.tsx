import { View, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { Pallete } from '../constants/colors';
import FancyText from './FancyText';

export interface FancyLoadingProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FancyLoading({ label = 'Carregando...', containerStyle }: FancyLoadingProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={'large'} color={Pallete.primary} />
      <FancyText size={'medium'} type="semiBold" color={Pallete.fonts.inactive}>
        {label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Pallete.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
});
