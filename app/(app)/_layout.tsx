import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ClickOutsideProvider } from 'react-native-click-outside';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../utils/toast_config';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LogBox } from 'react-native';
LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Montserrat-Black': require('../../assets/fonts/montserrat/Montserrat-Black.ttf'),
    'Montserrat-BlackItalic': require('../../assets/fonts/montserrat/Montserrat-BlackItalic.ttf'),
    'Montserrat-Bold': require('../../assets/fonts/montserrat/Montserrat-Bold.ttf'),
    'Montserrat-BoldItalic': require('../../assets/fonts/montserrat/Montserrat-BoldItalic.ttf'),
    'Montserrat-ExtraBold': require('../../assets/fonts/montserrat/Montserrat-ExtraBold.ttf'),
    'Montserrat-ExtraBoldItalic': require('../../assets/fonts/montserrat/Montserrat-ExtraBoldItalic.ttf'),
    'Montserrat-ExtraLight': require('../../assets/fonts/montserrat/Montserrat-ExtraLight.ttf'),
    'Montserrat-ExtraLightItalic': require('../../assets/fonts/montserrat/Montserrat-ExtraLightItalic.ttf'),
    'Montserrat-Italic': require('../../assets/fonts/montserrat/Montserrat-Italic.ttf'),
    'Montserrat-Light': require('../../assets/fonts/montserrat/Montserrat-Light.ttf'),
    'Montserrat-LightItalic': require('../../assets/fonts/montserrat/Montserrat-LightItalic.ttf'),
    'Montserrat-Medium': require('../../assets/fonts/montserrat/Montserrat-Medium.ttf'),
    'Montserrat-MediumItalic': require('../../assets/fonts/montserrat/Montserrat-MediumItalic.ttf'),
    'Montserrat-Regular': require('../../assets/fonts/montserrat/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('../../assets/fonts/montserrat/Montserrat-SemiBold.ttf'),
    'Montserrat-SemiBoldItalic': require('../../assets/fonts/montserrat/Montserrat-SemiBoldItalic.ttf'),
    'Montserrat-Thin': require('../../assets/fonts/montserrat/Montserrat-Thin.ttf'),
    'Montserrat-ThinItalic': require('../../assets/fonts/montserrat/Montserrat-ThinItalic.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MenuProvider>
          <ClickOutsideProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
              <StatusBar style={'dark'} />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
              </Stack>
            </SafeAreaView>
          </ClickOutsideProvider>
        </MenuProvider>
        <Toast config={toastConfig} position="bottom" visibilityTime={3000} />
      </QueryClientProvider>
    </>
  );
}
