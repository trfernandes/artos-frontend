import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioIntegrantesLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Integrantes', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name='add'
        options={{
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Adicionar Integrante',
        }}
      />
      <Stack.Screen
        name='edit'
        options={{
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Editar Integrante',
        }}
      />
    </Stack>
  );
}
