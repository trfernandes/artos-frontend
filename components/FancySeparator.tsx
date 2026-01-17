import { View, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Pallete } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export type FancySeparatorProps = {
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export default function FancySeparator(props: FancySeparatorProps) {
  // Use a cor padrão ou a cor fornecida
  const baseColor = props.color || Pallete.border;

  // Cria a cor com transparência (0) para as pontas
  const transparentColor = 'rgba(0, 0, 0, 0)';

  return (
    <View style={[styles.container, props.style]}>
      <LinearGradient
        colors={[transparentColor, baseColor, baseColor, transparentColor]}
        locations={[0, 0.2, 0.8, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: props.height || 0.4, width: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 0,
  },
});
