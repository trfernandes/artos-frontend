import { StyleSheet } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { Pallete } from '../../constants/colors';
import Toast from 'react-native-toast-message';
import z from 'zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'O formato invalido'),
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
    try {
      const success = await forgotPassword(data.email);

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Se o e-mail existir, enviamos instrucoes de recuperacao.',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Erro ao solicitar recuperacao.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao solicitar recuperacao.' });
    }
  };

  return (
    <AuthScreen
      showBackButton
      scrollContainerStyle={styles.scrollContainer}
      headerContainerStyle={styles.titleContainer}
      headerWidth={{ default: '85%', keyboard: '100%' }}
      contentWidth={{ default: '85%', keyboard: '100%' }}
      paddingTopOnKeyboard={60}
      fieldsContainerStyle={styles.fieldsContainer}
      backButtonContainerStyle={styles.backButtonContainer}
      header={({ keyboardVisible }) => (
        <>
          <FancyText size={!keyboardVisible ? 'extraLarge' : 'large'} type='bold' color='white'>
            Recuperação de Senha
          </FancyText>
          <FancyText
            size={!keyboardVisible ? 'medium' : 'small'}
            type='medium'
            color='white'
            style={{
              width: '99%',
              borderWidth: 0,
            }}
          >
            Informe seu e-mail para receber as instrucoes de recuperação
          </FancyText>
        </>
      )}
    >
      <>
        <ControlledTextInput
          label='E-mail'
          name='email'
          control={control}
          inputProps={{ autoCapitalize: 'none', keyboardType: 'email-address' }}
        />

        <FancyButton label={isSubmitting ? 'Enviando...' : 'Enviar'} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
      </>
    </AuthScreen>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingVertical: 0,
    justifyContent: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'blueviolet',
    gap: 25,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 40,
    zIndex: 10,
    top: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    gap: 2,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    justifyContent: 'center',
  },
  fieldsContainer: {
    borderWidth: DESIGN_MODE,
    borderRadius: 15,
    borderColor: 'firebrick',
    padding: 25,
    gap: 25,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
});
