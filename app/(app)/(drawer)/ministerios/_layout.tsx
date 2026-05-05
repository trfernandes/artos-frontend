import { Stack } from 'expo-router';

export default function MinisteriosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name='configuracoes' />
      <Stack.Screen name='escalas' />
      <Stack.Screen name='integrantes' />
      <Stack.Screen name='louvor/repertorio' />
      <Stack.Screen name='solicitacoes' />
      <Stack.Screen name='templates_equipe' />
    </Stack>
  );
}
