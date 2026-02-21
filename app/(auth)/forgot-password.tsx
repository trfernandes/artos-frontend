import { Keyboard, StyleSheet } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { ThemePalette } from '../../constants/colors';
import Toast from 'react-native-toast-message';
import z from 'zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { getApiErrorMessage } from '../../domain/api/api-error';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'O formato é inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const styles = useThemedStyles(createStyles);
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
    <AuthScreen
      showBackButton
      centerWithinBackButtonArea
      scrollContainerStyle={styles.scrollContainer}
      headerContainerStyle={styles.titleContainer}
      fieldsContainerStyle={styles.fieldsContainer}
      compactTitleOnKeyboard='Recuperação de Senha'
      header={({ keyboardVisible }) => (
        <>
          <FancyText size={!keyboardVisible ? 'extraLarge' : 'large'} type='bold' color='white'>
            Recuperação de Senha
          </FancyText>
          <FancyText
            size={!keyboardVisible ? 'medium' : 'small'}
            type='medium'
            color='white'
            style={{ borderWidth: 0 }}
          >
            Informe seu e-mail para receber as instruções de recuperação.
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

        <FancyButton
          label={isSubmitting ? 'Enviando...' : 'Enviar'}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </>
    </AuthScreen>
  );
}

const DESIGN_MODE = 0;

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 0,
      justifyContent: 'center',
      borderWidth: DESIGN_MODE,
      borderColor: 'blueviolet',
      gap: 25,
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
}
