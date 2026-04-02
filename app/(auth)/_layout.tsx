import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Redirect href='/(app)' />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='login' />
      <Stack.Screen name='forgot-password' />
      <Stack.Screen name='create-account' />
      <Stack.Screen name='admin-discovery' />
      <Stack.Screen name='create-igreja-account' />
      <Stack.Screen name='igreja-cadastro-aguardando-email' />
      <Stack.Screen name='create-voluntario-account' />
      <Stack.Screen name='voluntario-aguardando-email' />
    </Stack>
  );
}
