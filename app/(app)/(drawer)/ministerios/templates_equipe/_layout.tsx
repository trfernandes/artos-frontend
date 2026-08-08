import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioTemplateEquipeLayout() {
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
          title: 'Templates de Equipe',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
          headerRight: () => <MainHeaderButtons />,
        }}
      />
      <Stack.Screen
        name='add'
        options={{
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Novo Template',
        }}
      />
      <Stack.Screen
        name='edit'
        options={{
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Editar Template',
        }}
      />
    </Stack>
  );
}
