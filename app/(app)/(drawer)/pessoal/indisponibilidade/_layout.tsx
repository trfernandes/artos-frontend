import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function IndisponibilidadeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader leftButton='menu' {...props} />,
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Minhas Indisponibilidades', headerRight: () => <MainHeaderButtons /> }} />
    </Stack>
  );
}
