import { StatusBar } from 'expo-status-bar';
import { ClickOutsideProvider } from 'react-native-click-outside';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingProvider } from '../../contexts/LoadingContext';

export default function RootLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <MenuProvider>
        <ClickOutsideProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar style={'dark'} />
            <LoadingProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
              </Stack>
            </LoadingProvider>
          </SafeAreaView>
        </ClickOutsideProvider>
      </MenuProvider>
    </>
  );
}
