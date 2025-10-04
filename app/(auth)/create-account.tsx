import { Keyboard, StyleSheet, View } from 'react-native';
import LoginBase from '../../components/pages/login/LoginBase';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import { Pallete } from '../../constants/colors';
import { router } from 'expo-router';
import { createAccountSchema, useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import { strfyObj } from '../../utils/text_utils';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useEffect, useState } from 'react';
import FancyVerticalSpacer from '../../components/FancyVerticalSpacer';
import { DefaultIconsNames } from '../../constants/icons';

export default function CreateAccountPage() {
  const { add, isLoadingMutation } = useVoluntariosCrud();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const createForm = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSubmit = createForm.handleSubmit(async data => {
    try {
      try {
        await add({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
        } as any);
      } catch (error: AxiosError | any) {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível criar a conta',
          text2: error?.response?.data?.message || 'Ocorreu um erro ao criar a conta. Tente novamente mais tarde.',
        });
        console.log('Erro ao criar conta:', strfyObj(error));
        return;
      }
      router.replace('/login');
    } catch (error) {
      console.log(error);
    }
  });

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
          <View style={[styles.titleContainer, keyboardVisible ? { width: '100%', gap: 2 } : { width: '80%', gap: 3 }]}>
            <FancyText size={!keyboardVisible ? 'extraLarge' : 'large'} type="bold" color="white">
              Criação de Conta
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
              Crie uma conta e aproveite todas as funcionalidades
            </FancyText>
          </View>

          <View style={[styles.fieldsContainer, keyboardVisible ? { width: '100%' } : { width: '80%' }]}>
            <ControlledTextInput label="Nome" name="nome" control={createForm.control} />
            <ControlledTextInput
              label="E-mail"
              name="email"
              control={createForm.control}
              inputProps={{ autoCapitalize: 'none' }}
            />
            <ControlledPasswordInput
              label="Senha"
              name="senha"
              control={createForm.control}
              inputProps={{ secureTextEntry: true }}
            />
            <ControlledPasswordInput
              label="Confirmar a Senha"
              name="confirmarSenha"
              control={createForm.control}
              inputProps={{ secureTextEntry: true }}
            />
            <FancyVerticalSpacer height={1} />
            <FancyButton
              label={isLoadingMutation ? 'Confirmando...' : 'Confirmar'}
              onPress={handleSubmit}
              disabled={isLoadingMutation}
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
    justifyContent: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'red',
  },
  logoContainer: {
    position: 'absolute',
    left: 40,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    gap: 6,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    justifyContent: 'center',
  },
  fieldsContainer: {
    borderWidth: DESIGN_MODE,
    borderRadius: 15,
    borderColor: 'firebrick',
    padding: 25,
    gap: 10,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
  backButtonContainer: {
    position: 'absolute',
    left: 40,
    top: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  topContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'deepskyblue',
  },
});
