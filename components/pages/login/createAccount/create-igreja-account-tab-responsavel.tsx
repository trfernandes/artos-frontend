import { View, StyleSheet } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledPasswordInput from '../../../forms/ControlledPasswordInput';
import ControlledMaskedTextInput from '../../../forms/ControlledMaskedTextInput';

export default function CreateIgrejaAccountTabResponsavel() {
  const { control } = useFormContext<LoginCreateIgrejaFormData>();

  return (
    <View style={styles.container}>
      <ControlledTextInput control={control} name="responsavelNome" label="Nome do Responsável" />
      <ControlledTextInput control={control} name="responsavelEmail" label="E-mail" keyboardType="email-address" autoCapitalize="none" />
      <ControlledPasswordInput control={control} name="responsavelSenha" label="Senha" />
      <ControlledPasswordInput control={control} name="responsavelConfirmarSenha" label="Confirmar Senha" />
      <ControlledMaskedTextInput control={control} name="responsavelWhatsapp" label="WhatsApp" maskType="phone" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
    width: '100%',
  },
});
