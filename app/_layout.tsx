import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, Stack, useSegments } from 'expo-router';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { createToastConfig } from '../utils/toast_config';
import { FancyAlertConnector, FancyAlertProvider } from '../components/modal/FancyAlert';
import { useEffect, useMemo, useState } from 'react';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { NotificationsManager } from '../components/Notification_manager';
import { AppReviewManager } from '../components/AppReviewManager';
import * as Sentry from '@sentry/react-native';
import { ConnectivityProvider } from '../core/network/connectivity/ConnectivityProvider';
import { createQueryClient } from '../core/react-query/queryClient';
import { ConnectivityBanner } from '../components/FancyConnectivityBanner';
import FancyLoading from '../components/FancyLoading';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { GlobalErrorBoundary } from '../components/debug/GlobalErrorBoundary';

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

export default Sentry.wrap(function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <GlobalErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <ConnectivityProvider>
                  <RootLayoutNav />
                </ConnectivityProvider>
              </AuthProvider>
            </QueryClientProvider>
          </GlobalErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});

function RootLayoutNav() {
  useProtectedRoute();

  const { user, loading, isSigningOut } = useAuth();
  const { isDark, palette } = useAppTheme();
  const segments = useSegments();
  const isAuthRoute = segments[0] === '(auth)';
  const statusBarStyle: 'light' | 'dark' = isAuthRoute || isDark ? 'light' : 'dark';
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

  // esconder splash quando tudo estiver pronto
  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
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
          console.warn("expo-navigation-bar indisponivel nesta build. Reinstale o app dev client.", error);
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
        <StatusBar
          backgroundColor='transparent'
          style={statusBarStyle}
          translucent
        />
        <SafeAreaView
          style={[styles.navigationContainer, { backgroundColor: safeAreaBackgroundColor }]}
          edges={['bottom']}
        >
          <Stack>
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
            <View style={[styles.signOutSurface, palette.shadows[200], { backgroundColor: palette.backgroundColor4 }]}>
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
