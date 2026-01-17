import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioEscalasLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Escalas', headerRight: () => <MainHeaderButtons /> }} />
      <Stack.Screen
        name='assistant'
        options={{
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Assistente de Escalas',
        }}
      />

      <Stack.Screen
        name='details'
        options={{
          headerShadowVisible: false,
          header: (props) => null,
          title: 'Detalhes da Escala',
        }}
      />
    </Stack>
  );
}
