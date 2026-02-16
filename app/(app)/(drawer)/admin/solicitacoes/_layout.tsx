import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import NotificationButton from '../../../../../components/header/NotificationButton';

export default function SolicitacoesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Solicitações e Convites',
          headerRight: () => <NotificationButton />,
        }}
      />
    </Stack>
  );
}
