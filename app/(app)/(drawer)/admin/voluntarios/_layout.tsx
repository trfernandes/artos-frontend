import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import NotificationButton from '../../../../../components/header/NotificationButton';

export default function VoluntariosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{ title: 'Voluntários', headerRight: () => <NotificationButton /> }}
      />
      <Stack.Screen
        name='details'
        options={{ title: 'Detalhes', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
    </Stack>
  );
}
