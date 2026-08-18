import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../../components/header/MainHeaderButtons';

export default function MinisterioLouvorRepertorioLayout() {
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
          title: 'Repertório',
          header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
          headerRight: () => <MainHeaderButtons />,
        }}
      />
      <Stack.Screen
        name='add'
        options={{
          title: 'Adicionar Música',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
      <Stack.Screen
        name='edit'
        options={{
          title: 'Editar Música',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
      <Stack.Screen
        name='musicas-tocadas'
        options={{
          title: 'Músicas tocadas',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
    </Stack>
  );
}
