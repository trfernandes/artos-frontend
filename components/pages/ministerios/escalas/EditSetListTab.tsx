import { StyleSheet, View } from 'react-native';
import FancyContainerList from '../../../container_list/FancyContainerList';
import ControlledTextArea from '../../../forms/ControlledTextArea';
import { useForm } from 'react-hook-form';
import { DefaultIconsNames } from '../../../../constants/icons';

export default function EditSetListTab() {
  const form = useForm();

  return (
    <View style={styles.container}>
      <FancyContainerList
        title={'Músicas'}
        data={undefined}
        renderItem={undefined}
        buttons={[
          {
            icon: { ...DefaultIconsNames.add, size: 18 },
          },
          {
            icon: { library: 'MaterialIcons', name: 'move-down', size: 16 },
          },
        ]}
      />
      <ControlledTextArea control={form.control} name="description" label="Observações" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 15, paddingTop: 10 },
});
