import { Stack } from 'expo-router';
import FancyHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioTemplateEquipeLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Templates de Equipe', headerRight: () => <MainHeaderButtons /> }}
      />
      <Stack.Screen
        name="add"
        options={{
          header: props => <FancyHeader leftButton="back" {...props} />,
          title: 'Novo Template',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          header: props => <FancyHeader leftButton="back" {...props} />,
          title: 'Editar Template',
        }}
      />
    </Stack>
  );
}
