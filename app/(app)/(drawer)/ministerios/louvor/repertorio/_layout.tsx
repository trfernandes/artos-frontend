import { Stack } from 'expo-router';
import FancyHeader from '../../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../../components/header/MainHeaderButtons';

export default function MinisterioLouvorRepertorioLayout() {
  return (
    <Stack
      screenOptions={{
        header: props => <FancyHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Repertório',

          headerRight: () => <MainHeaderButtons />,
        }}
      />
      <Stack.Screen
        name="add"
        options={{ title: 'Adicionar Música', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: 'Editar Música', header: props => <FancyHeader leftButton="back" {...props} /> }}
      />
    </Stack>
  );
}
