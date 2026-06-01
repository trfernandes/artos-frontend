import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Quando usuário está logado, NÃO navegamos daqui (evita race condition
  // com useProtectedRoute no root layout, que é a única fonte de verdade
  // do redirect pós-login — incluindo checagem de convite pendente).
  // Renderiza null para não exibir as telas de auth durante a transição.
  if (user) return null;

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
      <Stack.Screen name='welcome' />
    </Stack>
  );
}
