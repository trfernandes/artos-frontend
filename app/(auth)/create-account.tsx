import { StyleSheet, View } from 'react-native';
import LoginBase from '../../components/pages/login/LoginBase';
import FancyButton from '../../components/buttons/FancyButton';
import FancyText from '../../components/FancyText';
import { Pallete } from '../../constants/colors';
import { DefaultIconsNames } from '../../constants/icons';
import { router } from 'expo-router';
import { createAccountSchema, useVoluntarios } from '../../hooks/useVoluntarios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '../../components/forms/ControlledTextInput';
import ControlledPasswordInput from '../../components/forms/ControlledPasswordInput';
import { strfyObj } from '../../utils/text_utils';
import { AxiosError } from 'axios';
import Toast from 'react-native-toast-message';

export default function CreateAccountPage() {
  const { add, isLoadingMutation } = useVoluntarios();

  const createForm = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmarSenha: '' }, // importante
  });

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
        console.error('Erro ao criar conta:', strfyObj(error));
        return;
      }
      router.replace('/login');
    } catch (error) {
      console.error(error);
    }
  });

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
            <FancyText size="extraLarge" type="semiBold" color="white" style={{ fontSize: 17 }}>
              Criação de Conta
            </FancyText>
            <FancyText size="medium" type="medium" color="white" style={{ fontSize: 12, lineHeight: 18 }}>
              Crie uma conta e aproveite todas as funcionalidades
            </FancyText>
          </View>

          <View style={styles.centerContainer}>
            <View style={styles.fieldsContainer}>
              <ControlledTextInput label="Nome" name="nome" control={createForm.control} />
              <ControlledTextInput label="E-mail" name="email" control={createForm.control} inputProps={{ autoCapitalize: 'none' }} />
              <ControlledPasswordInput label="Senha" name="senha" control={createForm.control} inputProps={{ secureTextEntry: true }} />
              <ControlledPasswordInput
                label="Confirmar a Senha"
                name="confirmarSenha"
                control={createForm.control}
                inputProps={{ secureTextEntry: true }}
              />
              <FancyButton label={isLoadingMutation ? 'Criando...' : 'Criar'} onPress={handleSubmit} disabled={isLoadingMutation} />
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
  topContainer: { flex: 1, gap: 30, justifyContent: 'center' },
  centerContainer: {
    flex: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
    justifyContent: 'center',
  },
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
    gap: 15,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
});
