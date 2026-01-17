import { StyleSheet, View } from 'react-native';
import FancyText from '../FancyText';
import { Pallete } from '../../constants/colors';

export type FancyDrawerSeparatorProps = {
  label?: string;
};

export default function FancyDrawerSeparator(props: FancyDrawerSeparatorProps) {
  return (
    <View style={styles.container}>
      <FancyText size={'small'} type='semiBold' color={Pallete.fonts.inactive}>
        {props.label}
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 10, paddingVertical: 10 },
});
