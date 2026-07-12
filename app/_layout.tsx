import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Asset } from 'expo-asset';
import { SplashScreen, Stack } from 'expo-router';
import { AppState, Modal, Platform, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { createToastConfig } from '../utils/toast_config';
import { FancyAlertConnector, FancyAlertProvider } from '../components/modal/FancyAlert';
import { useEffect, useMemo, useRef, useState } from 'react';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { NotificationsManager } from '../components/Notification_manager';
import { AppReviewManager } from '../components/AppReviewManager';
import * as Sentry from '@sentry/react-native';
import { ConnectivityProvider } from '../core/network/connectivity/ConnectivityProvider';
import { createQueryClient } from '../core/react-query/queryClient';
import { ConnectivityBanner } from '../components/FancyConnectivityBanner';
import FancyLoading from '../components/FancyLoading';
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { GlobalErrorBoundary } from '../components/debug/GlobalErrorBoundary';
import AppSplashOverlay from '../components/AppSplashOverlay';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    sendDefaultPii: process.env.EXPO_PUBLIC_SENTRY_SEND_DEFAULT_PII === '1',
    enableLogs: __DEV__,
    replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration()],
  });
}

SplashScreen.preventAutoHideAsync();

const splashImageReady = Asset.fromModule(
  require('../assets/images/splash-icon.png'),
).downloadAsync();

// No Android, depois de hideAsync() o shim de compatibilidade do
// expo-splash-screen ainda reconstrói (e depois remove) uma 2ª SplashScreenView
// própria dentro do processo do app — medido via logcat entre ~500ms e ~950ms
// depois da Activity ficar "Displayed", renderizando com fundo incorreto nesse
// intervalo. Mantemos o overlay (cor sempre correta) por um tempo mínimo a
// partir da confirmação de que o hideAsync() nativo realmente resolveu — e não
// a partir do module-load do JS — porque em cold starts lentos (throttling do
// Android) essa reconstrução nativa atrasa na mesma proporção; ancorar num
// timestamp fixo cedo demais deixaria o buffer curto demais exatamente nos
// cold starts mais lentos, que são os que mais precisam dele.
const MIN_SPLASH_VISIBLE_MS = 1400;

// Rede de segurança: se por qualquer motivo `onReady` (fonts+auth) ou
// `onNativeSplashHidden` (SplashScreen.hideAsync()) nunca disparar — ex.: uma
// promise que não resolve nem rejeita num device/cold start específico — a
// splash JS não pode ficar presa pra sempre. Esse teto garante que o app
// sempre destrava, mesmo que o timing "ideal" acima falhe.
const MAX_SPLASH_VISIBLE_MS = 4000;

export default Sentry.wrap(function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());
  const [splashVisible, setSplashVisible] = useState(true);
  const readyAtRef = useRef<number | null>(null);
  const nativeHiddenAtRef = useRef<number | null>(null);

  const scheduleHide = () => {
    if (readyAtRef.current == null || nativeHiddenAtRef.current == null) return;
    const anchor = Math.max(readyAtRef.current, nativeHiddenAtRef.current);
    const remaining = MIN_SPLASH_VISIBLE_MS - (Date.now() - anchor);
    if (remaining <= 0) {
      setSplashVisible(false);
    } else {
      setTimeout(() => setSplashVisible(false), remaining);
    }
  };

  const handleReady = () => {
    readyAtRef.current = Date.now();
    scheduleHide();
  };

  const handleNativeSplashHidden = () => {
    nativeHiddenAtRef.current = Date.now();
    scheduleHide();
  };

  useEffect(() => {
    const safetyTimer = setTimeout(() => setSplashVisible(false), MAX_SPLASH_VISIBLE_MS);
    return () => clearTimeout(safetyTimer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <ThemeProvider>
            <GlobalErrorBoundary>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <ConnectivityProvider>
                    <RootLayoutNav
                      onReady={handleReady}
                      onNativeSplashHidden={handleNativeSplashHidden}
                    />
                  </ConnectivityProvider>
                </AuthProvider>
              </QueryClientProvider>
            </GlobalErrorBoundary>
          </ThemeProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
      <AppSplashOverlay visible={splashVisible} />
    </GestureHandlerRootView>
  );
});

