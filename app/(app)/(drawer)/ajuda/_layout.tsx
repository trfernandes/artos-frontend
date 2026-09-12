import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../components/header/MainHeaderButtons';

export default function AjudaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen
        name='index'
        options={{ title: 'Ajuda', headerRight: () => <MainHeaderButtons /> }}
      />
      <Stack.Screen
        name='suporte'
        options={{
          title: 'Ajuda e suporte',
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
      <Stack.Screen
        name='suporte-form'
        options={{
          title: 'Enviar mensagem',
          header: (props) => <FancyPageHeader leftButton='back' {...props} />,
        }}
      />
    </Stack>
  );
}
