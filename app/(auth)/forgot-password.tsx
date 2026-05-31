import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import { usePallete } from '../../hooks/usePallete';
import { ColorUtils } from '../../utils/color_utils';
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
  const Pallete = usePallete();
  const insets = useSafeAreaInsets();

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
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <KeyboardAvoidingView style={styles.safe} behavior='height'>
        <View style={[styles.backButtonRow, { top: insets.top + 8 }]}>
          <FancyButton
            mode='icon'
            type='text'
            onPress={() => router.back()}
            icon={{ library: 'Feather', name: 'arrow-left', size: 18 }}
            iconStyle={{ color: Pallete.icons.dark }}
            containerStyle={{
              backgroundColor: ColorUtils.withAlpha(Pallete.fonts.dark, 0.08),
              borderRadius: 22,
              width: 44,
              height: 44,
            }}
          />
        </View>

        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
          <View style={styles.centerGroup}>
            <View style={styles.headerGroup}>
              <FancyText size='large' type='bold' color={Pallete.fonts.dark}>
                Recuperação de Senha
              </FancyText>
              <FancyText size='small' color={Pallete.fonts.inactive}>
                Informe seu e-mail para receber as instruções de recuperação.
              </FancyText>
            </View>

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
              icon={{ library: 'Feather', name: 'send', size: 16 }}
            />
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButtonRow: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  centerGroup: {
    gap: 14,
  },
  headerGroup: {
    gap: 2,
  },
});
