import { useFormContext } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { EscalaFormData } from '../../../../../domain/schemas/escalaSchema';
import ControlledDateInput from '../../../../forms/ControlledDateInput';
import ControlledTextInput from '../../../../forms/ControlledTextInput';

export default function AssistenteParametrosStep() {
  const form = useFormContext<EscalaFormData>();

  return (
    <View style={styles.container}>
      <ControlledTextInput control={form.control} name="nome" label="Como quer chamar essa escala?" />
      <ControlledDateInput control={form.control} name="dataInicio" label="Data de Início" />
      <ControlledDateInput control={form.control} name="dataTermino" label="Data de Término" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 15, paddingHorizontal: 20 },
});
