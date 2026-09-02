import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../components/header/FancyHeader';

export default function MinisteriosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name='acessos/index'
        options={{
          headerShown: true,
          header: (headerParams) => (
            <FancyPageHeader
              leftButton='menu'
              {...headerParams}
              options={{
                title: 'Acessos',
              }}
            />
          ),
        }}
      />
      <Stack.Screen name='configuracoes' />
      <Stack.Screen name='escalas' />
      <Stack.Screen name='integrantes' />
      <Stack.Screen name='louvor/repertorio' />
      <Stack.Screen name='solicitacoes' />
      <Stack.Screen name='templates_equipe' />
    </Stack>
  );
}
