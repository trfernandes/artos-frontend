import { router } from 'expo-router';
import { View, StyleSheet, Keyboard } from 'react-native';
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useState, useEffect } from 'react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe o e-mail')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'O formato inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // detectar teclado aberto/fechado
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.backButtonContainer}>
          <FancyButton
            icon={{ ...DefaultIconsNames['chevron-left'], color: Pallete.icons.dark }}
            size={30}
            onPress={() => router.back()}
            containerStyle={{ backgroundColor: Pallete.backgroundColor3 }}
          />
        </View>

        <View
          style={[
            styles.topContainer,
            keyboardVisible ? { position: 'relative', justifyContent: 'center', paddingTop: 60 } : { position: 'absolute' },
          ]}
        >
          <View style={[styles.titleContainer, keyboardVisible ? { width: '100%', gap: 4 } : { width: '80%', gap: 6 }]}>
            <FancyText size={!keyboardVisible ? 'extraLarge' : 'large'} type="bold" color="white">
              Recuperação de Senha
            </FancyText>
            <FancyText
              size={!keyboardVisible ? 'medium' : 'small'}
              type="medium"
              color="white"
              style={{
                width: '99%',
                borderWidth: 0,
              }}
            >
              Informe seu e-mail para receber as instruções de recuperação
            </FancyText>
          </View>

          <View style={[styles.fieldsContainer, keyboardVisible ? { width: '100%' } : { width: '80%' }]}>
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
      </KeyboardAwareScrollView>
    </LoginBase>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 40,
    // paddingVertical: 20,
    justifyContent: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'blueviolet',
    gap: 25,
  },
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
  topContainer: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    borderWidth: DESIGN_MODE,
    borderColor: 'deepskyblue',
  },
  centerContainer: {
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
    justifyContent: 'center',
  },
  bottomSpacer: { flex: 0, borderWidth: DESIGN_MODE, borderColor: 'deepskyblue' },
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
