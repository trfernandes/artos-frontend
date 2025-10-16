import { View, StyleSheet, ViewStyle, StyleProp, ViewProps } from 'react-native';
import { Pallete } from '../../constants/colors';

interface FancyPageViewProps {
  children?: React.ReactNode | React.ReactNode[];
  style?: StyleProp<ViewStyle>;
}

export default function FancyPageView(props: FancyPageViewProps & ViewProps) {
  return (
    <View {...props} style={[styles.container, props.style]} >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Pallete.backgroundColor,
  },
});
