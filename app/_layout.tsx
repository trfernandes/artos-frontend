import { SplashScreen, Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { toastConfig } from '../utils/toast_config';
import { FancyAlertConnector, FancyAlertProvider } from '../components/modal/FancyAlert';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { loading } = useAuth();

  // Carregar fontes
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

  if (!fontsLoaded || loading) {
    return null;
  }

  SplashScreen.hideAsync();

  return (
    <FancyAlertProvider>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <Toast config={toastConfig} position="bottom" visibilityTime={4000} />
      <FancyAlertConnector />
    </FancyAlertProvider>
  );
}
