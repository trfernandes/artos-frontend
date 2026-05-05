import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../components/header/MainHeaderButtons';

export default function InicioLayout() {
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
          title: 'Início',
          headerShown: true,
          header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
          headerRight: () => <MainHeaderButtons />,
        }}
      />
    </Stack>
  );
}
