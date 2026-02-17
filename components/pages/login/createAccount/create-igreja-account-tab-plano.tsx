import { View, StyleSheet } from 'react-native';
import FancyText from '../../../FancyText';
import { Pallete } from '../../../../constants/colors';

export default function CreateIgrejaAccountTabPlano() {
  return (
    <View style={styles.container}>
      <FancyText size="medium" color={Pallete.secondary} style={styles.placeholder}>
        Escolha seu plano (em breve)
      </FancyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholder: {
    textAlign: 'center',
  },
});
