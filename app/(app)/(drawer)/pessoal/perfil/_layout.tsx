import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';

export default function PerfilLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Meu Perfil' }} />
      <Stack.Screen
        name='edit'
        options={{ title: 'Editar Perfil', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
    </Stack>
  );
}
