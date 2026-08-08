import { View, StyleSheet } from 'react-native';
import { useFormContext, useWatch } from 'react-hook-form';
import { LoginCreateIgrejaFormData } from '../../../../domain/schemas/loginCreateIgrejaSchema';
import ControlledTextInput from '../../../forms/ControlledTextInput';
import ControlledPasswordInput from '../../../forms/ControlledPasswordInput';
import ControlledMaskedTextInput from '../../../forms/ControlledMaskedTextInput';
import PasswordStrengthMeter from '../../../forms/PasswordStrengthMeter';
import { usePallete } from '../../../../hooks/usePallete';

export default function CreateIgrejaAccountTabResponsavel() {
  const { control } = useFormContext<LoginCreateIgrejaFormData>();
  const palette = usePallete();
  const labelProps = { style: { color: palette.fonts.dark } };
  const senhaValue = useWatch({ control, name: 'responsavelSenha' });

  return (
    <View style={styles.container}>
      <ControlledTextInput
        control={control}
        name='responsavelNome'
        label='Nome do Responsável'
        labelProps={labelProps}
      />
      <ControlledTextInput
        control={control}
        name='responsavelEmail'
        label='E-mail'
        labelProps={labelProps}
        keyboardType='email-address'
        inputProps={{ autoCapitalize: 'none' }}
      />
      <View style={styles.passwordField}>
        <ControlledPasswordInput
          control={control}
          name='responsavelSenha'
          label='Senha'
          labelProps={labelProps}
        />
        <PasswordStrengthMeter password={senhaValue ?? ''} />
      </View>
      <ControlledPasswordInput
        control={control}
        name='responsavelConfirmarSenha'
        label='Confirmar Senha'
        labelProps={labelProps}
      />
      <ControlledMaskedTextInput
        control={control}
        name='responsavelWhatsapp'
        label='WhatsApp'
        labelProps={labelProps}
        maskType='phone'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
    width: '100%',
  },
  passwordField: {
    gap: 8,
  },
});