function RootLayoutNav({
  onReady,
  onNativeSplashHidden,
}: {
  onReady: () => void;
  onNativeSplashHidden: () => void;
}) {
  useProtectedRoute();

  const { user, loading, isSigningOut } = useAuth();
  const { isDark, palette } = useAppTheme();
  const statusBarStyle: 'light' | 'dark' = isDark ? 'light' : 'dark';
  const safeAreaBackgroundColor = palette.backgroundColor;
  const toastConfig = useMemo(() => createToastConfig(palette), [palette]);

  const [fontsLoaded] = useFonts({
    MontserratBlack: require('../assets/fonts/montserrat/Montserrat-Black.ttf'),
    MontserratBlackItalic: require('../assets/fonts/montserrat/Montserrat-BlackItalic.ttf'),
    MontserratBold: require('../assets/fonts/montserrat/Montserrat-Bold.ttf'),
    MontserratBoldItalic: require('../assets/fonts/montserrat/Montserrat-BoldItalic.ttf'),
    MontserratExtraBold: require('../assets/fonts/montserrat/Montserrat-ExtraBold.ttf'),
    MontserratExtraBoldItalic: require('../assets/fonts/montserrat/Montserrat-ExtraBoldItalic.ttf'),
    MontserratExtraLight: require('../assets/fonts/montserrat/Montserrat-ExtraLight.ttf'),
    MontserratExtraLightItalic: require('../assets/fonts/montserrat/Montserrat-ExtraLightItalic.ttf'),
    MontserratItalic: require('../assets/fonts/montserrat/Montserrat-Italic.ttf'),
    MontserratLight: require('../assets/fonts/montserrat/Montserrat-Light.ttf'),
    MontserratLightItalic: require('../assets/fonts/montserrat/Montserrat-LightItalic.ttf'),
    MontserratMedium: require('../assets/fonts/montserrat/Montserrat-Medium.ttf'),
    MontserratMediumItalic: require('../assets/fonts/montserrat/Montserrat-MediumItalic.ttf'),
    MontserratRegular: require('../assets/fonts/montserrat/Montserrat-Regular.ttf'),
    MontserratSemiBold: require('../assets/fonts/montserrat/Montserrat-SemiBold.ttf'),
    MontserratSemiBoldItalic: require('../assets/fonts/montserrat/Montserrat-SemiBoldItalic.ttf'),
    MontserratThin: require('../assets/fonts/montserrat/Montserrat-Thin.ttf'),
    MontserratThinItalic: require('../assets/fonts/montserrat/Montserrat-ThinItalic.ttf'),
  });

  // esconder a splash nativa assim que possível — o AppSplashOverlay já cobre
  // a tela com fundo sólido (View com backgroundColor) desde o primeiro render,
  // independente do Image terminar de decodificar. Atrasar hideAsync() aqui dá
  // tempo pro shim de compatibilidade do expo-splash-screen recriar sua própria
  // SplashScreenView (visível no logcat como uma 2ª "SplashScreenView" já dentro
  // do processo do app, construída ~3s depois da Activity ficar "Displayed"),
  // que renderiza com fundo branco e causa o flash antes do app aparecer.
  useEffect(() => {
    SplashScreen.hideAsync().finally(() => onNativeSplashHidden());
  }, []);

  useEffect(() => {
    if (fontsLoaded && !loading) onReady();
  }, [fontsLoaded, loading]);

  // registrar notificações quando logar
  useEffect(() => {
    if (user?.user?.id) {
      registerForPushNotificationsAsync(user.user.id).catch((error) => {
        if (__DEV__) {
          console.log('[Notifications] Registro de push ignorado:', error);
        }
      });
    }
  }, [user?.user?.id]);

  // re-verificar token ao voltar para o foreground (token pode ter rotacionado)
  useEffect(() => {
    if (!user?.user?.id) return;
    const voluntarioId = user.user.id;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        registerForPushNotificationsAsync(voluntarioId).catch(() => {});
      }
    });

    return () => subscription.remove();
  }, [user?.user?.id]);

  // sincroniza barra de navegação Android (3 botões) com o tema atual
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;

    (async () => {
      try {
        const NavigationBar = await import('expo-navigation-bar');
        if (cancelled) return;

        await NavigationBar.setBackgroundColorAsync(palette.backgroundColor);
        await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      } catch (error) {
        if (__DEV__) {
          console.warn(
            'expo-navigation-bar indisponivel nesta build. Reinstale o app dev client.',
            error,
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isDark, palette.backgroundColor]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <FancyAlertProvider>
      <View style={styles.rootContainer}>
        <NotificationsManager />
        {user && <AppReviewManager />}
        <StatusBar backgroundColor='transparent' style={statusBarStyle} translucent />
        <SafeAreaView
          style={[styles.navigationContainer, { backgroundColor: safeAreaBackgroundColor }]}
          edges={['bottom']}
        >
          <Stack screenOptions={{ contentStyle: { backgroundColor: palette.backgroundColor } }}>
            <Stack.Screen name='(app)' options={{ headerShown: false }} />
            <Stack.Screen name='(auth)' options={{ headerShown: false }} />
            <Stack.Screen name='(public)' options={{ headerShown: false }} />
          </Stack>
        </SafeAreaView>
        <Toast config={toastConfig} position='bottom' visibilityTime={4000} />
        <FancyAlertConnector />
        <ConnectivityBanner />
        <Modal visible={isSigningOut} transparent animationType='fade'>
          <View style={styles.signOutOverlay}>
            <View
              style={[
                styles.signOutSurface,
                palette.shadows[200],
                { backgroundColor: palette.backgroundColor4 },
              ]}
            >
              <FancyLoading label='Saindo...' containerStyle={styles.signOutLoading} />
            </View>
          </View>
        </Modal>
      </View>
    </FancyAlertProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  navigationContainer: {
    flex: 1,
  },
  authBackgroundExpanded: {
    top: 0,
    left: 0,
    right: -360,
    bottom: 0,
    borderRadius: 0,
  },
  signOutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutSurface: {
    borderRadius: 18,
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignSelf: 'center',
  },
  signOutLoading: {
    flex: 0,
    minHeight: 80,
    backgroundColor: 'transparent',
  },
});
