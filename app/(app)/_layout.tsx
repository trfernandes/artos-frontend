import { StatusBar } from 'expo-status-bar';
import { ClickOutsideProvider } from 'react-native-click-outside';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingProvider } from '../../contexts/LoadingContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FancyHeader from '../../components/header/FancyHeader';

// export const log = logger.createLogger({
//   levels: {
//     debug: 0,
//     info: 1,
//     warn: 2,
//     error: 3,
//   },
//   severity: 'debug',
//   transport: consoleTransport,
//   transportOptions: {
//     colors: {
//       info: 'blueBright',
//       warn: 'yellowBright',
//       error: 'redBright',
//     },
//   },
//   async: true,
//   dateFormat: 'time',
//   printLevel: true,
//   printDate: true,
//   fixedExtLvlLength: false,
//   enabled: true,
// });

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MenuProvider>
          <ClickOutsideProvider>
            <SafeAreaView style={{ flex: 1, paddingTop: 5, backgroundColor: 'white' }}>
              <StatusBar style={'dark'} />
              <LoadingProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="notifications"
                    options={{
                      headerShown: true,
                      header: headerParams => (
                        <FancyHeader
                          leftButton={'back'}
                          {...headerParams}
                          options={{
                            title: 'Notificações',
                            headerRight: options => headerParams.options.headerRight?.(options),
                          }}
                        />
                      ),
                    }}
                  />
                </Stack>
              </LoadingProvider>
            </SafeAreaView>
          </ClickOutsideProvider>
        </MenuProvider>
      </GestureHandlerRootView>
    </>
  );
}
