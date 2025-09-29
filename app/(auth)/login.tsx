import { StyleSheet, View, Keyboard } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyCheckbox from '../../components/FancyCheckbox';
import FancyText from '../../components/FancyText';
import FancyTextInput from '../../components/fields/FancyTextInput';
import LoginBase from '../../components/pages/login/LoginBase';
import { EXTRA_SMALL_SIZE_FONT } from '../../constants/font';
import { Pallete } from '../../constants/colors';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import FancyPasswordInput from '../../components/fields/FancyPasswordInput';
import { useAuth } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function LoginIndexPage() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const loadCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem('remember_email');
      const savedPassword = await AsyncStorage.getItem('remember_password');

      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await signIn(email, password);

      if (rememberMe) {
        await AsyncStorage.setItem('remember_email', email);
        await AsyncStorage.setItem('remember_password', password);
      } else {
        await AsyncStorage.removeItem('remember_email');
        await AsyncStorage.removeItem('remember_password');
      }

      router.replace('/');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível autenticar',
        text2: 'Verifique se e-mail e senha estão corretos e tente novamente. ',
      });
    } finally {
      setLoading(false);
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
        {!keyboardVisible && (
          <View style={styles.logoContainer}>
            <FancyText type="semiBold" color="white" style={{ fontSize: 35, lineHeight: 35 }}>
              ARTOS
            </FancyText>
          </View>
        )}

        <View
          style={[styles.centerContainer, keyboardVisible ? { position: 'relative', flex: 1 } : { position: 'absolute' }]}
        >
          <View style={[styles.titleContainer, keyboardVisible ? { width: '100%' } : { width: '80%' }]}>
            <FancyText size={'extraLarge'} type="semiBold" color="white" style={{ fontSize: 17 }}>
              Bem-vindo de Volta!
            </FancyText>
            <FancyText size={'medium'} type="medium" color="white" style={{ fontSize: 12, lineHeight: 18 }}>
              Entre para acessar todas as funcionalidades
            </FancyText>
          </View>
          <View style={[styles.fieldsContainer, keyboardVisible ? { width: '100%' } : { width: '80%' }]}>
            <FancyTextInput label="E-mail" value={email} inputProps={{ onChangeText: setEmail }} />
            <FancyPasswordInput label="Senha" value={password} inputProps={{ onChangeText: setPassword }} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <FancyCheckbox label="Lembrar-se" value={rememberMe} onChangeValue={setRememberMe} />
              <FancyButton
                type="text"
                label="Esqueceu sua senha?"
                onPress={() => router.push('forgot-password')}
                labelStyle={{ fontSize: EXTRA_SMALL_SIZE_FONT }}
                containerStyle={{ borderWidth: 0, height: 30, alignItems: 'center' }}
              />
            </View>

            <FancyButton label={loading ? 'Entrando...' : 'Logar'} onPress={handleLogin} disabled={loading} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 5 }}>
              <FancyText size={'extraSmall'}>Não tem uma conta ainda?</FancyText>
              <FancyButton
                type="text"
                label="Cadastre-se"
                onPress={() => router.push('create-account')}
                labelStyle={{ lineHeight: 14 }}
                containerStyle={{ height: 20, alignItems: 'center' }}
              />
            </View>
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
    paddingVertical: 20,
    justifyContent: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'blueviolet',
    gap: 25,
  },
  logoContainer: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    // alignItems: 'center',
    marginBottom: 20,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    width: '100%',
  },
  centerContainer: {
    gap: 20,
    borderWidth: DESIGN_MODE,
    borderColor: 'chocolate',
    top: 0,
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
    width: '100%',
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
});
