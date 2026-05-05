import { Stack } from 'expo-router';
import FancyPageHeader from '../../../../../components/header/FancyHeader';
import MainHeaderButtons from '../../../../../components/header/MainHeaderButtons';

export default function MinisterioFuncoesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: (props) => <FancyPageHeader {...props} />,
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Funções', headerShown: true,
 header: (props) => <FancyPageHeader leftButton='menu' {...props} />, headerRight: () => <MainHeaderButtons /> }} />
    </Stack>
  );
}
