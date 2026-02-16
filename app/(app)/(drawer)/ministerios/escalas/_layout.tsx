import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioEscalasLayout() {
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
          title: 'Escalas',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
          headerRight: () => <MainHeaderButtons />,
        }}
      />
      <Stack.Screen
        name='assistant'
        options={{
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Assistente de Escalas',
        }}
      />
      <Stack.Screen
        name='details'
        options={{
          headerShadowVisible: false,
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
          title: 'Detalhes da Escala',
        }}
      />
    </Stack>
  );
}
