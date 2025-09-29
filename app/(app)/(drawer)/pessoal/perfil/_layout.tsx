import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';

export default function PerfilLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Meu Perfil' }} />
      <Stack.Screen
        name="edit"
        options={{ title: 'Editar Perfil', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
    </Stack>
  );
}
