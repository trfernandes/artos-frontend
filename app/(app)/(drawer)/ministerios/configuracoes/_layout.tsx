import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioConfiguracoesLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Configurações do Louvor',
          headerRight: () => <MainHeaderButtons />,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
    </Stack>
  );
}
