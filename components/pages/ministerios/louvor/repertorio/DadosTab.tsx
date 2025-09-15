import { StyleSheet, View } from 'react-native';
import FancyScrollView from '../../../../FancyScrollView';
import FancyTextInput from '../../../../fields/FancyTextInput';
import FancyDropDown from '../../../../fields/FancyDropDown';
import { DefaultIconsNames } from '../../../../../constants/icons';
import FancyButton from '../../../../buttons/FancyButton';

export default function DadosTab() {
  return (
    <FancyScrollView contentContainerStyle={styles.contentContainer}>
      <FancyTextInput label="Título" />
      <FancyTextInput label="Artista" />
      <FancyDropDown label="Categoria" />
      <FancyDropDown label="Tom Original" />
      <FancyTextInput label="BPM" inputProps={{ keyboardType: 'numeric', maxLength: 3, textAlign: 'right' }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <FancyTextInput label="Link" inputContainerStyle={{ flex: 1 }} />
        <FancyButton icon={{ ...DefaultIconsNames.open, size: 18 }} size={40} containerStyle={{ alignSelf: 'flex-end' }} />
      </View>
    </FancyScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: { gap: 15, paddingHorizontal: 20 },
});
