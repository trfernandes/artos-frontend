import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisteriosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Eventos', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name='add'
        options={{ title: 'Novo Evento', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
      <Stack.Screen
        name='edit'
        options={{ title: 'Editar Evento', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
    </Stack>
  );
}
