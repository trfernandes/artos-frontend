import { StyleSheet, View, TextInput } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyCheckbox from '../../components/FancyCheckbox';
import FancyText from '../../components/FancyText';
import FancyTextInput from '../../components/fields/FancyTextInput';
import FancyPasswordInput from '../../components/fields/FancyPasswordInput';
import AuthScreen from '../../components/pages/login/AuthScreen';
import { EXTRA_SMALL_SIZE_FONT } from '../../constants/font';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useConnectivity } from '../../core/network/connectivity/ConnectivityProvider';
import { CadastroIgrejaRepository } from '../../domain/services/CadastroIgrejaRepository';
import { FancyAlert } from '../../components/modal/FancyAlert';

const REMEMBER_EMAIL_KEY = 'artos_remember_email';
const REMEMBER_PASSWORD_KEY = 'artos_remember_password';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginIndexPage() {
  const { signIn } = useAuth();
  const { status: connectivityStatus, isOffline } = useConnectivity();
  const isServerUnavailable = connectivityStatus !== 'ok';
  const passwordInputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const loadCredentials = async () => {
      const savedEmail = await SecureStore.getItemAsync(REMEMBER_EMAIL_KEY);
      const savedPassword = await SecureStore.getItemAsync(REMEMBER_PASSWORD_KEY);

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Informe o e-mail');
      isValid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('E-mail invalido');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Informe a senha');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleNetworkError = () => {
    FancyAlert.alert('Problema de conexao', 'Nao foi possivel se conectar. Verifique sua internet e tente novamente.', [
      { text: 'Cancelar', style: 'default' },
      { text: 'Tentar novamente', onPress: () => handleLogin() },
    ]);
  };

  const handleCadastroPendente = async (error: AxiosError | any, fallbackEmail: string) => {
    const data = error?.response?.data;
    const payload = data?.data ?? data;
    const errorCode = data?.code || data?.error?.code || data?.errorCode || payload?.code || payload?.errorCode;
    const message = data?.message || data?.error?.message || payload?.message;

    const normalizedMessage = typeof message === 'string' ? message.toLowerCase() : '';
    const isCadastroPendente =
      errorCode === 'CADASTRO_PENDENTE' ||
      normalizedMessage.includes('cadastro_pendente') ||
      normalizedMessage.includes('cadastro pendente');

    if (!isCadastroPendente) return false;

    const cadastroId = payload?.cadastroId;
    const cadastroSecret = payload?.cadastroSecret;
    const responsavelEmail = payload?.responsavelEmail || fallbackEmail;

    if (cadastroId && cadastroSecret && responsavelEmail) {
      await CadastroIgrejaRepository.salvarDadosCadastro({
        cadastroId,
        cadastroSecret,
        responsavelEmail,
      });
    }

    const dadosCadastro = await CadastroIgrejaRepository.obterDadosCadastro();
    if (dadosCadastro) {
      router.replace('/(auth)/igreja-cadastro-aguardando-email');
      return true;
    }

    Toast.show({
      type: 'error',
      text1: 'Cadastro pendente',
      text2: 'Nao encontramos os dados do cadastro. Inicie o cadastro novamente.',
    });
    return true;
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!validateForm()) return;

    const trimmedEmail = email.trim();
    if (isOffline) {
      handleNetworkError();
      return;
    }

    setLoading(true);

    try {
      await signIn(trimmedEmail, password);

      try {
        if (rememberMe) {
          await SecureStore.setItemAsync(REMEMBER_EMAIL_KEY, trimmedEmail);
          await SecureStore.setItemAsync(REMEMBER_PASSWORD_KEY, password);
        } else {
          await SecureStore.deleteItemAsync(REMEMBER_EMAIL_KEY);
          await SecureStore.deleteItemAsync(REMEMBER_PASSWORD_KEY);
        }
      } catch (secureStoreError: any) {
        console.error('Erro ao salvar credenciais no SecureStore:', secureStoreError);
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar credenciais',
          text2: `Não foi possível salvar o e-mail e senha localmente. ${secureStoreError?.message || JSON.stringify(secureStoreError)}`,
        });
      }

      router.replace('/');
    } catch (error: any) {
      if (await handleCadastroPendente(error, trimmedEmail)) return;

      const status = error?.response?.status;
      const data = error?.response?.data;
      const backendMessage: string = (data?.message || data?.error?.message || '').toLowerCase();

      if (status === 401) {
        if (backendMessage.includes('não verificado') || backendMessage.includes('nao verificado')) {
          Toast.show({
            type: 'info',
            text1: 'E-mail não verificado',
            text2: 'Verifique seu e-mail para ativar sua conta.',
          });
        } else if (backendMessage.includes('desativada') || backendMessage.includes('desativado')) {
          Toast.show({
            type: 'error',
            text1: 'Conta desativada',
            text2: 'Sua conta foi desativada. Entre em contato com o suporte.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Credenciais inválidas',
            text2: 'E-mail ou senha incorretos.',
          });
        }
        return;
      }

      const isNetworkError =
        !error?.response ||
        error?.code === 'ECONNABORTED' ||
        `${error?.message || ''}`.toLowerCase().includes('timeout') ||
        `${error?.message || ''}`.toLowerCase().includes('network');

      if (isNetworkError || isOffline) {
        handleNetworkError();
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Nao foi possivel autenticar',
        text2: 'Verifique se e-mail e senha estao corretos e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      scrollContainerStyle={styles.scrollContainer}
      centerContainerStyle={styles.centerContainer}
      headerContainerStyle={styles.titleContainer}
      headerWidth={{ default: '85%', keyboard: '110%' }}
      contentWidth={{ default: '85%', keyboard: '110%' }}
      fieldsContainerStyle={styles.fieldsContainer}
      topContent={({ keyboardVisible }) =>
        !keyboardVisible ? (
          <View style={styles.logoContainer}>
            <FancyText type='semiBold' color='white' style={{ fontSize: 35, lineHeight: 35 }}>
              ARTOS
            </FancyText>
          </View>
        ) : null
      }
      header={() => (
        <View style={{ gap: 0 }}>
          <FancyText size={'extraLarge'} type='semiBold' color='white' style={{ fontSize: 17 }}>
            Bem-vindo de volta!
          </FancyText>
          <FancyText size={'medium'} type='medium' color='white' style={{ fontSize: 12 }}>
            Entre para acessar todas as funcionalidades
          </FancyText>
        </View>
      )}
    >
      <>
        <FancyTextInput
          label='E-mail'
          value={email}
          errorMessage={emailError}
          inputProps={{
            onChangeText: (value) => {
              setEmail(value);
              if (emailError) setEmailError('');
            },
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoCorrect: false,
            returnKeyType: 'next',
            textContentType: 'emailAddress',
            autoComplete: 'email',
            importantForAutofill: 'yes',
            blurOnSubmit: false,
            onSubmitEditing: () => passwordInputRef.current?.focus(),
            accessibilityLabel: 'E-mail',
          }}
          readonly={loading}
          disabled={loading}
        />
        <FancyPasswordInput
          label='Senha'
          value={password}
          errorMessage={passwordError}
          inputRef={passwordInputRef}
          inputProps={{
            onChangeText: (value) => {
              setPassword(value);
              if (passwordError) setPasswordError('');
            },
            returnKeyType: 'go',
            textContentType: 'password',
            autoComplete: 'password',
            autoCapitalize: 'none',
            autoCorrect: false,
            importantForAutofill: 'yes',
            onSubmitEditing: () => handleLogin(),
            accessibilityLabel: 'Senha',
          }}
          readonly={loading}
          disabled={loading}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <FancyCheckbox label='Lembrar-se' value={rememberMe} onChangeValue={setRememberMe} disabled={loading} />
          <FancyButton
            type='text'
            label='Esqueceu sua senha?'
            onPress={() => router.push('/(auth)/forgot-password')}
            labelStyle={{ fontSize: EXTRA_SMALL_SIZE_FONT }}
            containerStyle={{ borderWidth: 0, height: 30, alignItems: 'center' }}
            disabled={loading}
          />
        </View>

        <FancyButton label={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} disabled={loading || isServerUnavailable} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 5 }}>
          <FancyText size={'extraSmall'} style={{ borderWidth: 0 }}>
            Não tem uma conta ainda?
          </FancyText>
          <FancyButton
            type='text'
            label='Cadastre-se'
            onPress={() => router.push('/(auth)/create-account')}
            labelStyle={{ lineHeight: 14 }}
            containerStyle={{
              paddingHorizontal: 0,
              height: 20,
              alignItems: 'center',
              borderWidth: 0,
            }}
            disabled={loading}
          />
        </View>
      </>
    </AuthScreen>
  );
}

const DESIGN_MODE = 0;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 40,
    paddingVertical: 20,
    justifyContent: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'blueviolet',
    paddingBottom: 40,
    gap: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    gap: 2,
    marginBottom: 14,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
  },
  centerContainer: {
    gap: 6,
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldsContainer: {
    borderWidth: DESIGN_MODE,
    borderRadius: 15,
    borderColor: 'firebrick',
    padding: 25,
    gap: 15,
  },
});
