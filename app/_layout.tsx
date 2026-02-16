import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, Stack, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../utils/toast_config';
import { FancyAlertConnector, FancyAlertProvider } from '../components/modal/FancyAlert';
import { useEffect, useState } from 'react';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { NotificationsManager } from '../components/Notification_manager';
import { AppReviewManager } from '../components/AppReviewManager';
import * as Sentry from '@sentry/react-native';
import { ConnectivityProvider } from '../core/network/connectivity/ConnectivityProvider';
import { createQueryClient } from '../core/react-query/queryClient';
import { ConnectivityBanner } from '../components/FancyConnectivityBanner';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Pallete } from '../constants/colors';

Sentry.init({
  dsn: 'https://b65799084d172913463973ef37b937b0@o4510567624409088.ingest.us.sentry.io/4510567678279680',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  console.log('App started');
  const [queryClient] = useState(() => createQueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ConnectivityProvider>
              <RootLayoutNav />
            </ConnectivityProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
});

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const isAuthRoute = segments[0] === '(auth)';
  const statusBarStyle: 'light' | 'dark' = isAuthRoute ? 'light' : 'dark';
  const safeAreaBackgroundColor = isAuthRoute ? '#FFFFFF' : Pallete.backgroundColor;

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
      registerForPushNotificationsAsync(user.user.id);
    }
  }, [user?.user?.id]);

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
});
