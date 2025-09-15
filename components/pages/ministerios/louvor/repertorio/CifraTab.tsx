import { View, StyleSheet } from 'react-native';
import FancyTextArea from '../../../../fields/FancyTextArea';
import FancyTextInput from '../../../../fields/FancyTextInput';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyButton from '../../../../buttons/FancyButton';

export default function CifraTab() {
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, borderWidth: 0 }}>
        <FancyTextArea containerStyle={{ height: '100%' }} placeholder="Digite a cifra da música..." />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, borderWidth: 0 }}>
        <FancyTextInput label="Link" inputContainerStyle={{ flex: 1, height: 61}} />
        <FancyButton icon={{ ...DefaultIconsNames.open, size: 18 }} size={40} containerStyle={{ alignSelf: 'flex-end' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, paddingHorizontal: 20, flex: 1, borderWidth: 0 },
});
