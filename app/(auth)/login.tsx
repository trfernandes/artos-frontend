import { StyleSheet, View } from 'react-native';
import FancyButton from '../../components/buttons/FancyButton';
import FancyCheckbox from '../../components/FancyCheckbox';
import FancyText from '../../components/FancyText';
import FancyTextInput from '../../components/fields/FancyTextInput';
import LoginBase from '../../components/pages/login/LoginBase';
import { EXTRA_SMALL_SIZE_FONT } from '../../constants/font';
import { Pallete } from '../../constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FancyPasswordInput from '../../components/fields/FancyPasswordInput';

export default function LoginIndexPage() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await signIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginBase>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <FancyText type="semiBold" color="white" style={{ fontSize: 35, lineHeight: 35 }}>
            ARTOS
          </FancyText>
        </View>
        <View style={styles.titleContainer}>
          <FancyText size={'extraLarge'} type="semiBold" color="white" style={{ fontSize: 17 }}>
            Bem-vindo de Volta!
          </FancyText>
          <FancyText size={'medium'} type="medium" color="white" style={{ fontSize: 12, lineHeight: 18 }}>
            Entre para acessar todas as funcionalidades
          </FancyText>
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.fieldsContainer}>
            <FancyTextInput label="E-mail" value={email} />
            <FancyPasswordInput label="Senha" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderWidth: 0 }}>
              <FancyCheckbox label="Lembrar-se" value={false} />
              <FancyButton
                type="text"
                label="Esqueceu sua senha?"
                onPress={() => router.push('forgot-password')}
                labelStyle={{ fontSize: EXTRA_SMALL_SIZE_FONT }}
                containerStyle={{ borderWidth: 0, height: 30, alignItems: 'center' }}
              />
            </View>
            <FancyButton label={loading ? 'Entrando...' : 'Logar'} onPress={handleLogin} disabled={loading} />
            <View style={{ flexDirection: 'row', borderWidth: 0, alignItems: 'center', gap: 5, paddingTop: 5 }}>
              <FancyText size={'extraSmall'}>Não tem uma conta ainda?</FancyText>
              <FancyButton
                type="text"
                label="Cadastre-se"
                onPress={() => router.push('create-account')}
                labelStyle={{ borderWidth: 0, lineHeight: 14 }}
                containerStyle={{ borderWidth: 0, height: 20, alignItems: 'center' }}
              />
            </View>
          </View>
        </View>
        <View style={styles.bottomSpacer} />
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
    gap: 25,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: DESIGN_MODE,
    borderColor: 'forestgreen',
  },
  titleContainer: {
    flex: 0,
    borderWidth: DESIGN_MODE,
    borderColor: 'magenta',
    justifyContent: 'center',
  },
  centerContainer: { flex: 3, borderWidth: DESIGN_MODE, borderColor: 'chocolate' },
  fieldsContainer: {
    borderWidth: DESIGN_MODE,
    borderRadius: 15,
    borderColor: 'firebrick',
    padding: 25,
    gap: 15,
    backgroundColor: Pallete.backgroundColor,
    ...Pallete.shadows[200],
  },
  bottomSpacer: { flex: 1, borderWidth: DESIGN_MODE, borderColor: 'deepskyblue' },
});
