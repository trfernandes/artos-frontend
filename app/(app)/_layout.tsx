import { StatusBar } from 'expo-status-bar';
import { ClickOutsideProvider } from 'react-native-click-outside';
import { MenuProvider } from 'react-native-popup-menu';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingProvider } from '../../contexts/LoadingContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FancyPageHeader from '../../components/header/FancyHeader';

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href='/(auth)/login' />;
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MenuProvider>
          <ClickOutsideProvider>
            <StatusBar style={'dark'} />
            <LoadingProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='(drawer)' options={{ headerShown: false }} />
                <Stack.Screen
                  name='notifications'
                  options={{
                    headerShown: true,
                    header: (headerParams) => (
                      <FancyPageHeader
                        leftButton={'back'}
                        {...headerParams}
                        options={{
                          title: 'Notificações',
                          headerRight: (options) => headerParams.options.headerRight?.(options),
                        }}
                      />
                    ),
                  }}
                />
              </Stack>
            </LoadingProvider>
          </ClickOutsideProvider>
        </MenuProvider>
      </GestureHandlerRootView>
    </>
  );
}
