import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioConfiguracoesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Configurações do Louvor',
          headerRight: () => <MainHeaderButtons />,
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
        }}
      />
    </Stack>
  );
}
