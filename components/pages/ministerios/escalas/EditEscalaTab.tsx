import { StyleSheet, View } from 'react-native';
import FancySettingItem from '../../../FancySettingItem';
import FancyButton from '../../../buttons/FancyButton';
import FancyVerticalSpacer from '../../../FancyVerticalSpacer';
import { Pallete } from '../../../../constants/colors';

export default function EditEscalaTab() {
  return (
    <View style={styles.container}>
      <FancySettingItem label="Parametrização" options={[]} />
      <FancySettingItem label="Equipe" options={[]} />
      <FancyVerticalSpacer height={5} />
      <View style={styles.buttonsContainer}>
        <FancyButton
          label="Gerar"
          icon={{ library: 'MaterialCommunityIcons', name: 'calendar-arrow-right', size: 18, color: Pallete.primary }}
          type="outlined"
          containerStyle={{ flex: 1 }}
        />
        <FancyButton
          label="Resetar"
          type="outlined"
          icon={{ library: 'MaterialIcons', name: 'layers-clear', size: 18, color: Pallete.primary }}
          containerStyle={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingTop: 10 },
  buttonsContainer: { flexDirection: 'row', gap: 10 },
});
