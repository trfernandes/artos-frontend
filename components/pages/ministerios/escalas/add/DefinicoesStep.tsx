import { StyleSheet, View } from 'react-native';
import FancyDatePickerModal from '../../../../datepicker/FancyDataPickerModal';
import FancySettingItem from '../../../../FancySettingItem';

export default function DefinicoesStep() {
  return (
    <View style={[styles.container]}>
      <FancySettingItem
        label={'Data Início'}
        options={[]}
        rightComponent={<FancyDatePickerModal value={new Date()} />}
      />
      <FancySettingItem
        label={'Data Término'}
        options={[]}
        rightComponent={<FancyDatePickerModal value={new Date()} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 15 },
});
