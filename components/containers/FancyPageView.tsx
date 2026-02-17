import { View, StyleSheet, ViewStyle, StyleProp, ViewProps } from 'react-native';
import { usePallete } from '../../hooks/usePallete';

interface FancyPageViewProps {
  children?: React.ReactNode | React.ReactNode[];
  style?: StyleProp<ViewStyle>;
}

export default function FancyPageView(props: FancyPageViewProps & ViewProps) {
  const palette = usePallete();

  return (
    <View
      {...props}
      style={[styles.container, { backgroundColor: palette.backgroundColor }, props.style]}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
