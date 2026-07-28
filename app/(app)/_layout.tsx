import { ClickOutsideProvider } from 'react-native-click-outside';
import { MenuProvider } from 'react-native-popup-menu';
import { Redirect, Stack, router, useNavigationContainerRef } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FancyPageHeader from '../../components/header/FancyHeader';
import { usePostLoginRedirect } from '../../hooks/usePostLoginRedirect';
import { FancyAlert } from '../../components/modal/FancyAlert';

export default function RootLayout() {
  const { user, loading, signOut, isSigningOut } = useAuth();
  const navigationRef = useNavigationContainerRef();

  // Check for post-login redirects (pending invites, no churches)
  usePostLoginRedirect();

  if (loading) return null;

  if (!user && !isSigningOut) {
    return <Redirect href='/(auth)/login' />;
  }

  const handleJoinChurchBackPress = () => {
    // Verifica se pode voltar
    if (navigationRef?.canGoBack()) {
      router.back();
    } else {
      // Se não pode voltar (foi redirecionado automaticamente), confirma logout
      FancyAlert.alert(
        'Voltar para o login',
        'Você precisa estar vinculado a uma igreja para usar o app. Deseja voltar para o login?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Voltar para o login',
            style: 'destructive',
            onPress: () => signOut(),
          },
        ],
      );
    }
  };

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MenuProvider>
          <ClickOutsideProvider>
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
                <Stack.Screen
                  name='notification-detail'
                  options={{
                    headerShown: true,
                    header: (headerParams) => (
                      <FancyPageHeader
                        leftButton={'back'}
                        {...headerParams}
                        options={{
                          title: 'Detalhe da notificação',
                        }}
                      />
                    ),
                  }}
                />
                <Stack.Screen
                  name='join-church/index'
                  options={{
                    headerShown: true,
                    header: (headerParams) => (
                      <FancyPageHeader
                        leftButton={'back'}
                        leftButtonOnPress={handleJoinChurchBackPress}
                        {...headerParams}
                        options={{
                          title: 'Adicionar igreja',
                        }}
                      />
                    ),
                  }}
                />
                <Stack.Screen
                  name='join-church/requests'
                  options={{
                    headerShown: true,
                    header: (headerParams) => (
                      <FancyPageHeader
                        leftButton={'back'}
                        leftButtonOnPress={handleJoinChurchBackPress}
                        {...headerParams}
                        options={{
                          title: 'Minhas solicitações',
                        }}
                      />
                    ),
                  }}
                />
              </Stack>
          </ClickOutsideProvider>
        </MenuProvider>
      </GestureHandlerRootView>
    </>
  );
}
