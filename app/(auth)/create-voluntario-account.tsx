import { StyleSheet } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { Pallete } from '../../constants/colors';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import FancyVerticalSpacer from '../../components/FancyVerticalSpacer';
import { useVoluntariosCrud } from '../../hooks/useVoluntariosCrud';
import { createAccountSchema } from '../../domain/schemas/voluntarioSchema';
import { EXTRA_LARGE_SIZE_FONT } from '../../constants/font';

export default function CreateVoluntarioAccountPage() {
  const { add, isLoadingMutation } = useVoluntariosCrud({ autoFetch: false, initialParams: null });

  const createForm = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' },
  });

  const handleSubmit = createForm.handleSubmit(async (data) => {
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
          text1: 'Nao foi possivel criar a conta',
          text2: error?.response?.data?.message || 'Ocorreu um erro ao criar a conta. Tente novamente mais tarde.',
        });
        return;
      }
      router.replace('/login');
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <AuthScreen
      showBackButton
      scrollContainerStyle={styles.scrollContainer}
      headerContainerStyle={styles.titleContainer}
      headerWidth={{ default: '85%', keyboard: '100%' }}
      contentWidth={{ default: '85%', keyboard: '110%' }}
      paddingTopOnKeyboard={60}
      fieldsContainerStyle={styles.fieldsContainer}
      header={({ keyboardVisible }) => (
        <>
          <FancyText size={!keyboardVisible ? 'extraLarge' : 'large'} type='bold' color='white' style={{ lineHeight: EXTRA_LARGE_SIZE_FONT * 1.2 }}>
            Criação de Conta
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
            Crie uma conta e aproveite todas as funcionalidades
          </FancyText>
        </>
      )}
    >
      <>
        <ControlledTextInput label='Nome' name='nome' control={createForm.control} />
        <ControlledTextInput label='E-mail' name='email' control={createForm.control} inputProps={{ autoCapitalize: 'none' }} />
        <ControlledPasswordInput label='Senha' name='senha' control={createForm.control} inputProps={{ secureTextEntry: true }} />
        <ControlledPasswordInput
          label='Confirmar a Senha'
          name='confirmarSenha'
          control={createForm.control}
          inputProps={{ secureTextEntry: true }}
        />
        <FancyVerticalSpacer height={1} />
        <FancyButton
          label={isLoadingMutation ? 'Confirmando...' : 'Confirmar'}
          onPress={handleSubmit}
          disabled={isLoadingMutation}
          icon={{ library: 'Feather', name: 'check', size: 16 }}
        />
      </>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingVertical: 0,
    justifyContent: 'center',
    borderColor: 'red',
  },
  titleContainer: {
    gap: 6,
    borderColor: 'magenta',
    justifyContent: 'center',
  },
  fieldsContainer: {
    borderRadius: 15,
    borderColor: 'firebrick',
    padding: 25,
    gap: 10,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
});
