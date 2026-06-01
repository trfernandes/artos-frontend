import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import FancyText from '../../components/FancyText';
import FancyButton from '../../components/buttons/FancyButton';
import DefaultIcons from '../../components/FancyIcons';
import { ThemePalette } from '../../constants/colors';
import { ColorUtils } from '../../utils/color_utils';
import { usePallete } from '../../hooks/usePallete';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAuth } from '../../contexts/AuthContext';
import {
  clearPendingWelcomeAuth,
  getPendingWelcomeAuth,
} from '../../core/auth/pendingWelcomeStore';

export default function WelcomePage() {
  const Pallete = usePallete();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { signInWithData } = useAuth();

  // Lê o authData uma única vez no mount. O store é populado pela tela de
  // aguardando-confirmação imediatamente antes da navegação.
  const [authData] = useState(() => getPendingWelcomeAuth());
  const [isEntrando, setIsEntrando] = useState(false);

  const nomeIgreja = authData?.igrejas?.[0]?.nome;

  // Defensivo: sem authData (ex.: app reaberto, store expirado) não há como
  // efetivar o login — volta para a tela de login.
  useEffect(() => {
    if (!authData) {
      router.replace('/(auth)/login');
    }
  }, [authData]);

  if (!authData) {
    return null;
  }

  const handleEntrar = async () => {
    if (isEntrando) return;
    setIsEntrando(true);
    try {
      await signInWithData(authData);
      clearPendingWelcomeAuth();
      // Com user definido, (auth)/_layout e useProtectedRoute redirecionam para
      // (app); o replace explícito mantém paridade com o fluxo anterior.
      router.replace('/');
    } catch {
      clearPendingWelcomeAuth();
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: Pallete.backgroundColor }]}>
      <SafeAreaView style={styles.safe} edges={['left', 'right']}>
        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
          <View style={styles.centerGroup}>
            <View style={styles.headerGroup}>
              <FancyText
                size='large'
                type='bold'
                color={Pallete.fonts.dark}
                style={{ textAlign: 'center' }}
              >
                E-mail confirmado!
              </FancyText>
              <FancyText
                size='small'
                color={Pallete.fonts.inactive}
                style={{ textAlign: 'center' }}
              >
                {nomeIgreja ? `Bem-vindo à ${nomeIgreja}` : 'Bem-vindo à sua igreja'}
              </FancyText>
            </View>

            {/* Ícone de sucesso */}
            <View style={styles.iconContainer}>
              <DefaultIcons.Custom
                library='MaterialCommunityIcons'
                name='check-circle-outline'
                size={44}
                color={Pallete.confirm}
              />
            </View>

            <View style={styles.messageSection}>
              <FancyText
                size='small'
                color={Pallete.fonts.inactive}
                style={{ textAlign: 'center' }}
              >
                Sua conta foi ativada com sucesso. Entre no app para começar a organizar sua igreja.
              </FancyText>
            </View>

            <FancyButton
              label={isEntrando ? 'Entrando...' : 'Entrar no app'}
              type='contained'
              isLoading={isEntrando}
              loadingText='Entrando...'
              spinnerSize='small'
              icon={{ library: 'Feather', name: 'arrow-right', size: 18 }}
              containerStyle={styles.primaryButton}
              disabled={isEntrando}
              onPress={handleEntrar}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(Pallete: ThemePalette) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    safe: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    centerGroup: {
      gap: 14,
      alignItems: 'center',
    },
    headerGroup: {
      gap: 2,
      alignItems: 'center',
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: ColorUtils.withAlpha(Pallete.confirm, 0.08),
      alignItems: 'center',
      justifyContent: 'center',
    },
    messageSection: {
      alignItems: 'center',
      gap: 6,
      width: '100%',
    },
    primaryButton: {
      width: '100%',
    },
  });
}
