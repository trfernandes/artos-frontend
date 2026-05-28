import { Keyboard } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import AuthLayout from '../../components/pages/login/AuthLayout';
import Toast from 'react-native-toast-message';
import z from 'zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { getApiErrorMessage } from '../../domain/api/api-error';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'O formato é inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    Keyboard.dismiss();
    try {
      await forgotPassword(data.email);
      Toast.show({
        type: 'success',
        text1: 'E-mail enviado!',
        text2: 'Se o e-mail existir, você receberá as instruções de recuperação.',
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Não foi possível solicitar a recuperação de senha.',
      );
      Toast.show({ type: 'error', text1: 'Erro', text2: message });
    }
  };

  return (
    <AuthLayout
      showBackButton
      density='compact'
      hideHeaderOnKeyboard={false}
      title='Recuperação de Senha'
      subtitle='Informe seu e-mail para receber as instruções de recuperação.'
      footer={
        <FancyButton
          label={isSubmitting ? 'Enviando...' : 'Enviar'}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          icon={{ library: 'Feather', name: 'send', size: 16 }}
        />
      }
    >
      <ControlledTextInput
        label='E-mail'
        name='email'
        control={control}
        inputProps={{ autoCapitalize: 'none', keyboardType: 'email-address' }}
      />
    </AuthLayout>
  );
}

