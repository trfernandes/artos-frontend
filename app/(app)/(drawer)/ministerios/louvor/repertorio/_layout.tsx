import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../../components/header/MainHeaderButtons';

export default function MinisterioLouvorRepertorioLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Repertório',

          headerRight: () => <MainHeaderButtons />,
        }}
      />
      <Stack.Screen
        name='add'
        options={{ title: 'Adicionar Música', header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
      <Stack.Screen
        name='edit'
        options={{ title: 'Editar Música', header: (props) => <FancyPageHeader leftButton='back' {...props} /> }}
      />
    </Stack>
  );
}
