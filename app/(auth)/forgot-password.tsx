import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import LoginBase from '../../components/pages/login/LoginBase';
import { Pallete } from '../../constants/colors';
import { DefaultIconsNames } from '../../constants/icons';
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
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'O formato inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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
          text1: 'Se o e-mail existir, enviamos instruções de recuperação.',
        });
      } else {
        Toast.show({ type: 'error', text1: 'Erro ao solicitar recuperação.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao solicitar recuperação.' });
    }
  };

  return (
    <LoginBase>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FancyButton
            icon={{ ...DefaultIconsNames['chevron-left'], color: Pallete.icons.dark }}
            size={30}
            onPress={() => router.back()}
            containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
          />
        </View>

        <View style={styles.topContainer}>
          <View style={styles.titleContainer}>
            <FancyText size={'extraLarge'} type="semiBold" color="white" style={{ fontSize: 17 }}>
              Recuperação de Senha
            </FancyText>
            <FancyText
              size={'medium'}
              type="medium"
              color="white"
              style={{
                width: 220,
                borderWidth: 0,
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              Informe seu e-mail para receber as instruções de recuperação
            </FancyText>
          </View>

          <View style={styles.centerContainer}>
            <View style={styles.fieldsContainer}>
              <ControlledTextInput
                label="E-mail"
                name="email"
                control={control}
                inputProps={{ autoCapitalize: 'none', keyboardType: 'email-address' }}
              />

              <FancyButton
                label={isSubmitting ? 'Enviando...' : 'Enviar'}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
      </View>
    </LoginBase>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flex: 1,
    borderWidth: DESIGN_MODE,
    borderColor: 'gold',
    paddingHorizontal: 40,
    paddingVertical: 20,
    justifyContent: 'flex-start',
    gap: 20,
  },
  topContainer: { flex: 1, gap: 40, justifyContent: 'center' },
  centerContainer: {
    flex: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
    justifyContent: 'center',
  },
  bottomSpacer: { flex: 0, borderWidth: DESIGN_MODE, borderColor: 'deepskyblue' },
  logoContainer: {
    position: 'absolute',
    left: 40,
    top: 40,
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
