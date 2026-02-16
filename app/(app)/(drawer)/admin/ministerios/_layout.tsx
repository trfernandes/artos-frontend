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
      <Stack.Screen name='index' options={{ title: 'Ministérios', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name='add'
        options={{ title: 'Novo Ministério', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
      <Stack.Screen
        name='edit'
        options={{ title: 'Editar Ministério', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
    </Stack>
  );
}
